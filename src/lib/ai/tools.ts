import {
  searchParts,
  searchBySymptom,
  getPartByNumber,
  getCompatibleParts,
  checkCompatibility,
  getAllParts,
  StoredPart,
  SearchResult,
} from "@/lib/db/simple-vector-store";
import { mockOrders, findOrderByNumber, createSupportTicket, CreateTicketParams } from "@/data/parts";
import { TicketIssueType, TicketPriority } from "@/types";
import {
  lookupPartWithGemini,
  lookupInstallationWithGemini,
  lookupCompatibilityWithGemini,
  lookupTroubleshootingWithGemini,
} from "./gemini-lookup";

const findSimilarPartNumbers = (inputPartNumber: string, limit: number = 3): StoredPart[] => {
  const allParts = getAllParts();
  const inputLower = inputPartNumber.toLowerCase();
  
  const scored = allParts.map(part => {
    const partLower = part.partNumber.toLowerCase();
    let score = 0;
    
    if (partLower.startsWith(inputLower.slice(0, 2))) score += 3;
    if (partLower.startsWith(inputLower.slice(0, 4))) score += 5;
    
    const inputDigits = inputLower.replace(/\D/g, '');
    const partDigits = partLower.replace(/\D/g, '');
    if (inputDigits && partDigits) {
      const matchingDigits = [...inputDigits].filter((d, i) => partDigits[i] === d).length;
      score += matchingDigits;
    }
    
    return { part, score };
  });
  
  return scored
    .filter(s => s.score > 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.part);
};

const getPartNotFoundMessage = (partNumber: string, context: string): string => {
  const similarParts = findSimilarPartNumbers(partNumber);
  
  let message = `Part number "${partNumber}" was not found in our database.`;
  
  if (similarParts.length > 0) {
    message += `\n\n**Did you mean one of these?**\n`;
    message += similarParts.map(p => `• **${p.partNumber}** - ${p.name} ($${p.price.toFixed(2)})`).join('\n');
  }
  
  message += `\n\n**Tips to find your part number:**
• Check the label on the existing part
• Look inside your appliance door for a parts diagram
• Part numbers starting with **PS** are PartSelect IDs
• Part numbers starting with **W** or **WP** are Whirlpool OEM numbers

**Need help?** Tell me your appliance model number and I can show you compatible parts!`;
  
  return message;
};

export interface ToolResult {
  success: boolean;
  data: unknown;
  message: string;
  isFromGemini?: boolean;
}

export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
  execute: (params: Record<string, string>) => Promise<ToolResult>;
}

const formatPartForDisplay = (part: StoredPart | SearchResult): string => {
  return `**${part.name}** (Part #${part.partNumber})
- Price: $${part.price.toFixed(2)}${part.originalPrice ? ` (was $${part.originalPrice.toFixed(2)})` : ""}
- Brand: ${part.brand}
- Rating: ${part.rating}/5 (${part.reviewCount} reviews)
- In Stock: ${part.inStock ? "Yes" : "No"}
- Installation: ${part.installationDifficulty} (${part.installationTime})
- Compatible Models: ${part.compatibleModels.slice(0, 5).join(", ")}${part.compatibleModels.length > 5 ? "..." : ""}`;
};

export const searchProductsTool: Tool = {
  name: "search_products",
  description: "Search for refrigerator or dishwasher parts by name, description, or keywords. Use this when the user is looking for a specific part or browsing parts.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query - part name, description, or keywords",
      },
      category: {
        type: "string",
        description: "Filter by appliance category",
        enum: ["refrigerator", "dishwasher"],
      },
      limit: {
        type: "string",
        description: "Maximum number of results to return (default 5, use higher for 'show all' requests)",
      },
      sortBy: {
        type: "string",
        description: "How to sort results",
        enum: ["relevance", "price", "rating", "reviews"],
      },
      sortOrder: {
        type: "string",
        description: "Sort order",
        enum: ["asc", "desc"],
      },
    },
    required: ["query"],
  },
  execute: async (params) => {
    const { query, category, limit, sortBy, sortOrder } = params;
    const maxResults = limit ? parseInt(limit, 10) : 5;
    const results = searchParts(query, {
      category: category as "refrigerator" | "dishwasher" | undefined,
      maxResults,
      sortBy: sortBy as "relevance" | "price" | "rating" | "reviews" | undefined,
      sortOrder: sortOrder as "asc" | "desc" | undefined,
    });

    if (results.length === 0) {
      const allParts = getAllParts();
      const categoryParts = category 
        ? allParts.filter(p => p.category === category) 
        : allParts;
      
      let message = `❌ **No parts found** matching "${query}"`;
      if (category) message += ` in ${category} parts`;
      message += `.\n\n`;
      
      message += `**Available ${category || 'demo'} parts:**\n`;
      categoryParts.slice(0, 5).forEach(p => {
        message += `• **${p.name}** (${p.partNumber}) - $${p.price.toFixed(2)}\n`;
      });
      
      message += `\n**Try:**\n`;
      message += `• Searching for: "ice maker", "water filter", "spray arm", "door gasket"\n`;
      message += `• Browsing: "Show me all refrigerator parts" or "dishwasher parts"`;
      
      return {
        success: false,
        data: [],
        message,
        isFromGemini: false,
      };
    }

    const formattedResults = results.map(formatPartForDisplay).join("\n\n");
    return {
      success: true,
      data: results,
      message: `Found ${results.length} parts matching "${query}":\n\n${formattedResults}`,
      isFromGemini: false,
    };
  },
};

