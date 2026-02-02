import { allTools, getToolByName, Tool, ToolResult } from "./tools";
import { StoredPart } from "@/lib/db/simple-vector-store";
import { generateAIResponse, isAIAvailable, getCurrentProvider } from "./providers";

const SYSTEM_PROMPT = `You are a helpful customer service assistant for PartSelect, an e-commerce website specializing in appliance replacement parts.

## Your Specialization
You ONLY help with **refrigerator** and **dishwasher** parts. You must politely decline requests about other appliances.

## Your Capabilities
1. **Search for parts** - Find parts by name, description, or keywords
2. **Check compatibility** - Verify if a part works with a specific model
3. **Troubleshoot issues** - Diagnose problems and recommend solutions
4. **Installation guidance** - Provide installation help for parts
5. **Order tracking** - Check order status

## Important Guidelines
- Always be helpful, professional, and concise
- When showing products, include the part number, price, and key details
- For compatibility questions, always confirm with the check_compatibility tool
- For troubleshooting, identify the appliance type and use the troubleshoot_issue tool
- If a question is outside your scope (other appliances, general questions), politely redirect
- Never make up part numbers or compatibility information - use the tools

## Response Style
- Be conversational but informative
- Use bullet points for lists
- Bold important information like part numbers and prices
- Include actionable next steps when appropriate`;

const OFF_TOPIC_RESPONSE = `I specialize in helping with **refrigerator and dishwasher parts** only. I can assist you with:

• 🔍 Finding parts by name or part number
• ✅ Checking if a part is compatible with your appliance model
• 🔧 Troubleshooting issues and recommending solutions
• 📋 Getting installation instructions
• 📦 Tracking your order status

For questions about other appliances (washers, dryers, ovens, etc.), please visit [PartSelect.com](https://www.partselect.com) or contact customer service.

How can I help you with your refrigerator or dishwasher today?`;

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

const detectIntent = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (/(where.*(find|locate|is).*(model|serial)|find.*(my|the).*(model|serial)|how.*find.*model|locate.*model.*number)/i.test(lowerMessage)) {
    return "find_model_number";
  }
  
  if (/(order|track|shipping|delivery|where.+order)/i.test(lowerMessage) && /ps-\d{4}-\d{5}/i.test(message)) {
    return "order_status";
  }
  
  if (/(any of the above|these products|which one should|help me choose|help me decide)/i.test(lowerMessage)) {
    return "clarification";
  }
  
  if (/(install|how.+to.+install|installation|instructions|replace|remove|put.+in|set.+up)/i.test(lowerMessage)) {
    return "installation";
  }
  
  if (/(compatible|fit|work.+with|match|does.+fit|will.+work)/i.test(lowerMessage)) {
    return "compatibility";
  }
  
  if (/(not working|broken|problem|issue|won't|doesn't|isn't|fix|repair|stopped|noise|leak)/i.test(lowerMessage)) {
    return "troubleshooting";
  }
  
  if (/(find|search|looking|need|show|parts|where|buy|get)/i.test(lowerMessage)) {
    return "search";
  }
  
  if (/(washer|dryer|oven|stove|microwave|range|vacuum|air conditioner)/i.test(lowerMessage) && 
      !/(dishwasher)/i.test(lowerMessage)) {
    return "off_topic";
  }
  
  if (/(weather|sports|news|recipe|movie|joke|hello|hi|hey)/i.test(lowerMessage) && 
      !/(refrigerator|fridge|dishwasher|ice|cooling|freezer|drain)/i.test(lowerMessage)) {
    return "off_topic";
  }
  
  return "general";
};

const PART_NUMBER_PATTERNS = [
  /PS\d{8}/i,
  /WP?W?\d{8,}/i,
  /[A-Z]{2,3}\d{7,}/i,
];

