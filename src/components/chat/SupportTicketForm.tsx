"use client";

import { useState } from "react";
import { SupportTicketFormData, TicketIssueType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, X, Ticket } from "lucide-react";

interface SupportTicketFormProps {
  prefilledData?: Partial<SupportTicketFormData>;
  onSubmit: (data: SupportTicketFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const issueTypeOptions: { value: TicketIssueType; label: string }[] = [
  { value: "product_issue", label: "Product Issue" },
  { value: "order_issue", label: "Order Issue" },
  { value: "installation_help", label: "Installation Help" },
  { value: "warranty", label: "Warranty Claim" },
  { value: "refund", label: "Refund Request" },
  { value: "other", label: "Other" },
];

const applianceOptions = [
  { value: "", label: "Select appliance (optional)" },
  { value: "refrigerator", label: "Refrigerator" },
  { value: "dishwasher", label: "Dishwasher" },
];

export const SupportTicketForm = ({
  prefilledData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SupportTicketFormProps) => {
  const [formData, setFormData] = useState<SupportTicketFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    issueType: prefilledData?.issueType || "product_issue",
    applianceType: prefilledData?.applianceType,
    modelNumber: prefilledData?.modelNumber || "",
    partNumber: prefilledData?.partNumber || "",
    issueDescription: prefilledData?.issueDescription || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Name is required";
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email";
    }

    if (!formData.issueDescription.trim()) {
      newErrors.issueDescription = "Please describe your issue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <Card className="p-4 mt-3 bg-white border-2 border-orange-200 shadow-md">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
          <Ticket size={16} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Create Support Ticket</h3>
          <p className="text-xs text-gray-500">Our team will respond within 24 hours</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="John Doe"
              className={errors.customerName ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.customerName && (
              <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              placeholder="john@example.com"
              className={errors.customerEmail ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.customerEmail && (
              <p className="text-xs text-red-500 mt-1">{errors.customerEmail}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone (Optional)
            </label>
            <Input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone || ""}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Type <span className="text-red-500">*</span>
            </label>
            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={isSubmitting}
            >
              {issueTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appliance Type
            </label>
            <select
              name="applianceType"
              value={formData.applianceType || ""}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={isSubmitting}
            >
              {applianceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model Number
            </label>
            <Input
              type="text"
              name="modelNumber"
              value={formData.modelNumber || ""}
              onChange={handleChange}
              placeholder="e.g., WRS325SDHZ"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Part Number
            </label>
            <Input
              type="text"
              name="partNumber"
              value={formData.partNumber || ""}
              onChange={handleChange}
              placeholder="e.g., PS11752778"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Describe Your Issue <span className="text-red-500">*</span>
          </label>
          <textarea
            name="issueDescription"
            value={formData.issueDescription}
            onChange={handleChange}
            placeholder="Please describe the issue you're experiencing..."
            rows={4}
            className={`w-full px-3 py-2 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.issueDescription ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isSubmitting}
          />
          {errors.issueDescription && (
            <p className="text-xs text-red-500 mt-1">{errors.issueDescription}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            <X size={16} className="mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Submit Ticket
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