export const checkCompatibilityTool: Tool = {
  name: "check_compatibility",
  description: "Check if a specific part is compatible with a given appliance model number. Use this when the user asks if a part will fit their appliance.",
  parameters: {
    type: "object",
    properties: {
      partNumber: {
        type: "string",
        description: "The part number to check (e.g., PS11752778)",
      },
      modelNumber: {
        type: "string",
        description: "The appliance model number (e.g., WDT780SAEM1)",
      },
    },
    required: ["partNumber", "modelNumber"],
  },
  execute: async (params) => {
    const { partNumber, modelNumber } = params;
    const result = checkCompatibility(partNumber, modelNumber);

    if (!result.part) {
      const similarParts = findSimilarPartNumbers(partNumber, 3);
      let message = `❌ **Part not found.** Part number "${partNumber}" is not in our database.\n\n`;
      
      if (similarParts.length > 0) {
        message += `**Did you mean one of these?**\n`;
        message += similarParts.map(p => `• **${p.partNumber}** - ${p.name} ($${p.price.toFixed(2)})`).join('\n');
        message += `\n\n`;
      }
      
      message += `**Tips:**\n`;
      message += `• Double-check the part number for typos\n`;
      message += `• PartSelect IDs start with **PS** (e.g., PS11752778)\n`;
      message += `• This demo includes 10 sample parts for refrigerators and dishwashers\n\n`;
      message += `**Available part numbers:** PS12364147, PS11752778, PS473177, PS2350702, PS11701542, PS7784009, PS12712308, PS16218716, PS12585623, PS1990907, PS11750092`;
      
      return {
        success: false,
        data: null,
        message,
        isFromGemini: false,
      };
    }

    if (result.isCompatible) {
      return {
        success: true,
        data: { isCompatible: true, part: result.part },
        message: `✅ **Yes, compatible!** Part ${partNumber} (${result.part.name}) IS compatible with model ${modelNumber}.\n\n${formatPartForDisplay(result.part)}`,
        isFromGemini: false,
      };
    } else {
      return {
        success: true,
        data: { isCompatible: false, part: result.part, compatibleModels: result.compatibleModels },
        message: `❌ **Not compatible.** Part ${partNumber} (${result.part.name}) is NOT compatible with model ${modelNumber}.\n\nThis part is compatible with: ${result.compatibleModels.join(", ")}\n\nWould you like me to find compatible parts for your ${modelNumber} model?`,
        isFromGemini: false,
      };
    }
  },
};

