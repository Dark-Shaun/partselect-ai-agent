export type DataSource = "database" | "gemini_fallback" | "gemini_enhanced";

export type TicketIssueType = "product_issue" | "order_issue" | "installation_help" | "warranty" | "refund" | "other";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  issueType: TicketIssueType;
  applianceType?: "refrigerator" | "dishwasher";
  modelNumber?: string;
  partNumber?: string;
  issueDescription: string;
  conversationSummary: string;
  stepsAlreadyTried: string[];
  createdAt: Date;
}

export interface SupportTicketFormData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  issueType: TicketIssueType;
  applianceType?: "refrigerator" | "dishwasher";
  modelNumber?: string;
  partNumber?: string;
  issueDescription: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  products?: Product[];
  dataSource?: DataSource;
  showTicketForm?: boolean;
  ticketData?: SupportTicket;
  prefilledTicketData?: Partial<SupportTicketFormData>;
}

export interface Product {
  id: string;
  partNumber: string;
  manufacturerPartNumber?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  brand: string;
  category: "refrigerator" | "dishwasher";
  compatibleModels: string[];
  installationDifficulty: "Easy" | "Moderate" | "Difficult";
  installationTime: string;
  videoUrl?: string;
  url?: string;
}

export interface ModelInfo {
  modelNumber: string;
  brand: string;
  type: "refrigerator" | "dishwasher";
  compatibleParts: string[];
}

export interface TroubleshootingGuide {
  id: string;
  symptom: string;
  applianceType: "refrigerator" | "dishwasher";
  possibleCauses: string[];
  recommendedParts: string[];
  steps: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  shippingAddress: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: Date;
}

export interface OrderItem {
  partNumber: string;
  name: string;
  quantity: number;
  price: number;
}

export type Intent =
  | "product_search"
  | "compatibility_check"
  | "troubleshooting"
  | "installation_help"
  | "order_status"
  | "support_ticket"
  | "general_question"
  | "off_topic";

export interface ChatRequest {
  message: string;
  conversationHistory: Message[];
}

export interface ChatResponse {
  message: string;
  products?: Product[];
  intent: Intent;
  dataSource?: DataSource;
  showTicketForm?: boolean;
  prefilledTicketData?: Partial<SupportTicketFormData>;
  ticketData?: SupportTicket;
}
