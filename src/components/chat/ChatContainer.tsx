"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message, Product, ChatResponse, SupportTicketFormData, SupportTicket } from "@/types";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { QuickActions } from "./QuickActions";
import { Button } from "@/components/ui/button";
import { Bot, Plus } from "lucide-react";

const INITIAL_MESSAGE_CONTENT = "Hello! I'm your PartSelect assistant, here to help you with refrigerator and dishwasher parts. I can help you:\n\n• **Find parts** by name or part number\n• **Check compatibility** with your appliance model\n• **Troubleshoot issues** and recommend solutions\n• **Get installation help** for any part\n• **Track your order** status\n• **Create support tickets** if you need human assistance\n\nHow can I assist you today?";

const createInitialMessage = (): Message => ({
  id: uuidv4(),
  role: "assistant",
  content: INITIAL_MESSAGE_CONTENT,
  timestamp: new Date(),
});

export const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([createInitialMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleNewChat = () => {
    setMessages([createInitialMessage()]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content.trim(),
          conversationHistory,
        }),
      });

      const data: ChatResponse = await response.json();

      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        products: data.products,
        dataSource: data.dataSource as Message["dataSource"],
        showTicketForm: data.showTicketForm,
        prefilledTicketData: data.prefilledTicketData,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketSubmit = async (messageId: string, formData: SupportTicketFormData) => {
    setIsSubmittingTicket(true);

    try {
      const conversationSummary = messages
        .filter((m) => m.role === "user")
        .slice(-5)
        .map((m) => m.content)
        .join(" | ");

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          conversationSummary,
          stepsAlreadyTried: [],
        }),
      });

      const data = await response.json();

      if (data.success && data.ticket) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  showTicketForm: false,
                  ticketData: data.ticket as SupportTicket,
                }
              : msg
          )
        );

        const confirmationMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: `Great! Your support ticket **${data.ticket.ticketNumber}** has been created. Our team will contact you at **${data.ticket.customerEmail}** within 24 hours.\n\nIs there anything else I can help you with?`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, confirmationMessage]);
      } else {
        throw new Error(data.error || "Failed to create ticket");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "I apologize, but I encountered an error creating the support ticket. Please try again or contact us directly at support@partselect.com.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleTicketCancel = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, showTicketForm: false }
          : msg
      )
    );

    const cancelMessage: Message = {
      id: uuidv4(),
      role: "assistant",
      content: "No problem! Let me know if you change your mind or if there's anything else I can help you with.",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, cancelMessage]);
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      find_parts: "I'm looking for refrigerator parts",
      check_compatibility: "I need to check if a part is compatible with my appliance",
      troubleshoot: "My appliance has a problem and I need help diagnosing it",
      installation: "I need help installing a part",
      order_status: "I want to check my order status",
    };

    const message = actionMessages[action];
    if (message) {
      handleSendMessage(message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="text-orange-500" size={24} />
          <span className="font-semibold text-gray-800">PartSelect Assistant</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNewChat}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <Plus size={16} />
          New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages} 
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
          onTicketSubmit={handleTicketSubmit}
          onTicketCancel={handleTicketCancel}
          isSubmittingTicket={isSubmittingTicket}
        />
      </div>
      
      {messages.length === 1 && (
        <QuickActions onAction={handleQuickAction} />
      )}
      
      <MessageInput 
        onSend={handleSendMessage} 
        disabled={isLoading || isSubmittingTicket}
        placeholder={isLoading ? "Thinking..." : isSubmittingTicket ? "Creating ticket..." : "Type your message..."}
      />
    </div>
  );
};
