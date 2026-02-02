import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type AIProvider = "gemini" | "claude" | "openai" | "none";

export interface AIResponse {
  text: string;
  provider: AIProvider;
}

const getAvailableProvider = (): AIProvider => {
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== "your_gemini_api_key_here") {
    return "gemini";
  }
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "your_anthropic_api_key_here") {
    return "claude";
  }
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_openai_api_key_here") {
    return "openai";
  }
  return "none";
};

const generateWithGemini = async (prompt: string, systemPrompt?: string): Promise<string> => {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    ...(systemPrompt && { systemInstruction: { parts: [{ text: systemPrompt }] } }),
  });
  
  return result.response.text();
};

const generateWithClaude = async (prompt: string, systemPrompt?: string): Promise<string> => {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    ...(systemPrompt && { system: systemPrompt }),
    messages: [{ role: "user", content: prompt }],
  });
  
  const textBlock = message.content.find(block => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text : "";
};

const generateWithOpenAI = async (prompt: string, systemPrompt?: string): Promise<string> => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  const messages: OpenAI.ChatCompletionMessageParam[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });
  
  return completion.choices[0]?.message?.content || "";
};

export const generateAIResponse = async (
  prompt: string,
  systemPrompt?: string
): Promise<AIResponse> => {
  const provider = getAvailableProvider();
  
  console.log(`Using AI provider: ${provider}`);
  
  if (provider === "none") {
    return {
      text: "",
      provider: "none",
    };
  }
  
  try {
    let text = "";
    
    switch (provider) {
      case "gemini":
        text = await generateWithGemini(prompt, systemPrompt);
        break;
      case "claude":
        text = await generateWithClaude(prompt, systemPrompt);
        break;
      case "openai":
        text = await generateWithOpenAI(prompt, systemPrompt);
        break;
    }
    
    return { text, provider };
  } catch (error) {
    console.error(`Error with ${provider}:`, error);
    return { text: "", provider: "none" };
  }
};

export const isAIAvailable = (): boolean => {
  return getAvailableProvider() !== "none";
};

export const getCurrentProvider = (): AIProvider => {
  return getAvailableProvider();
};
