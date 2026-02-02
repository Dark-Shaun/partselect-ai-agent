"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput = ({ onSend, disabled, placeholder }: MessageInputProps) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "48px";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="max-w-3xl mx-auto flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type your message... (Shift+Enter for new line)"}
          disabled={disabled}
          rows={1}
          className="flex-1 min-h-[48px] max-h-[150px] text-base rounded-2xl px-5 py-3 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label="Chat message input"
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 shrink-0"
          aria-label="Send message"
        >
          <Send size={20} />
        </Button>
      </div>
      <p className="text-xs text-center text-gray-400 mt-2">
        PartSelect Assistant specializes in refrigerator and dishwasher parts
      </p>
    </div>
  );
};
