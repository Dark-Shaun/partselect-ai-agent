import { NextRequest, NextResponse } from "next/server";
import { runSupervisorAgent } from "@/lib/ai/supervisor";
import { Product } from "@/types";
import { StoredPart } from "@/lib/db/simple-vector-store";

interface RequestBody {
  message: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
}

const isValidRole = (role: unknown): role is "user" | "assistant" => {
  return role === "user" || role === "assistant";
};

const validateRequestBody = (body: unknown): { success: boolean; error?: string } => {
  if (!body || typeof body !== "object") {
    return { success: false, error: "Invalid request body" };
  }

  const { message, conversationHistory } = body as RequestBody;

  if (typeof message !== "string" || message.trim().length === 0) {
    return { success: false, error: "Message is required" };
  }

  if (message.length > 2000) {
    return { success: false, error: "Message is too long" };
  }

  if (!Array.isArray(conversationHistory)) {
    return { success: false, error: "Conversation history must be an array" };
  }

  const isValidHistory = conversationHistory.every(
    (item) =>
      item &&
      typeof item === "object" &&
      isValidRole((item as { role: unknown }).role) &&
      typeof (item as { content: unknown }).content === "string" &&
      (item as { content: string }).content.length <= 2000
  );

  if (!isValidHistory) {
    return { success: false, error: "Invalid conversation history" };
  }

  return { success: true };
};

const convertToProduct = (part: StoredPart & { manufacturerPartNumber?: string; url?: string }): Product => {
  const partSelectUrl = part.url || buildPartSelectUrl(part);
  
  return {
    id: part.id,
    partNumber: part.partNumber,
    manufacturerPartNumber: part.manufacturerPartNumber,
    name: part.name,
    description: part.description,
    price: part.price,
    originalPrice: part.originalPrice,
    imageUrl: part.imageUrl,
    rating: part.rating,
    reviewCount: part.reviewCount,
    inStock: part.inStock,
    brand: part.brand,
    category: part.category,
    compatibleModels: part.compatibleModels,
    installationDifficulty: part.installationDifficulty as "Easy" | "Moderate" | "Difficult",
    installationTime: part.installationTime,
    url: partSelectUrl,
  };
};

const buildPartSelectUrl = (part: { partNumber: string; brand: string; manufacturerPartNumber?: string; name: string }): string => {
  const slugifiedName = part.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  const mfgPart = part.manufacturerPartNumber || '';
  return `https://www.partselect.com/${part.partNumber}-${part.brand}-${mfgPart}-${slugifiedName}.htm`;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateRequestBody(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: validation.error || "Invalid request",
          products: [],
          intent: "error",
        },
        { status: 400 }
      );
    }

    const { message, conversationHistory = [] } = body as RequestBody;

    const agentResponse = await runSupervisorAgent(
      message,
      (conversationHistory || []).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }))
    );

    const products: Product[] = agentResponse.products.map(convertToProduct);

    return NextResponse.json({
      message: agentResponse.message,
      products,
      intent: agentResponse.intent,
      toolUsed: agentResponse.toolUsed,
      dataSource: agentResponse.dataSource,
      showTicketForm: agentResponse.showTicketForm,
      prefilledTicketData: agentResponse.prefilledTicketData,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        message: "I apologize, but I encountered an error processing your request. Please try again.",
        products: [],
        intent: "error",
      },
      { status: 500 }
    );
  }
}
