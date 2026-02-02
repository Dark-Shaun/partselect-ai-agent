import { GoogleGenerativeAI, GenerativeModel, Content } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

let chatModel: GenerativeModel | null = null;
let embeddingModel: GenerativeModel | null = null;

export const getChatModel = (): GenerativeModel => {
  if (!chatModel) {
    chatModel = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });
  }
  return chatModel;
};

export const getEmbeddingModel = (): GenerativeModel => {
  if (!embeddingModel) {
    embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
  }
  return embeddingModel;
};

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export const chat = async (
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<string> => {
  const model = getChatModel();
  
  const contents: Content[] = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const result = await model.generateContent({
    contents,
    systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
  });

  return result.response.text();
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const model = getEmbeddingModel();
  const result = await model.embedContent(text);
  return result.embedding.values;
};

export const generateEmbeddings = async (texts: string[]): Promise<number[][]> => {
  const embeddings: number[][] = [];
  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
  }
  return embeddings;
};

export const isGeminiConfigured = (): boolean => {
  return !!process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== "your_gemini_api_key_here";
};