export const getCompatiblePartsTool: Tool = {
  name: "get_compatible_parts",
  description: "Find all parts that are compatible with a specific appliance model number. Use this when the user wants to see what parts fit their appliance.",
  parameters: {
    type: "object",
    properties: {
      modelNumber: {
        type: "string",
        description: "The appliance model number (e.g., WDT780SAEM1, WRS325SDHZ)",
      },
      limit: {
        type: "string",
        description: "Maximum number of results to return",
      },
      sortBy: {
        type: "string",
        description: "How to sort results",
        enum: ["relevance", "price", "rating", "reviews"],
      },
      sortOrder: {
        type: "string",
        description: "Sort order",
        enum: ["asc", "desc"],
      },
    },
    required: ["modelNumber"],
  },
  execute: async (params) => {
    const { modelNumber, limit, sortBy, sortOrder } = params;
    const maxResults = limit ? parseInt(limit, 10) : undefined;
    const parts = getCompatibleParts(modelNumber, {
      maxResults,
      sortBy: sortBy as "relevance" | "price" | "rating" | "reviews" | undefined,
      sortOrder: sortOrder as "asc" | "desc" | undefined,
    });

    if (parts.length === 0) {
      return {
        success: false,
        data: [],
        message: `**Model "${modelNumber}" was not found** in our database.

**This could mean:**
• The model number may have a typo
• We may not have this specific model in our system yet

**Where to find your model number:**
• Refrigerators: Inside the door, on the side wall, or on the back
• Dishwashers: Inside the door frame or on the side of the door

**Example valid model formats:**
• Whirlpool: WRS325SDHZ, WDT780SAEM1
• KitchenAid: KDTM354ESS, KRSC503ESS
• Maytag: MFI2570FEZ

**What you can do:**
1. Double-check your model number and try again
2. Tell me the **brand** and **appliance type** and I'll show you common parts
3. Describe your **problem** and I'll suggest parts that might help

How would you like to proceed?`,
        isFromGemini: false,
      };
    }

    const displayParts = maxResults ? parts : parts.slice(0, 6);
    const formattedParts = displayParts.map(formatPartForDisplay).join("\n\n");
    return {
      success: true,
      data: parts,
      message: `Found ${parts.length} compatible parts for model ${modelNumber}:\n\n${formattedParts}`,
      isFromGemini: false,
    };
  },
};

const troubleshootingGuides: Record<string, { steps: string[]; commonCauses: string[]; partsToCheck: string[] }> = {
  "ice maker not working": {
    steps: [
      "Check if the ice maker is turned ON (look for a switch or lever)",
      "Verify the water supply line is connected and turned on",
      "Check if the freezer temperature is cold enough (0°F / -18°C recommended)",
      "Inspect for ice jams in the ice maker or ejector arm",
      "Listen for clicking sounds - this indicates the ice maker is trying to work",
      "Check the water filter - a clogged filter can restrict water flow",
    ],
    commonCauses: [
      "Frozen water line (use a hair dryer on low to thaw)",
      "Faulty water inlet valve",
      "Defective ice maker assembly",
      "Clogged or old water filter",
      "Temperature too warm in freezer",
    ],
    partsToCheck: ["water filter", "ice maker assembly", "water inlet valve"],
  },
  "not making ice": {
    steps: [
      "Check if the ice maker is turned ON (look for a switch or lever)",
      "Verify the water supply line is connected and turned on",
      "Check if the freezer temperature is cold enough (0°F / -18°C recommended)",
      "Inspect for ice jams in the ice maker or ejector arm",
      "Check the water filter - a clogged filter can restrict water flow",
    ],
    commonCauses: [
      "Frozen water line",
      "Faulty water inlet valve",
      "Defective ice maker assembly",
      "Clogged water filter",
    ],
    partsToCheck: ["water filter", "ice maker assembly"],
  },
  "fridge not cold": {
    steps: [
      "Check if the temperature control is set correctly",
      "Ensure vents inside the fridge aren't blocked by food",
      "Clean the condenser coils (usually at the back or bottom)",
      "Check if the door seals properly - use the dollar bill test",
      "Listen for the compressor running - you should hear a humming sound",
      "Check if the evaporator fan is running (you should feel air flow)",
    ],
    commonCauses: [
      "Dirty condenser coils",
      "Faulty evaporator fan motor",
      "Defrost system failure",
      "Worn door gasket letting warm air in",
      "Thermostat issues",
    ],
    partsToCheck: ["evaporator fan", "defrost thermostat", "door gasket"],
  },
  "dishwasher not draining": {
    steps: [
      "Check if the drain hose is kinked or clogged",
      "Clean the filter and trap at the bottom of the dishwasher",
      "Run the garbage disposal if connected (clears shared drain)",
      "Check for food debris blocking the drain pump",
      "Verify the high loop or air gap is properly installed",
    ],
    commonCauses: [
      "Clogged drain filter or trap",
      "Blocked drain hose",
      "Faulty drain pump",
      "Food debris in the sump area",
    ],
    partsToCheck: ["drain pump", "pump and motor assembly"],
  },
  "dishwasher not cleaning": {
    steps: [
      "Clean the spray arms - remove and rinse under water, clear clogged holes with a toothpick",
      "Check and clean the filter at the bottom of the dishwasher",
      "Verify you're using the correct amount of detergent",
      "Run hot water at the sink before starting the dishwasher",
      "Check that dishes aren't blocking the spray arms from spinning",
    ],
    commonCauses: [
      "Clogged spray arm holes",
      "Dirty filter",
      "Low water temperature",
      "Faulty pump not providing enough pressure",
      "Hard water buildup",
    ],
    partsToCheck: ["spray arm", "pump and motor assembly", "water inlet valve"],
  },
  "dishwasher won't start": {
    steps: [
      "Make sure the door is fully closed and latched",
      "Check if the control panel displays any error codes",
      "Verify the dishwasher is receiving power (check outlet/breaker)",
      "Try pressing and holding the Start button for 3 seconds",
      "Check if the door latch clicks when closed",
    ],
    commonCauses: [
      "Door latch not engaging properly",
      "Faulty door switch",
      "Control board issues",
      "Power supply problem",
    ],
    partsToCheck: ["door latch assembly", "door switch"],
  },
  "frost buildup": {
    steps: [
      "Check if the door seals completely (use the dollar bill test)",
      "Verify the defrost timer is working",
      "Check if the defrost heater is functioning",
      "Ensure the evaporator fan is running",
      "Check for blocked air vents in the freezer",
    ],
    commonCauses: [
      "Faulty defrost thermostat",
      "Defective defrost heater",
      "Damaged door gasket",
      "Failed defrost timer",
    ],
    partsToCheck: ["defrost thermostat", "door gasket"],
  },
};

