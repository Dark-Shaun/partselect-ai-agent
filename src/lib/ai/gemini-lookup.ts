import { generateAIResponse, isAIAvailable, AIProvider } from "./providers";

export interface AILookupResult {
  success: boolean;
  partNumber: string;
  partName?: string;
  description?: string;
  installationInfo?: string;
  compatibilityInfo?: string;
  message: string;
  isFromAI: true;
  provider?: AIProvider;
}

export type GeminiLookupResult = AILookupResult;

export const lookupPartWithGemini = async (partNumber: string): Promise<AILookupResult> => {
  if (!isAIAvailable()) {
    return {
      success: false,
      partNumber,
      message: `Part "${partNumber}" was not found in our database. Please verify the part number or visit PartSelect.com to search.`,
      isFromAI: true,
    };
  }

  try {
    const prompt = `You are a PartSelect appliance parts expert. A customer is asking about part number "${partNumber}".

Based on your knowledge of appliance replacement parts (refrigerators and dishwashers specifically), provide information about this part:

1. **Part Name**: What is this part called?
2. **Function**: What does this part do?
3. **Common Appliances**: What refrigerator/dishwasher brands and models typically use this part?
4. **Typical Price Range**: What's the approximate price range?
5. **Common Issues**: What problems does replacing this part typically fix?

IMPORTANT RULES:
- Only answer about refrigerator and dishwasher parts
- If you're not confident about this specific part number, say so honestly
- Keep the response concise and helpful
- Always mention that the customer should verify exact compatibility on PartSelect.com

Format your response in a friendly, helpful manner.`;

    const response = await generateAIResponse(prompt);
    
    if (!response.text) {
      throw new Error("Empty response from AI");
    }
    
    return {
      success: true,
      partNumber,
      message: `${response.text}\n\n---\n*This information is based on AI knowledge. For verified pricing, availability, and compatibility, please visit [PartSelect.com](https://www.partselect.com/PS${partNumber.replace(/^PS/i, '')}.htm)*`,
      isFromAI: true,
      provider: response.provider,
    };
  } catch (error) {
    console.error("AI lookup error:", error);
    return {
      success: false,
      partNumber,
      message: `I couldn't find part "${partNumber}" in our database. Please verify the part number or visit [PartSelect.com](https://www.partselect.com) to search for this part.`,
      isFromAI: true,
    };
  }
};

export const lookupInstallationWithGemini = async (partNumber: string): Promise<AILookupResult> => {
  if (!isAIAvailable()) {
    return {
      success: false,
      partNumber,
      message: `Part "${partNumber}" was not found in our database. For installation instructions, please visit PartSelect.com.`,
      isFromAI: true,
    };
  }

  try {
    const prompt = `You are a PartSelect appliance repair expert. A customer needs installation help for part number "${partNumber}".

Provide installation guidance including:

1. **Part Identification**: What is this part?
2. **Tools Needed**: What tools are typically required?
3. **Safety Precautions**: Important safety steps before starting
4. **Installation Steps**: Step-by-step general installation guide
5. **Difficulty Level**: Easy, Moderate, or Difficult
6. **Estimated Time**: How long does this typically take?

IMPORTANT RULES:
- Focus on refrigerator and dishwasher parts only
- Emphasize safety (unplug appliance, etc.)
- If unsure about this specific part, provide general guidance for similar parts
- Recommend professional help for complex installations
- Always suggest watching video tutorials for visual guidance

Keep the response practical and actionable.`;

    const response = await generateAIResponse(prompt);
    
    if (!response.text) {
      throw new Error("Empty response from AI");
    }
    
    return {
      success: true,
      partNumber,
      installationInfo: response.text,
      message: `${response.text}\n\n---\n*This installation guide is based on AI knowledge. For part-specific instructions and videos, visit [PartSelect.com](https://www.partselect.com/PS${partNumber.replace(/^PS/i, '')}.htm)*`,
      isFromAI: true,
      provider: response.provider,
    };
  } catch (error) {
    console.error("AI installation lookup error:", error);
    return {
      success: false,
      partNumber,
      message: `I couldn't find installation information for "${partNumber}". Please visit [PartSelect.com](https://www.partselect.com) for detailed installation guides and videos.`,
      isFromAI: true,
    };
  }
};

