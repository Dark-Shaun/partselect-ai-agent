import { NextRequest, NextResponse } from "next/server";
import { createSupportTicket, CreateTicketParams, findTicketByNumber } from "@/data/parts";
import { SupportTicketFormData, TicketPriority } from "@/types";

interface CreateTicketRequest extends SupportTicketFormData {
  conversationSummary?: string;
  stepsAlreadyTried?: string[];
  priority?: TicketPriority;
}

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const isOptionalString = (value: unknown): value is string | undefined => {
  return value === undefined || typeof value === "string";
};

const validateTicketRequest = (body: unknown): { success: boolean; error?: string } => {
  if (!body || typeof body !== "object") {
    return { success: false, error: "Invalid request body" };
  }

  const request = body as CreateTicketRequest;

  if (!isNonEmptyString(request.customerName)) {
    return { success: false, error: "Customer name is required" };
  }

  if (!isNonEmptyString(request.customerEmail)) {
    return { success: false, error: "Customer email is required" };
  }

  if (!isNonEmptyString(request.issueType)) {
    return { success: false, error: "Issue type is required" };
  }

  if (!isNonEmptyString(request.issueDescription)) {
    return { success: false, error: "Issue description is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(request.customerEmail)) {
    return { success: false, error: "Invalid email address" };
  }

  if (!isOptionalString(request.customerPhone)) {
    return { success: false, error: "Invalid phone number" };
  }

  if (!isOptionalString(request.modelNumber)) {
    return { success: false, error: "Invalid model number" };
  }

  if (!isOptionalString(request.partNumber)) {
    return { success: false, error: "Invalid part number" };
  }

  if (!isOptionalString(request.conversationSummary)) {
    return { success: false, error: "Invalid conversation summary" };
  }

  if (request.stepsAlreadyTried && !Array.isArray(request.stepsAlreadyTried)) {
    return { success: false, error: "Invalid stepsAlreadyTried" };
  }

  return { success: true };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateTicketRequest(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || "Invalid request",
        },
        { status: 400 }
      );
    }

    const typedBody = body as CreateTicketRequest;

    const ticketParams: CreateTicketParams = {
      customerName: typedBody.customerName,
      customerEmail: typedBody.customerEmail,
      customerPhone: typedBody.customerPhone,
      issueType: typedBody.issueType,
      applianceType: typedBody.applianceType,
      modelNumber: typedBody.modelNumber,
      partNumber: typedBody.partNumber,
      issueDescription: typedBody.issueDescription,
      conversationSummary: typedBody.conversationSummary || "",
      stepsAlreadyTried: typedBody.stepsAlreadyTried || [],
      priority: typedBody.priority || "normal",
    };

    const ticket = createSupportTicket(ticketParams);

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        priority: ticket.priority,
        customerName: ticket.customerName,
        customerEmail: ticket.customerEmail,
        customerPhone: ticket.customerPhone,
        issueType: ticket.issueType,
        applianceType: ticket.applianceType,
        modelNumber: ticket.modelNumber,
        partNumber: ticket.partNumber,
        issueDescription: ticket.issueDescription,
        createdAt: ticket.createdAt,
      },
      message: `Support ticket ${ticket.ticketNumber} created successfully. Our team will contact you at ${ticket.customerEmail} within 24 hours.`,
    });
  } catch (error) {
    console.error("Ticket creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create support ticket. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketNumber = searchParams.get("ticketNumber");

    if (!ticketNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Ticket number is required",
        },
        { status: 400 }
      );
    }

    const ticket = findTicketByNumber(ticketNumber);

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: `Ticket ${ticketNumber} not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("Ticket lookup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve ticket. Please try again.",
      },
      { status: 500 }
    );
  }
}