const findTroubleshootingGuide = (symptom: string): { steps: string[]; commonCauses: string[]; partsToCheck: string[] } | null => {
  const lowerSymptom = symptom.toLowerCase();
  
  for (const [key, guide] of Object.entries(troubleshootingGuides)) {
    if (lowerSymptom.includes(key) || key.includes(lowerSymptom)) {
      return guide;
    }
  }
  
  const keywords: Record<string, string> = {
    "ice": "ice maker not working",
    "cold": "fridge not cold",
    "warm": "fridge not cold",
    "drain": "dishwasher not draining",
    "clean": "dishwasher not cleaning",
    "dirty dishes": "dishwasher not cleaning",
    "won't start": "dishwasher won't start",
    "not starting": "dishwasher won't start",
    "frost": "frost buildup",
    "freezing": "frost buildup",
  };
  
  for (const [keyword, guideKey] of Object.entries(keywords)) {
    if (lowerSymptom.includes(keyword)) {
      return troubleshootingGuides[guideKey] || null;
    }
  }
  
  return null;
};

export const troubleshootIssueTool: Tool = {
  name: "troubleshoot_issue",
  description: "Help diagnose an appliance problem and recommend parts that might fix it. Use this when the user describes a symptom or issue with their refrigerator or dishwasher.",
  parameters: {
    type: "object",
    properties: {
      symptom: {
        type: "string",
        description: "The problem or symptom the user is experiencing (e.g., 'ice maker not working', 'dishwasher won't drain')",
      },
      applianceType: {
        type: "string",
        description: "The type of appliance having the issue",
        enum: ["refrigerator", "dishwasher"],
      },
      limit: {
        type: "string",
        description: "Maximum number of results to return",
      },
    },
    required: ["symptom"],
  },
  execute: async (params) => {
    const { symptom, applianceType, limit } = params;
    const maxResults = limit ? parseInt(limit, 10) : 3;
    const results = searchBySymptom(symptom, {
      category: applianceType as "refrigerator" | "dishwasher" | undefined,
      maxResults,
    });

    const guide = findTroubleshootingGuide(symptom);

    if (results.length === 0 && !guide) {
      const geminiResult = await lookupTroubleshootingWithGemini(
        symptom,
        applianceType as "refrigerator" | "dishwasher" | undefined
      );
      return {
        success: geminiResult.success,
        data: [],
        message: geminiResult.message,
        isFromGemini: true,
      };
    }

    let message = `## Troubleshooting: ${symptom}\n\n`;

    if (guide) {
      message += `### Try These Steps First\n`;
      guide.steps.forEach((step, i) => {
        message += `${i + 1}. ${step}\n`;
      });

      message += `\n### Common Causes\n`;
      guide.commonCauses.forEach(cause => {
        message += `• ${cause}\n`;
      });
    }

    if (results.length > 0) {
      message += `\n### If Steps Don't Help - These Parts Often Fix This Issue\n\n`;
      const formattedResults = results.map((part) => {
        const symptomsText = part.symptoms?.length
          ? `\n- Fixes symptoms: ${part.symptoms.slice(0, 3).join(", ")}`
          : "";
        return `${formatPartForDisplay(part)}${symptomsText}`;
      }).join("\n\n");
      message += formattedResults;
    }

    message += `\n\n### Safety Reminders\n`;
    message += `⚠️ Always unplug the appliance before any repairs\n`;
    message += `📸 Take photos of wire connections before disconnecting\n`;
    message += `🔧 If unsure about any step, consult a qualified technician`;

    return {
      success: true,
      data: results,
      message,
      isFromGemini: false,
    };
  },
};

