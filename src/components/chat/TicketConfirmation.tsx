"use client";

import { SupportTicket } from "@/types";
import { Card } from "@/components/ui/card";
import { CheckCircle, Clock, Mail, Phone, FileText } from "lucide-react";

interface TicketConfirmationProps {
  ticket: SupportTicket;
}

const priorityConfig = {
  low: { color: "bg-green-100 text-green-700", label: "Low" },
  normal: { color: "bg-blue-100 text-blue-700", label: "Normal" },
  high: { color: "bg-orange-100 text-orange-700", label: "High" },
  urgent: { color: "bg-red-100 text-red-700", label: "Urgent" },
};

const issueTypeLabels: Record<string, string> = {
  product_issue: "Product Issue",
  order_issue: "Order Issue",
  installation_help: "Installation Help",
  warranty: "Warranty Claim",
  refund: "Refund Request",
  other: "Other",
};

export const TicketConfirmation = ({ ticket }: TicketConfirmationProps) => {
  const priority = priorityConfig[ticket.priority];

  return (
    <Card className="p-4 mt-3 bg-gradient-to-br from-green-50 to-white border-2 border-green-200 shadow-md">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-green-200">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
          <CheckCircle size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-green-800">Support Ticket Created!</h3>
          <p className="text-sm text-green-600">We'll be in touch soon</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-100">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-gray-500" />
            <span className="text-sm text-gray-600">Ticket Number</span>
          </div>
          <span className="font-mono font-semibold text-green-700">{ticket.ticketNumber}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Status</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium capitalize">{ticket.status}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Priority</div>
            <span className={`text-xs px-2 py-1 rounded-full ${priority.color}`}>
              {priority.label}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Issue Type</div>
          <span className="text-sm font-medium">
            {issueTypeLabels[ticket.issueType] || ticket.issueType}
          </span>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="text-xs text-gray-500 mb-2">Issue Description</div>
          <p className="text-sm text-gray-700 line-clamp-3">{ticket.issueDescription}</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-800">What Happens Next</span>
          </div>
          <ul className="space-y-2 text-sm text-orange-700">
            <li className="flex items-start gap-2">
              <Mail size={14} className="mt-0.5 flex-shrink-0" />
              <span>
                Our team will review your ticket and contact you at{" "}
                <strong>{ticket.customerEmail}</strong> within 24 hours.
              </span>
            </li>
            {ticket.customerPhone && (
              <li className="flex items-start gap-2">
                <Phone size={14} className="mt-0.5 flex-shrink-0" />
                <span>
                  For urgent matters, we may call you at <strong>{ticket.customerPhone}</strong>
                </span>
              </li>
            )}
          </ul>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Save your ticket number <strong>{ticket.ticketNumber}</strong> for future reference
        </p>
      </div>
    </Card>
  );
};
