import { Intent, Product } from "@/types";
import {
  products,
  searchProducts,
  findCompatibleParts,
  checkCompatibility,
  findProductByPartNumber,
  findTroubleshootingGuide,
  findOrderByNumber,
} from "@/data/parts";

const extractPartNumber = (message: string): string | null => {
  const patterns = [
    /PS\d{8}/i,
    /W\d{8,}/i,
    /WP[A-Z]?\d{8,}/i,
    /GE-[A-Z0-9]+/i,
    /DA\d{2}-\d{5}[A-Z]?/i,
    /\d{10}/,
    /([A-Z]{2,}[0-9]{5,}[A-Z0-9]*)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[0];
  }
  return null;
};

const extractModelNumber = (message: string): string | null => {
  const patterns = [
    /WDT\d{3}[A-Z0-9]+/i,
    /WRS\d{3}[A-Z0-9]+/i,
    /WRF\d{3}[A-Z0-9]+/i,
    /WRX\d{3}[A-Z0-9]+/i,
    /KDTM?\d{3}[A-Z0-9]+/i,
    /KRSC\d{3}[A-Z0-9]+/i,
    /GSS\d{2}[A-Z0-9]+/i,
    /GFE\d{2}[A-Z0-9]+/i,
    /RF\d{2,3}[A-Z0-9]+/i,
    /FFCD\d{4}[A-Z0-9]+/i,
    /FGID\d{4}[A-Z0-9]+/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[0];
  }
  return null;
};

const classifyIntentSimple = (message: string): Intent => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("order") && (lowerMessage.includes("status") || lowerMessage.includes("track") || lowerMessage.includes("where"))) {
    return "order_status";
  }

  if (lowerMessage.includes("install") || lowerMessage.includes("how do i") || lowerMessage.includes("how to")) {
    const partNumber = extractPartNumber(message);
    if (partNumber) return "installation_help";
  }

  if (lowerMessage.includes("compatible") || lowerMessage.includes("fit") || lowerMessage.includes("work with") || lowerMessage.includes("match")) {
    return "compatibility_check";
  }

  if (
    lowerMessage.includes("not working") ||
    lowerMessage.includes("broken") ||
    lowerMessage.includes("problem") ||
    lowerMessage.includes("issue") ||
    lowerMessage.includes("won't") ||
    lowerMessage.includes("doesn't") ||
    lowerMessage.includes("isn't") ||
    lowerMessage.includes("fix") ||
    lowerMessage.includes("repair")
  ) {
    return "troubleshooting";
  }

  if (
    lowerMessage.includes("find") ||
    lowerMessage.includes("search") ||
    lowerMessage.includes("looking for") ||
    lowerMessage.includes("need") ||
    lowerMessage.includes("show me") ||
    lowerMessage.includes("parts")
  ) {
    return "product_search";
  }

  const partNumber = extractPartNumber(message);
  const modelNumber = extractModelNumber(message);
  if (partNumber || modelNumber) {
    if (lowerMessage.includes("install")) return "installation_help";
    if (modelNumber && partNumber) return "compatibility_check";
    return "product_search";
  }

  const offTopicKeywords = ["weather", "sports", "news", "politics", "recipe", "movie", "music", "game", "joke"];
  if (offTopicKeywords.some((kw) => lowerMessage.includes(kw))) {
    return "off_topic";
  }

  return "general_question";
};