export const getInstallationHelpTool: Tool = {
  name: "get_installation_help",
  description: "Get installation information for a specific part. Use this when the user asks how to install a part.",
  parameters: {
    type: "object",
    properties: {
      partNumber: {
        type: "string",
        description: "The part number to get installation help for",
      },
    },
    required: ["partNumber"],
  },
  execute: async (params) => {
    const { partNumber } = params;
    const part = getPartByNumber(partNumber);

    if (!part) {
      const similarParts = findSimilarPartNumbers(partNumber, 3);
      let message = `❌ **Part not found.** Part number "${partNumber}" is not in our database.\n\n`;
      
      if (similarParts.length > 0) {
        message += `**Did you mean one of these?**\n`;
        message += similarParts.map(p => `• **${p.partNumber}** - ${p.name}`).join('\n');
        message += `\n\n`;
      }
      
      message += `**Available parts with installation guides:**\n`;
      const allParts = getAllParts();
      const sampleParts = allParts.slice(0, 5);
      message += sampleParts.map(p => `• **${p.partNumber}** - ${p.name} (${p.installationDifficulty})`).join('\n');
      message += `\n\nTry asking: "How do I install part PS12364147?"`;
      
      return {
        success: false,
        data: null,
        message,
        isFromGemini: false,
      };
    }

    const installationGuide = `## Installation Guide for ${part.name}

**Part Number:** ${part.partNumber}
**Difficulty Level:** ${part.installationDifficulty}
**Estimated Time:** ${part.installationTime}

### Before You Begin
1. **Safety First:** Unplug the appliance or turn off the circuit breaker
2. **Gather Tools:** You'll typically need a Phillips screwdriver, flat-head screwdriver, and possibly pliers
3. **Take Photos:** Document wire connections and part positions before removal

### General Installation Steps
1. Locate the existing part in your ${part.category}
2. Disconnect any electrical connections (note wire colors/positions)
3. Remove any mounting screws or clips
4. Carefully remove the old part
5. Install the new part in reverse order
6. Reconnect all wires to their original positions
7. Secure with mounting hardware
8. Restore power and test operation

### Compatible Models
This part fits: ${part.compatibleModels.join(", ")}

### Need More Help?
- Search YouTube for "${part.partNumber} installation"
- Visit PartSelect.com for detailed repair guides
- Consider hiring a professional for difficult installations

⚠️ **Safety Note:** If you're uncomfortable with any step, please consult a qualified appliance repair technician.`;

    return {
      success: true,
      data: part,
      message: installationGuide,
      isFromGemini: false,
    };
  },
};

