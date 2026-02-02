"use client";

import { RefObject } from "react";
import { Message, SupportTicketFormData } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { ProductCard } from "../products/ProductCard";
import { TypingIndicator, LoadingSkeleton } from "./TypingIndicator";
import { SupportTicketForm } from "./SupportTicketForm";
import { TicketConfirmation } from "./TicketConfirmation";
import { Bot, User, Database, Sparkles, Globe } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onTicketSubmit?: (messageId: string, data: SupportTicketFormData) => Promise<void>;
  onTicketCancel?: (messageId: string) => void;
  isSubmittingTicket?: boolean;
}

const DataSourceBadge = ({ dataSource }: { dataSource?: Message["dataSource"] }) => {
  if (!dataSource || dataSource === "database") {
    return null;
  }

  if (dataSource === "gemini_fallback") {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
        <Globe size={12} />
        <span>AI Knowledge</span>
      </div>
    );
  }

  if (dataSource === "gemini_enhanced") {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
        <Sparkles size={12} />
        <span>AI Enhanced</span>
      </div>
    );
  }

  return null;
};

const renderInlineBold = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

const formatMessage = (content: string) => {
  const lines = content.split("\n");
  return lines.map((line, index) => {
    if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
      const textContent = line.slice(2);
      return (
        <li key={index} className="ml-6 list-disc">
          {renderInlineBold(textContent)}
        </li>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h3 key={index} className="font-semibold text-lg mt-3 mb-2">
          {renderInlineBold(line.slice(3))}
        </h3>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h4 key={index} className="font-semibold mt-2 mb-1">
          {renderInlineBold(line.slice(4))}
        </h4>
      );
    }
    if (line.match(/^\d+\.\s/)) {
      const textWithoutNumber = line.replace(/^\d+\.\s/, "");
      return (
        <li key={index} className="ml-6 list-decimal">
          {renderInlineBold(textWithoutNumber)}
        </li>
      );
    }
    return line.trim() ? (
      <p key={index} className="mb-2">
        {renderInlineBold(line)}
      </p>
    ) : (
      <br key={index} />
    );
  });
};

export const MessageList = ({ 
  messages, 
  isLoading, 
  messagesEndRef,
  onTicketSubmit,
  onTicketCancel,
  isSubmittingTicket = false,
}: MessageListProps) => {
  return (
    <ScrollArea className="h-full px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <Avatar className={`w-8 h-8 shrink-0 ${message.role === "user" ? "bg-blue-600" : "bg-orange-500"}`}>
              <div className="w-full h-full flex items-center justify-center text-white">
                {message.role === "user" ? <User size={18} /> : <Bot size={18} />}
              </div>
            </Avatar>
            
            <div className={`flex flex-col gap-2 ${message.role === "user" ? "items-end max-w-[75%]" : "items-start max-w-[90%]"}`}>
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-900 rounded-tl-sm"
                }`}
              >
                <div className="text-sm leading-relaxed">
                  {formatMessage(message.content)}
                </div>
              </div>
              
              {message.products && message.products.length > 0 && (
                <div className="w-full mt-3">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Recommended Parts:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {message.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {message.showTicketForm && onTicketSubmit && onTicketCancel && (
                <div className="w-full">
                  <SupportTicketForm
                    prefilledData={message.prefilledTicketData}
                    onSubmit={(data) => onTicketSubmit(message.id, data)}
                    onCancel={() => onTicketCancel(message.id)}
                    isSubmitting={isSubmittingTicket}
                  />
                </div>
              )}

              {message.ticketData && (
                <div className="w-full">
                  <TicketConfirmation ticket={message.ticketData} />
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400" suppressHydrationWarning>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {message.role === "assistant" && <DataSourceBadge dataSource={message.dataSource} />}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 shrink-0 bg-orange-500">
              <div className="w-full h-full flex items-center justify-center text-white">
                <Bot size={18} />
              </div>
            </Avatar>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 min-w-[280px]">
              <LoadingSkeleton />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};