export const generateDemoResponse = (
  message: string
): { message: string; products: Product[]; intent: Intent } => {
  const intent = classifyIntentSimple(message);
  const lowerMessage = message.toLowerCase();
  let responseMessage = "";
  let relevantProducts: Product[] = [];

  switch (intent) {
    case "product_search": {
      if (lowerMessage.includes("ice maker") || lowerMessage.includes("icemaker")) {
        relevantProducts = products.filter(
          (p) => p.name.toLowerCase().includes("ice maker") || p.description.toLowerCase().includes("ice maker")
        );
        responseMessage = `I found ${relevantProducts.length} ice maker parts that might help you. Here are our top recommendations:\n\n`;
        relevantProducts.slice(0, 3).forEach((p) => {
          responseMessage += `• **${p.name}** (${p.partNumber}) - $${p.price.toFixed(2)} - ${p.installationDifficulty} installation\n`;
        });
        responseMessage += `\nWould you like me to check if any of these are compatible with your specific model?`;
      } else if (lowerMessage.includes("water filter") || lowerMessage.includes("filter")) {
        relevantProducts = products.filter((p) => p.name.toLowerCase().includes("filter"));
        responseMessage = `Here are our water filter options:\n\n`;
        relevantProducts.forEach((p) => {
          responseMessage += `• **${p.name}** (${p.partNumber}) - $${p.price.toFixed(2)} - ${p.rating}/5 stars (${p.reviewCount} reviews)\n`;
        });
        responseMessage += `\nWater filters should be replaced every 6 months for optimal performance. Would you like help finding the right filter for your refrigerator model?`;
      } else if (lowerMessage.includes("dishwasher")) {
        relevantProducts = products.filter((p) => p.category === "dishwasher").slice(0, 4);
        responseMessage = `Here are some popular dishwasher parts:\n\n`;
        relevantProducts.forEach((p) => {
          responseMessage += `• **${p.name}** (${p.partNumber}) - $${p.price.toFixed(2)}\n`;
        });
        responseMessage += `\nWhat specific issue are you experiencing with your dishwasher? I can help recommend the right part.`;
      } else if (lowerMessage.includes("refrigerator") || lowerMessage.includes("fridge")) {
        relevantProducts = products.filter((p) => p.category === "refrigerator").slice(0, 4);
        responseMessage = `Here are some popular refrigerator parts:\n\n`;
        relevantProducts.forEach((p) => {
          responseMessage += `• **${p.name}** (${p.partNumber}) - $${p.price.toFixed(2)}\n`;
        });
        responseMessage += `\nWhat specific issue are you having with your refrigerator? I can help narrow down the right part.`;
      } else {
        relevantProducts = searchProducts(message).slice(0, 4);
        if (relevantProducts.length > 0) {
          responseMessage = `I found ${relevantProducts.length} parts matching your search:\n\n`;
          relevantProducts.forEach((p) => {
            responseMessage += `• **${p.name}** (${p.partNumber}) - $${p.price.toFixed(2)}\n`;
          });
        } else {
          responseMessage = `I couldn't find specific parts matching your search. Could you provide more details? For example:\n\n• The type of appliance (refrigerator or dishwasher)\n• The brand and model number\n• A description of what you're looking for`;
        }
      }
      break;
    }

    case "compatibility_check": {
      const partNumber = extractPartNumber(message);
      const modelNumber = extractModelNumber(message);

      if (modelNumber && partNumber) {
        const result = checkCompatibility(partNumber, modelNumber);
        if (result.compatible) {
          const part = findProductByPartNumber(partNumber);
          if (part) {
            relevantProducts = [part];
            responseMessage = `✅ **Great news!** Part **${partNumber}** is compatible with your **${result.model?.brand} ${modelNumber}** ${result.model?.type}.\n\n`;
            responseMessage += `**${part.name}**\n`;
            responseMessage += `• Price: $${part.price.toFixed(2)}\n`;
            responseMessage += `• Installation: ${part.installationDifficulty} (${part.installationTime})\n`;
            responseMessage += `• Rating: ${part.rating}/5 (${part.reviewCount} reviews)\n\n`;
            responseMessage += `Would you like installation instructions for this part?`;
          }
        } else if (result.model) {
          responseMessage = `❌ Part **${partNumber}** is **not compatible** with model **${modelNumber}**.\n\nHere are parts that ARE compatible with your model:`;
          relevantProducts = findCompatibleParts(modelNumber).slice(0, 4);
        } else {
          responseMessage = `I couldn't find model **${modelNumber}** in our database. Please double-check the model number - it's usually found on a sticker inside the door or on the back of the appliance.\n\nIf you need help finding your model number, I can guide you!`;
        }
      } else if (modelNumber) {
        relevantProducts = findCompatibleParts(modelNumber).slice(0, 4);
        if (relevantProducts.length > 0) {
          responseMessage = `Here are compatible parts for your **${modelNumber}**:\n\n`;
          relevantProducts.forEach((p) => {
            responseMessage += `• **${p.name}** (${p.partNumber}) - $${p.price.toFixed(2)}\n`;
          });
          responseMessage += `\nWould you like more details on any of these parts?`;
        } else {
          responseMessage = `I couldn't find model **${modelNumber}** in our database. Please verify the model number or contact our customer support for assistance.`;
        }
      } else if (partNumber) {
        const part = findProductByPartNumber(partNumber);
        if (part) {
          relevantProducts = [part];
          responseMessage = `Part **${partNumber}** (${part.name}) is compatible with the following models:\n\n`;
          responseMessage += part.compatibleModels.map((m) => `• ${m}`).join("\n");
          responseMessage += `\n\nIs your model listed above? If not, please provide your model number and I'll find compatible alternatives.`;
        } else {
          responseMessage = `I couldn't find part **${partNumber}** in our database. Please verify the part number or describe what you're looking for and I'll help find it.`;
        }
      } else {
        responseMessage = `To check compatibility, I'll need either:\n\n• Your **model number** (found inside the door or on the back of your appliance)\n• The **part number** you're interested in\n\nPlease provide these details and I'll verify compatibility for you!`;
      }
      break;
    }

    case "troubleshooting": {
      const isRefrigerator =
        lowerMessage.includes("fridge") ||
        lowerMessage.includes("refrigerator") ||
        lowerMessage.includes("freezer") ||
        lowerMessage.includes("ice") ||
        lowerMessage.includes("cold") ||
        lowerMessage.includes("cooling");
      const isDishwasher =
        lowerMessage.includes("dishwasher") ||
        lowerMessage.includes("dishes") ||
        lowerMessage.includes("wash");

      const applianceType = isRefrigerator ? "refrigerator" : isDishwasher ? "dishwasher" : undefined;
      const guides = findTroubleshootingGuide(message, applianceType);

      if (guides.length > 0) {
        const guide = guides[0];
        responseMessage = `## Troubleshooting: ${guide.symptom}\n\n`;
        responseMessage += `### Possible Causes:\n`;
        guide.possibleCauses.forEach((cause) => {
          responseMessage += `• ${cause}\n`;
        });
        responseMessage += `\n### Diagnostic Steps:\n`;
        guide.steps.forEach((step, i) => {
          responseMessage += `${i + 1}. ${step}\n`;
        });
        responseMessage += `\n### Recommended Parts:\n`;
        relevantProducts = guide.recommendedParts
          .map((pn) => findProductByPartNumber(pn))
          .filter((p): p is Product => p !== undefined);
        relevantProducts.forEach((p) => {
          responseMessage += `• **${p.name}** (${p.partNumber}) - $${p.price.toFixed(2)}\n`;
        });
      } else {
        responseMessage = `I'd be happy to help troubleshoot your appliance issue. Could you provide more details?\n\n`;
        responseMessage += `• What type of appliance is it? (refrigerator or dishwasher)\n`;
        responseMessage += `• What symptoms are you experiencing?\n`;
        responseMessage += `• When did the problem start?\n\n`;
        responseMessage += `Common issues I can help with:\n`;
        responseMessage += `• **Refrigerator**: Not cooling, ice maker not working, leaking water, unusual noises\n`;
        responseMessage += `• **Dishwasher**: Not draining, not cleaning dishes, not filling with water, door won't latch`;
      }
      break;
    }

    case "installation_help": {
      const partNumber = extractPartNumber(message);
      if (partNumber) {
        const part = findProductByPartNumber(partNumber);
        if (part) {
          relevantProducts = [part];
          responseMessage = `## Installation Guide for ${part.name}\n\n`;
          responseMessage += `**Part Number:** ${part.partNumber}\n`;
          responseMessage += `**Difficulty:** ${part.installationDifficulty}\n`;
          responseMessage += `**Estimated Time:** ${part.installationTime}\n\n`;

          responseMessage += `### Before You Begin:\n`;
          responseMessage += `1. Unplug the appliance or turn off the circuit breaker\n`;
          responseMessage += `2. Have a flashlight and basic tools ready (screwdriver, pliers)\n`;
          responseMessage += `3. Take photos of wire connections before disconnecting\n\n`;

          if (part.videoUrl) {
            responseMessage += `📹 **Video Tutorial Available:** ${part.videoUrl}\n\n`;
          }

          responseMessage += `### Compatible Models:\n`;
          responseMessage += part.compatibleModels.map((m) => `• ${m}`).join("\n");
          responseMessage += `\n\n⚠️ **Safety Note:** If you're uncomfortable with any step, please consult a qualified technician.`;
        } else {
          responseMessage = `I couldn't find installation information for part **${partNumber}**. Please verify the part number or let me know what part you need help installing.`;
        }
      } else {
        responseMessage = `I'd be happy to provide installation instructions! Please provide the **part number** of the item you need to install.\n\nFor example: "How do I install PS11752778?"`;
      }
      break;
    }

    case "order_status": {
      const orderPattern = /PS-\d{4}-\d{5}/i;
      const orderMatch = message.match(orderPattern);

      if (orderMatch) {
        const order = findOrderByNumber(orderMatch[0]);
        if (order) {
          const statusEmoji = {
            processing: "📦",
            shipped: "🚚",
            delivered: "✅",
            cancelled: "❌",
          };
          responseMessage = `## Order Status: ${order.orderNumber}\n\n`;
          responseMessage += `**Status:** ${statusEmoji[order.status]} ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}\n\n`;
          responseMessage += `**Items:**\n`;
          order.items.forEach((item) => {
            responseMessage += `• ${item.name} (${item.partNumber}) x${item.quantity} - $${item.price.toFixed(2)}\n`;
          });
          if (order.trackingNumber) {
            responseMessage += `\n**Tracking Number:** ${order.trackingNumber}\n`;
          }
          if (order.estimatedDelivery) {
            responseMessage += `**Estimated Delivery:** ${order.estimatedDelivery}\n`;
          }
        } else {
          responseMessage = `I couldn't find order **${orderMatch[0]}**. Please double-check the order number.\n\nOrder numbers are formatted as: PS-XXXX-XXXXX (e.g., PS-2024-78542)`;
        }
      } else {
        responseMessage = `To check your order status, please provide your **order number**.\n\nYour order number is formatted as: **PS-XXXX-XXXXX**\n\nYou can find it in your order confirmation email or in your PartSelect account.`;
      }
      break;
    }

    case "off_topic": {
      responseMessage = `I specialize in helping with **refrigerator and dishwasher parts** only. I can help you:\n\n`;
      responseMessage += `• 🔍 **Find parts** by name or part number\n`;
      responseMessage += `• ✅ **Check compatibility** with your appliance model\n`;
      responseMessage += `• 🔧 **Troubleshoot issues** and recommend solutions\n`;
      responseMessage += `• 📋 **Get installation help** for any part\n`;
      responseMessage += `• 📦 **Track your order** status\n\n`;
      responseMessage += `For questions about other appliances, please visit [PartSelect.com](https://www.partselect.com) or contact customer service.\n\n`;
      responseMessage += `How can I help you with your refrigerator or dishwasher today?`;
      break;
    }

    default: {
      responseMessage = `Thanks for reaching out! I'm here to help with your refrigerator and dishwasher needs.\n\n`;
      responseMessage += `Here are some things I can help with:\n\n`;
      responseMessage += `• **Find a part** - Tell me what you're looking for\n`;
      responseMessage += `• **Check compatibility** - Provide your model number\n`;
      responseMessage += `• **Troubleshoot an issue** - Describe the problem\n`;
      responseMessage += `• **Installation help** - Give me the part number\n`;
      responseMessage += `• **Order status** - Share your order number\n\n`;
      responseMessage += `What would you like help with?`;
    }
  }

  return {
    message: responseMessage,
    products: relevantProducts.slice(0, 4),
    intent,
  };
};