export const checkOrderStatusTool: Tool = {
  name: "check_order_status",
  description: "Check the status of an order. Use this when the user wants to track their order.",
  parameters: {
    type: "object",
    properties: {
      orderNumber: {
        type: "string",
        description: "The order number (format: PS-XXXX-XXXXX)",
      },
    },
    required: ["orderNumber"],
  },
  execute: async (params) => {
    const { orderNumber } = params;
    const order = findOrderByNumber(orderNumber);

    if (!order) {
      return {
        success: false,
        data: null,
        message: `Order "${orderNumber}" was not found in our system.

**Please verify your order number:**
• Format should be: **PS-XXXX-XXXXX** (e.g., PS-2024-78542)
• Check your order confirmation email
• Look for the order number on your receipt

**Sample orders for testing:**
• PS-2024-78542 (Shipped)
• PS-2024-78123 (Delivered)
• PS-2024-79001 (Processing)

If you can't find your order number, please contact PartSelect customer service.`,
        isFromGemini: false,
      };
    }

    const statusEmoji: Record<string, string> = {
      processing: "📦",
      shipped: "🚚",
      delivered: "✅",
      cancelled: "❌",
    };

    const itemsList = order.items
      .map((item) => `- ${item.name} (${item.partNumber}) x${item.quantity} - $${item.price.toFixed(2)}`)
      .join("\n");

    const totalPrice = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let statusMessage = `## Order Status: ${order.orderNumber}

${statusEmoji[order.status]} **Status:** ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}

### Items Ordered
${itemsList}

**Order Total:** $${totalPrice.toFixed(2)}`;

    if (order.trackingNumber) {
      statusMessage += `\n\n**Tracking Number:** ${order.trackingNumber}`;
    }
    if (order.estimatedDelivery) {
      statusMessage += `\n**Estimated Delivery:** ${order.estimatedDelivery}`;
    }

    return {
      success: true,
      data: order,
      message: statusMessage,
      isFromGemini: false,
    };
  },
};

export const createSupportTicketTool: Tool = {
  name: "create_support_ticket",
  description: "Create a support ticket for issues that require human assistance. Use this when the user explicitly requests support, shows frustration after multiple failed attempts, or has issues beyond DIY repair scope.",
  parameters: {
    type: "object",
    properties: {
      customerName: {
        type: "string",
        description: "Customer's full name",
      },
      customerEmail: {
        type: "string",
        description: "Customer's email address for follow-up",
      },
      customerPhone: {
        type: "string",
        description: "Customer's phone number (optional)",
      },
      issueType: {
        type: "string",
        description: "Type of issue",
        enum: ["product_issue", "order_issue", "installation_help", "warranty", "refund", "other"],
      },
      applianceType: {
        type: "string",
        description: "Type of appliance",
        enum: ["refrigerator", "dishwasher"],
      },
      modelNumber: {
        type: "string",
        description: "Appliance model number if known",
      },
      partNumber: {
        type: "string",
        description: "Part number if relevant",
      },
      issueDescription: {
        type: "string",
        description: "Detailed description of the issue",
      },
      conversationSummary: {
        type: "string",
        description: "Summary of the conversation context",
      },
      stepsAlreadyTried: {
        type: "string",
        description: "Comma-separated list of steps already attempted",
      },
      priority: {
        type: "string",
        description: "Ticket priority level",
        enum: ["low", "normal", "high", "urgent"],
      },
    },
    required: ["customerName", "customerEmail", "issueType", "issueDescription"],
  },
  execute: async (params) => {
    const ticketParams: CreateTicketParams = {
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      issueType: params.issueType as TicketIssueType,
      applianceType: params.applianceType as "refrigerator" | "dishwasher" | undefined,
      modelNumber: params.modelNumber,
      partNumber: params.partNumber,
      issueDescription: params.issueDescription,
      conversationSummary: params.conversationSummary || "",
      stepsAlreadyTried: params.stepsAlreadyTried ? params.stepsAlreadyTried.split(",").map(s => s.trim()) : [],
      priority: (params.priority as TicketPriority) || "normal",
    };

    const ticket = createSupportTicket(ticketParams);

    const priorityEmoji: Record<string, string> = {
      low: "🟢",
      normal: "🟡",
      high: "🟠",
      urgent: "🔴",
    };

    return {
      success: true,
      data: ticket,
      message: `## Support Ticket Created Successfully!

**Ticket Number:** ${ticket.ticketNumber}
**Status:** ${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
**Priority:** ${priorityEmoji[ticket.priority]} ${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}

### Issue Summary
${ticket.issueDescription}

### What Happens Next
Our support team will review your ticket and contact you at **${ticket.customerEmail}** within 24 hours.

If this is an urgent matter, please call our support line at 1-800-PARTSELECT.

Is there anything else I can help you with?`,
      isFromGemini: false,
    };
  },
};

export const allTools: Tool[] = [
  searchProductsTool,
  checkCompatibilityTool,
  getCompatiblePartsTool,
  troubleshootIssueTool,
  getInstallationHelpTool,
  checkOrderStatusTool,
  createSupportTicketTool,
];

export const getToolByName = (name: string): Tool | undefined => {
  return allTools.find((tool) => tool.name === name);
};

export const getToolDefinitions = () => {
  return allTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  }));
};