export const lookupCompatibilityWithGemini = async (
  partNumber: string,
  modelNumber: string
): Promise<AILookupResult> => {
  if (!isAIAvailable()) {
    return {
      success: false,
      partNumber,
      message: `I couldn't verify compatibility. Please check PartSelect.com for accurate compatibility information.`,
      isFromAI: true,
    };
  }

  try {
    const prompt = `You are a PartSelect appliance compatibility expert. A customer wants to know if part "${partNumber}" is compatible with their appliance model "${modelNumber}".

Please help determine compatibility:

1. **Part Identification**: What is part ${partNumber}?
2. **Appliance Identification**: What type of appliance is model ${modelNumber}? (brand, type)
3. **Compatibility Assessment**: Based on your knowledge, are these likely compatible?
4. **Reasoning**: Why or why not?

IMPORTANT RULES:
- Only assess refrigerator and dishwasher compatibility
- Be honest if you're uncertain - compatibility must be verified
- If model/part numbers don't seem valid, say so
- ALWAYS recommend verifying on PartSelect.com before purchasing
- Never give a definitive "yes" without being certain - when in doubt, recommend verification

Keep the response helpful but emphasize the need to verify before purchasing.`;

    const response = await generateAIResponse(prompt);
    
    if (!response.text) {
      throw new Error("Empty response from AI");
    }
    
    return {
      success: true,
      partNumber,
      compatibilityInfo: response.text,
      message: `${response.text}\n\n---\n*Compatibility information is based on AI knowledge. **Please verify exact compatibility** on [PartSelect.com](https://www.partselect.com/PS${partNumber.replace(/^PS/i, '')}.htm) before purchasing.*`,
      isFromAI: true,
      provider: response.provider,
    };
  } catch (error) {
    console.error("AI compatibility lookup error:", error);
    return {
      success: false,
      partNumber,
      message: `I couldn't verify if ${partNumber} is compatible with ${modelNumber}. Please check [PartSelect.com](https://www.partselect.com) for accurate compatibility information.`,
      isFromAI: true,
    };
  }
};

export const lookupTroubleshootingWithGemini = async (
  symptom: string,
  applianceType?: "refrigerator" | "dishwasher"
): Promise<AILookupResult> => {
  if (!isAIAvailable()) {
    return {
      success: false,
      partNumber: "",
      message: `For troubleshooting help, please visit PartSelect.com.`,
      isFromAI: true,
    };
  }

  try {
    const applianceContext = applianceType ? `${applianceType}` : "refrigerator or dishwasher";
    
    const prompt = `You are a PartSelect appliance repair expert. A customer has a ${applianceContext} with this problem: "${symptom}"

Provide troubleshooting help:

1. **Problem Analysis**: What could be causing this issue?
2. **Common Causes**: List the most likely causes (ranked by probability)
3. **Parts That Might Need Replacement**: What parts typically fix this issue?
4. **DIY Assessment**: Can this be fixed by a homeowner or needs a professional?
5. **Troubleshooting Steps**: Simple diagnostic steps to narrow down the cause

IMPORTANT RULES:
- Focus only on refrigerators and dishwashers
- Prioritize safety - remind them to unplug before repairs
- Suggest the most common/affordable fixes first
- If the symptom suggests a serious issue (gas leak, electrical problem), recommend professional help immediately
- Mention specific part types but note that exact part numbers depend on their model

Keep the response practical and reassuring.`;

    const response = await generateAIResponse(prompt);
    
    if (!response.text) {
      throw new Error("Empty response from AI");
    }
    
    return {
      success: true,
      partNumber: "",
      message: `${response.text}\n\n---\n*This troubleshooting advice is based on AI knowledge. For parts specific to your model, enter your model number on [PartSelect.com](https://www.partselect.com)*`,
      isFromAI: true,
      provider: response.provider,
    };
  } catch (error) {
    console.error("AI troubleshooting lookup error:", error);
    return {
      success: false,
      partNumber: "",
      message: `For troubleshooting help with your ${applianceType || "appliance"}, please visit [PartSelect.com](https://www.partselect.com) or contact a qualified technician.`,
      isFromAI: true,
    };
  }
};
