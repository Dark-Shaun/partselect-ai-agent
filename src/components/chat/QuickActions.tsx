"use client";

import { Button } from "@/components/ui/button";
import { Search, CheckCircle, Wrench, HelpCircle, Package } from "lucide-react";

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const actions = [
  { id: "find_parts", label: "Find Parts", icon: Search, color: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200" },
  { id: "check_compatibility", label: "Check Compatibility", icon: CheckCircle, color: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200" },
  { id: "troubleshoot", label: "Troubleshoot Issue", icon: Wrench, color: "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200" },
  { id: "installation", label: "Installation Help", icon: HelpCircle, color: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200" },
  { id: "order_status", label: "Track Order", icon: Package, color: "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200" },
];

export const QuickActions = ({ onAction }: QuickActionsProps) => {
  return (
    <div className="px-4 pb-4">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-gray-500 mb-3 text-center">Quick actions:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              onClick={() => onAction(action.id)}
              className={`${action.color} border rounded-full px-4 py-2 text-sm font-medium transition-colors`}
              aria-label={action.label}
            >
              <action.icon size={16} className="mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