const MODEL_PATTERNS = [
  /WDT\d{3}[A-Z0-9]+/i,
  /WRS\d{3}[A-Z0-9]+/i,
  /WRF\d{3}[A-Z0-9]+/i,
  /WRX\d{3}[A-Z0-9]+/i,
  /KDTM?\d{3}[A-Z0-9]+/i,
  /KRSC\d{3}[A-Z0-9]+/i,
  /GSS\d{2}[A-Z0-9]+/i,
  /GFE\d{2}[A-Z0-9]+/i,
  /GDF\d{3}[A-Z0-9]+/i,
  /RF\d{2,3}[A-Z0-9]+/i,
  /FFCD\d{4}[A-Z0-9]+/i,
  /FGID\d{4}[A-Z0-9]+/i,
  /LDF\d{4}[A-Z0-9]+/i,
  /SHPM\d{2}[A-Z0-9]+/i,
  /MFI\d{4}[A-Z0-9]+/i,
  /ED\d[A-Z0-9]+/i,
];

const extractPartNumber = (text: string): string | null => {
  for (const pattern of PART_NUMBER_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0].toUpperCase();
  }
  return null;
};

const extractModelNumber = (text: string): string | null => {
  for (const pattern of MODEL_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0].toUpperCase();
  }
  
  const genericModelMatch = text.match(/(?:model(?:\s+(?:number|#|no\.?)?)?\s*(?:is)?|for\s+model)\s*[:\s]?\s*([A-Z0-9][A-Z0-9-]{4,})/i);
  if (genericModelMatch) return genericModelMatch[1].toUpperCase();
  
  const myModelMatch = text.match(/my\s+(?:model(?:\s+number)?|appliance)\s+(?:is\s+)?([A-Z0-9][A-Z0-9-]{4,})/i);
  if (myModelMatch) return myModelMatch[1].toUpperCase();
  
  return null;
};

const extractApplianceType = (text: string): "refrigerator" | "dishwasher" | null => {
  const lower = text.toLowerCase();
  if (lower.includes("refrigerator") || lower.includes("fridge") || lower.includes("freezer") || lower.includes("ice maker")) {
    return "refrigerator";
  }
  if (lower.includes("dishwasher")) {
    return "dishwasher";
  }
  return null;
};

const extractParameters = (
  message: string,
  conversationHistory: ConversationMessage[] = []
): Record<string, string> => {
  const params: Record<string, string> = {};
  
  const partNumber = extractPartNumber(message);
  if (partNumber) params.partNumber = partNumber;
  
  const modelNumber = extractModelNumber(message);
  if (modelNumber) params.modelNumber = modelNumber;
  
  const orderMatch = message.match(/PS-\d{4}-\d{5}/i);
  if (orderMatch) params.orderNumber = orderMatch[0].toUpperCase();
  
  const applianceType = extractApplianceType(message);
  if (applianceType) params.applianceType = applianceType;
  
  if (!params.partNumber || !params.modelNumber || !params.applianceType) {
    const userMessages = [...conversationHistory]
      .filter(msg => msg.role === "user")
      .reverse()
      .slice(0, 10);
    
    for (const msg of userMessages) {
      if (!params.partNumber) {
        const historyPartNumber = extractPartNumber(msg.content);
        if (historyPartNumber) params.partNumber = historyPartNumber;
      }
      
      if (!params.modelNumber) {
        const historyModelNumber = extractModelNumber(msg.content);
        if (historyModelNumber) params.modelNumber = historyModelNumber;
      }
      
      if (!params.applianceType) {
        const historyApplianceType = extractApplianceType(msg.content);
        if (historyApplianceType) params.applianceType = historyApplianceType;
      }
      
      if (params.partNumber && params.modelNumber && params.applianceType) break;
    }
  }
  
  console.log("Extracted params (with memory):", params);
  return params;
};

const selectTool = (intent: string, params: Record<string, string>): { tool: Tool; params: Record<string, string> } | null => {
  switch (intent) {
    case "order_status":
      if (params.orderNumber) {
        return { tool: getToolByName("check_order_status")!, params: { orderNumber: params.orderNumber } };
      }
      break;
      
    case "installation":
      if (params.partNumber) {
        return { tool: getToolByName("get_installation_help")!, params: { partNumber: params.partNumber } };
      }
      return null;
      
    case "compatibility":
      if (params.partNumber && params.modelNumber) {
        return { tool: getToolByName("check_compatibility")!, params };
      }
      if (params.modelNumber) {
        return { tool: getToolByName("get_compatible_parts")!, params: { modelNumber: params.modelNumber } };
      }
      break;
      
    case "troubleshooting":
      return { tool: getToolByName("troubleshoot_issue")!, params: {} };
      
    case "search":
      if (params.modelNumber) {
        return { tool: getToolByName("get_compatible_parts")!, params: { modelNumber: params.modelNumber } };
      }
      return { tool: getToolByName("search_products")!, params: {} };
      
    case "general":
      if (params.modelNumber) {
        return { tool: getToolByName("get_compatible_parts")!, params: { modelNumber: params.modelNumber } };
      }
      break;
  }
  
  return null;
};

export interface AgentResponse {
  message: string;
  products: StoredPart[];
  toolUsed?: string;
  intent: string;
  dataSource: "database" | "gemini_fallback" | "gemini_enhanced";
}

export const runAgent = async (
  userMessage: string,
  conversationHistory: ConversationMessage[] = []
): Promise<AgentResponse> => {
  const intent = detectIntent(userMessage);
  
  if (intent === "off_topic") {
    return {
      message: OFF_TOPIC_RESPONSE,
      products: [],
      intent: "off_topic",
      dataSource: "database",
    };
  }
  
  if (intent === "find_model_number") {
    const findModelResponse = `## How to Find Your Model Number

**For Refrigerators:**
- Check inside the fresh food section, on the sidewall
- Look on the door frame (visible when door is open)
- Check behind the crisper drawers at the bottom
- Sometimes on the back of the unit

**For Dishwashers:**
- Open the door and look along the top edge or side of the door opening
- Check the left or right side of the tub interior
- Sometimes on the kick plate at the bottom

**Model Number Format Examples:**
- Whirlpool: WRS325SDHZ, WDT780SAEM1
- GE: GSS25GSHSS, GDF630PSMSS
- Samsung: RF28R7351SR
- LG: LRMVS3006S

Once you find your model number, let me know and I can help you find compatible parts!`;
    
    return {
      message: findModelResponse,
      products: [],
      intent: "find_model_number",
      dataSource: "database",
    };
  }
  
  if (intent === "clarification") {
    const clarificationResponse = `Of course! I'd be happy to help. Could you please tell me:

1. **Which specific product** would you like help with? (You can mention the part number like PS11752778)
2. **What would you like to do?**
   - Get installation instructions
   - Check if it's compatible with your appliance
   - Learn more about the product
   - Something else?

Just let me know and I'll assist you right away!`;
    
    return {
      message: clarificationResponse,
      products: [],
      intent: "clarification",
      dataSource: "database",
    };
  }
  
  const params = extractParameters(userMessage, conversationHistory);
  const toolSelection = selectTool(intent, params);
  
  let toolResult: ToolResult | null = null;
  let toolUsed: string | undefined;
  
  if (toolSelection) {
    const { tool, params: toolParams } = toolSelection;
    toolUsed = tool.name;
    
    if (tool.name === "search_products") {
      toolParams.query = userMessage;
      if (params.applianceType) {
        toolParams.category = params.applianceType;
      }
    } else if (tool.name === "troubleshoot_issue") {
      toolParams.symptom = userMessage;
      if (params.applianceType) {
        toolParams.applianceType = params.applianceType;
      }
    }
    
    toolResult = await tool.execute(toolParams);
  }
  
  const products: StoredPart[] = toolResult?.data && Array.isArray(toolResult.data) 
    ? toolResult.data.slice(0, 4)
    : toolResult?.data?.part 
      ? [toolResult.data.part]
      : [];
  
  let responseMessage = "";
  
  const aiAvailable = isAIAvailable();
  const currentProvider = getCurrentProvider();
  console.log(`AI available: ${aiAvailable}, Provider: ${currentProvider}`);
  
  if (aiAvailable) {
    try {
      console.log(`Calling ${currentProvider} API...`);
      
      const contextMessage = toolResult 
        ? `The user asked: "${userMessage}"\n\nI used the ${toolUsed} tool and got this result:\n${toolResult.message}\n\nPlease provide a helpful, conversational response based on this information. Keep it concise but informative.`
        : `The user asked: "${userMessage}"\n\nPlease provide a helpful response. If they're asking about refrigerator or dishwasher parts, guide them on how you can help.`;
      
      const aiResponse = await generateAIResponse(contextMessage, SYSTEM_PROMPT);
      
      if (aiResponse.text) {
        responseMessage = aiResponse.text;
        console.log(`${aiResponse.provider} response received successfully`);
      } else {
        responseMessage = toolResult?.message || generateFallbackResponse(intent, userMessage, params);
      }
    } catch (error) {
      console.error("AI API error:", error);
      responseMessage = toolResult?.message || generateFallbackResponse(intent, userMessage, params);
    }
  } else {
    console.log("Using fallback response (no AI key configured)");
    responseMessage = toolResult?.message || generateFallbackResponse(intent, userMessage, params);
  }
  
  const isFromAIFallback = toolResult?.isFromGemini === true;
  const dataSource = isFromAIFallback 
    ? "gemini_fallback" 
    : aiAvailable 
      ? "gemini_enhanced" 
      : "database";
  
  return {
    message: responseMessage,
    products,
    toolUsed,
    intent,
    dataSource,
  };
};

const generateFallbackResponse = (intent: string, message: string, params: Record<string, string>): string => {
  switch (intent) {
    case "compatibility":
      if (!params.modelNumber && !params.partNumber) {
        return "To check compatibility, please provide:\n\n• Your **appliance model number** (found inside the door or on the back)\n• The **part number** you're interested in\n\nFor example: \"Is PS11752778 compatible with WDT780SAEM1?\"";
      }
      if (!params.partNumber) {
        return `I found your model number ${params.modelNumber}. What part number would you like to check for compatibility?`;
      }
      return `Please provide your appliance model number so I can check if ${params.partNumber} is compatible.`;
      
    case "installation":
      if (!params.partNumber) {
        return "To provide installation instructions, please give me the **part number** of the item you need help installing.\n\nFor example: \"How do I install PS11752778?\"";
      }
      break;
      
    case "order_status":
      return "To check your order status, please provide your **order number** in the format PS-XXXX-XXXXX.\n\nYou can find this in your order confirmation email.";
      
    case "troubleshooting":
      return "I'd be happy to help troubleshoot your appliance! Please describe:\n\n1. **What type of appliance** - refrigerator or dishwasher?\n2. **What's the problem** - what symptoms are you experiencing?\n\nFor example: \"My refrigerator ice maker stopped working\" or \"My dishwasher won't drain\"";
      
    default:
      return "I can help you find refrigerator and dishwasher parts! You can:\n\n• **Search for parts** - \"Show me ice makers\" or \"water filter\"\n• **Check compatibility** - \"Is PS11752778 compatible with WDT780SAEM1?\"\n• **Troubleshoot** - \"My ice maker isn't working\"\n• **Get installation help** - \"How do I install PS11752778?\"\n• **Track orders** - \"Check order PS-2024-78542\"\n\nWhat would you like help with?";
  }
  
  return "How can I help you with your refrigerator or dishwasher parts today?";
};
