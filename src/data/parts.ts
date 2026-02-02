import { Product, ModelInfo, TroubleshootingGuide, Order, SupportTicket, SupportTicketFormData, TicketPriority } from "@/types";

export const products: Product[] = [
  {
    id: "1",
    partNumber: "PS11752778",
    name: "Ice Maker Assembly",
    description: "Replacement ice maker assembly for Whirlpool, KitchenAid, and Kenmore refrigerators. This ice maker produces crescent-shaped ice cubes and includes the ice mold, motor module, and ejector components.",
    price: 89.95,
    originalPrice: 109.99,
    imageUrl: "https://partselectcom-gtcdcddbene3cpes.z01.azurefd.net/images/ps/18706/00/1.webp",
    rating: 4.7,
    reviewCount: 1247,
    inStock: true,
    brand: "Whirlpool",
    category: "refrigerator",
    compatibleModels: ["WRS325SDHZ", "WRS588FIHZ", "WRF555SDFZ", "WRX735SDHZ", "KRSC503ESS"],
    installationDifficulty: "Moderate",
    installationTime: "30-45 minutes",
    videoUrl: "https://www.partselect.com/installation-video/PS11752778"
  },
  {
    id: "2",
    partNumber: "PS11743427",
    name: "Refrigerator Water Filter",
    description: "EveryDrop EDR1RXD1 refrigerator water filter. NSF certified to reduce contaminants including lead, pesticides, and pharmaceuticals. Fits Whirlpool, Maytag, KitchenAid, and Amana refrigerators.",
    price: 49.99,
    imageUrl: "https://partselectcom-gtcdcddbene3cpes.z01.azurefd.net/images/ps/18577/00/1.webp",
    rating: 4.8,
    reviewCount: 3521,
    inStock: true,
    brand: "Whirlpool",
    category: "refrigerator",
    compatibleModels: ["WRS325SDHZ", "WRF555SDFZ", "WRX735SDHZ", "MFI2570FEZ", "KRMF706ESS"],
    installationDifficulty: "Easy",
    installationTime: "5 minutes",
    videoUrl: "https://www.partselect.com/installation-video/PS11743427"
  },
  {
    id: "3",
    partNumber: "PS11757023",
    name: "Refrigerator Door Gasket",
    description: "Replacement door gasket (seal) for fresh food compartment. Helps maintain proper temperature and energy efficiency. Magnetic seal design for secure closure.",
    price: 74.50,
    imageUrl: "https://partselectcom-gtcdcddbene3cpes.z01.azurefd.net/images/ps/18815/00/1.webp",
    rating: 4.5,
    reviewCount: 892,
    inStock: true,
    brand: "Whirlpool",
    category: "refrigerator",
    compatibleModels: ["WRS325SDHZ", "WRS588FIHZ", "WRF555SDFZ"],
    installationDifficulty: "Easy",
    installationTime: "15-20 minutes"
  },
  {
    id: "4",
    partNumber: "PS11752927",
    name: "Evaporator Fan Motor",
    description: "Circulates cold air throughout the refrigerator and freezer compartments. If your refrigerator isn't cooling properly but the freezer works, this motor may need replacement.",
    price: 45.99,
    originalPrice: 59.99,
    imageUrl: "https://partselectcom-gtcdcddbene3cpes.z01.azurefd.net/images/ps/18692/00/1.webp",
    rating: 4.6,
    reviewCount: 1834,
    inStock: true,
    brand: "Whirlpool",
    category: "refrigerator",
    compatibleModels: ["WRS325SDHZ", "WRS588FIHZ", "WRF555SDFZ", "WRX735SDHZ"],
    installationDifficulty: "Moderate",
    installationTime: "45-60 minutes",
    videoUrl: "https://www.partselect.com/installation-video/PS11752927"
  },
  {
    id: "5",
    partNumber: "PS11753399",
    name: "Defrost Thermostat",
    description: "Controls the defrost heater to prevent frost buildup on the evaporator coils. A faulty thermostat can cause frost buildup or cooling issues.",
    price: 23.75,
    imageUrl: "https://partselectcom-gtcdcddbene3cpes.z01.azurefd.net/images/ps/18749/00/1.webp",
    rating: 4.4,
    reviewCount: 567,
    inStock: true,
    brand: "Whirlpool",
    category: "refrigerator",
    compatibleModels: ["WRS325SDHZ", "WRS588FIHZ", "WRF555SDFZ", "WRX735SDHZ", "KRSC503ESS"],
    installationDifficulty: "Moderate",
    installationTime: "30-45 minutes"
  },
  {
    id: "6",
    partNumber: "WPW10195416",
    name: "Dishwasher Pump and Motor Assembly",
    description: "Main wash pump and motor assembly for Whirlpool, KitchenAid, and Kenmore dishwashers. Circulates water through the spray arms during the wash cycle.",
    price: 189.99,
    originalPrice: 229.99,
    imageUrl: "https://partselectcom-gtcdcddbene3cpes.z01.azurefd.net/images/ps/11739827/00/1.webp",
    rating: 4.6,
    reviewCount: 743,
    inStock: true,
    brand: "Whirlpool",
    category: "dishwasher",
    compatibleModels: ["WDT780SAEM1", "WDT750SAHZ", "KDTM354ESS", "KDTE334GPS"],
    installationDifficulty: "Difficult",
    installationTime: "60-90 minutes",
    videoUrl: "https://www.partselect.com/installation-video/WPW10195416"
  },
  {
    id: "7",
    partNumber: "W10872845",
    name: "Dishwasher Door Latch Assembly",
    description: "Replacement door latch and strike plate for secure door closure. If your dishwasher won't start or the door won't latch properly, this part may be needed.",
    price: 42.50,
    imageUrl: "https://partselectcom-gtcdcddbene3cpes.z01.azurefd.net/images/ps/12085986/00/1.webp",
    rating: 4.7,
    reviewCount: 1089,
    inStock: true,
    brand: "Whirlpool",
    category: "dishwasher",
    compatibleModels: ["WDT780SAEM1", "WDT750SAHZ", "WDF520PADM", "WDT730PAHZ"],
    installationDifficulty: "Moderate",
    installationTime: "20-30 minutes"
  },
  {
    id: "8",
    partNumber: "PS11722157",
    name: "Dishwasher Upper Spray Arm",
    description: "Upper rack spray arm that distributes water to clean dishes on the top rack. Replace if spray holes are clogged or arm is cracked.",
    price: 28.95,
    imageUrl: "https://partselectcom-gtcdcddbene3cpes.z01.azurefd.net/images/ps/18706/00/1.webp",
    rating: 4.5,
    reviewCount: 456,
    inStock: true,
    brand: "Whirlpool",
    category: "dishwasher",
    compatibleModels: ["WDT780SAEM1", "WDT750SAHZ", "KDTM354ESS"],
    installationDifficulty: "Easy",
    installationTime: "5-10 minutes"
  },
  {
    id: "9",
    partNumber: "W10653840",
    name: "Dishwasher Water Inlet Valve",
    description: "Controls water flow into the dishwasher. If your dishwasher isn't filling with water or is filling slowly, this valve may need replacement.",
    price: 52.99,
    imageUrl: "https://partselectcom-gtcdcddbene3cpes.z01.azurefd.net/images/ps/12115686/00/1.webp",
    rating: 4.4,
    reviewCount: 823,
    inStock: true,
    brand: "Whirlpool",
    category: "dishwasher",
    compatibleModels: ["WDT780SAEM1", "WDT750SAHZ", "WDF520PADM", "WDT730PAHZ", "KDTM354ESS"],
    installationDifficulty: "Moderate",
    installationTime: "30-45 minutes",
    videoUrl: "https://www.partselect.com/installation-video/W10653840"
  },
  {
    id: "10",
    partNumber: "W10712395",
    name: "Dishwasher Drain Pump",
    description: "Pumps water out of the dishwasher during the drain cycle. If water isn't draining properly or you hear unusual noises during draining, this pump may be faulty.",
    price: 67.50,
    originalPrice: 79.99,
    imageUrl: "https://partselectcom-gtcdcddbene3cpes.z01.azurefd.net/images/ps/12339694/00/1.webp",
    rating: 4.6,
    reviewCount: 1567,
    inStock: true,
    brand: "Whirlpool",
    category: "dishwasher",
    compatibleModels: ["WDT780SAEM1", "WDT750SAHZ", "WDF520PADM", "KDTM354ESS", "KDTE334GPS"],
    installationDifficulty: "Moderate",
    installationTime: "30-45 minutes"
  }
];

export const modelDatabase: ModelInfo[] = [
  { modelNumber: "WRS325SDHZ", brand: "Whirlpool", type: "refrigerator", compatibleParts: ["PS11752778", "PS11743427", "PS11757023", "PS11752927", "PS11753399"] },
  { modelNumber: "WRS588FIHZ", brand: "Whirlpool", type: "refrigerator", compatibleParts: ["PS11752778", "PS11757023", "PS11752927", "PS11753399"] },
  { modelNumber: "WRF555SDFZ", brand: "Whirlpool", type: "refrigerator", compatibleParts: ["PS11752778", "PS11743427", "PS11757023", "PS11752927", "PS11753399"] },
  { modelNumber: "WRX735SDHZ", brand: "Whirlpool", type: "refrigerator", compatibleParts: ["PS11752778", "PS11743427", "PS11752927", "PS11753399"] },
  { modelNumber: "KRSC503ESS", brand: "KitchenAid", type: "refrigerator", compatibleParts: ["PS11752778", "PS11753399"] },
  { modelNumber: "WDT780SAEM1", brand: "Whirlpool", type: "dishwasher", compatibleParts: ["WPW10195416", "W10872845", "PS11722157", "W10653840", "W10712395"] },
  { modelNumber: "WDT750SAHZ", brand: "Whirlpool", type: "dishwasher", compatibleParts: ["WPW10195416", "W10872845", "PS11722157", "W10653840", "W10712395"] },
  { modelNumber: "KDTM354ESS", brand: "KitchenAid", type: "dishwasher", compatibleParts: ["WPW10195416", "PS11722157", "W10653840", "W10712395"] },
  { modelNumber: "KDTE334GPS", brand: "KitchenAid", type: "dishwasher", compatibleParts: ["WPW10195416", "W10712395"] },
];

export const troubleshootingGuides: TroubleshootingGuide[] = [
  {
    id: "1",
    symptom: "Ice maker not working",
    applianceType: "refrigerator",
    possibleCauses: [
      "Ice maker assembly is faulty",
      "Water inlet valve is clogged or defective",
      "Water filter needs replacement",
      "Freezer temperature is too warm",
      "Ice maker arm or switch is in OFF position"
    ],
    recommendedParts: ["PS11752778", "PS11743427"],
    steps: [
      "Check if the ice maker is turned on (arm down or switch on)",
      "Verify the freezer temperature is between 0-5°F (-18 to -15°C)",
      "Inspect the water supply line for kinks or blockages",
      "Check if the water filter needs replacement (replace every 6 months)",
      "Listen for the ice maker cycling - if silent, the motor module may be faulty",
      "If water is entering but not freezing into cubes, the ice maker assembly likely needs replacement"
    ]
  },
  {
    id: "2",
    symptom: "Refrigerator not cooling",
    applianceType: "refrigerator",
    possibleCauses: [
      "Evaporator fan motor is faulty",
      "Condenser coils are dirty",
      "Defrost system malfunction",
      "Temperature control thermostat is faulty"
    ],
    recommendedParts: ["PS11752927", "PS11753399"],
    steps: [
      "Check if the freezer is cold - if freezer works but fridge doesn't, it's likely the evaporator fan",
      "Clean the condenser coils (usually at the bottom or back of the fridge)",
      "Check for frost buildup on the back panel inside the freezer - indicates defrost issue",
      "Verify the temperature settings haven't been accidentally changed"
    ]
  },
  {
    id: "3",
    symptom: "Dishwasher not draining",
    applianceType: "dishwasher",
    possibleCauses: [
      "Drain pump is clogged or faulty",
      "Drain hose is kinked or clogged",
      "Garbage disposal knockout plug wasn't removed",
      "Food debris blocking the drain"
    ],
    recommendedParts: ["W10712395", "WPW10195416"],
    steps: [
      "Remove any visible food debris from the bottom of the dishwasher",
      "Check the drain filter and clean it thoroughly",
      "Inspect the drain hose for kinks or clogs",
      "If connected to a garbage disposal, ensure the knockout plug was removed during installation",
      "Run the garbage disposal to clear any blockage",
      "Listen for the drain pump during the cycle - if silent, the pump may be faulty"
    ]
  },
  {
    id: "4",
    symptom: "Dishwasher not filling with water",
    applianceType: "dishwasher",
    possibleCauses: [
      "Water inlet valve is defective",
      "Water supply is turned off",
      "Float switch is stuck",
      "Door latch isn't engaging properly"
    ],
    recommendedParts: ["W10653840", "W10872845"],
    steps: [
      "Verify the water supply valve under the sink is fully open",
      "Check that the door is closing and latching properly",
      "Look for the float in the bottom of the dishwasher tub - ensure it moves freely",
      "Listen for water entering when cycle starts - if no sound, inlet valve may be faulty",
      "Check the water inlet screen for debris or mineral buildup"
    ]
  },
  {
    id: "5",
    symptom: "Dishes not getting clean",
    applianceType: "dishwasher",
    possibleCauses: [
      "Spray arms are clogged or damaged",
      "Water temperature is too low",
      "Wash pump is weak or failing",
      "Detergent dispenser isn't working"
    ],
    recommendedParts: ["PS11722157", "WPW10195416"],
    steps: [
      "Inspect spray arms for clogs - clean the spray holes with a toothpick",
      "Run hot water at the sink before starting the dishwasher to ensure hot water",
      "Check that spray arms spin freely",
      "Ensure you're using the correct amount of detergent",
      "Clean the filter and remove any food debris",
      "Consider replacing spray arms if holes are enlarged or arms are cracked"
    ]
  },
  {
    id: "6",
    symptom: "Refrigerator is leaking water",
    applianceType: "refrigerator",
    possibleCauses: [
      "Defrost drain is clogged",
      "Water inlet valve is leaking",
      "Door gasket is damaged",
      "Drain pan is cracked or overflowing"
    ],
    recommendedParts: ["PS11757023", "PS11743427"],
    steps: [
      "Check where the water is coming from - inside or underneath",
      "If water pools inside at the bottom, the defrost drain may be clogged",
      "Flush the defrost drain with warm water",
      "Inspect door gaskets for tears or gaps that could cause condensation",
      "Check the water supply line connection behind the refrigerator",
      "Examine the drain pan under the refrigerator for cracks"
    ]
  }
];

export const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "PS-2024-78542",
    status: "shipped",
    items: [
      { partNumber: "PS11752778", name: "Ice Maker Assembly", quantity: 1, price: 89.95 },
      { partNumber: "PS11743427", name: "Refrigerator Water Filter", quantity: 2, price: 49.99 }
    ],
    shippingAddress: "123 Main St, Anytown, USA 12345",
    trackingNumber: "1Z999AA10123456784",
    estimatedDelivery: "February 4, 2026",
    createdAt: new Date("2026-01-28")
  },
  {
    id: "2",
    orderNumber: "PS-2024-78123",
    status: "delivered",
    items: [
      { partNumber: "W10712395", name: "Dishwasher Drain Pump", quantity: 1, price: 67.50 }
    ],
    shippingAddress: "456 Oak Ave, Springfield, USA 67890",
    trackingNumber: "1Z999AA10123456785",
    estimatedDelivery: "January 25, 2026",
    createdAt: new Date("2026-01-20")
  },
  {
    id: "3",
    orderNumber: "PS-2024-79001",
    status: "processing",
    items: [
      { partNumber: "WPW10195416", name: "Dishwasher Pump and Motor Assembly", quantity: 1, price: 189.99 }
    ],
    shippingAddress: "789 Pine Rd, Lakeville, USA 11223",
    createdAt: new Date("2026-01-31")
  }
];

export const findProductByPartNumber = (partNumber: string): Product | undefined => {
  return products.find(p => p.partNumber.toLowerCase() === partNumber.toLowerCase());
};

export const findProductsByCategory = (category: "refrigerator" | "dishwasher"): Product[] => {
  return products.filter(p => p.category === category);
};

export const findCompatibleParts = (modelNumber: string): Product[] => {
  const model = modelDatabase.find(m => m.modelNumber.toLowerCase() === modelNumber.toLowerCase());
  if (!model) return [];
  return products.filter(p => model.compatibleParts.includes(p.partNumber));
};

export const checkCompatibility = (partNumber: string, modelNumber: string): { compatible: boolean; model?: ModelInfo } => {
  const model = modelDatabase.find(m => m.modelNumber.toLowerCase() === modelNumber.toLowerCase());
  if (!model) return { compatible: false };
  const isCompatible = model.compatibleParts.includes(partNumber);
  return { compatible: isCompatible, model };
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(p => 
    p.name.toLowerCase().includes(lowercaseQuery) ||
    p.description.toLowerCase().includes(lowercaseQuery) ||
    p.partNumber.toLowerCase().includes(lowercaseQuery) ||
    p.brand.toLowerCase().includes(lowercaseQuery)
  );
};

export const findTroubleshootingGuide = (symptom: string, applianceType?: "refrigerator" | "dishwasher"): TroubleshootingGuide[] => {
  const lowercaseSymptom = symptom.toLowerCase();
  return troubleshootingGuides.filter(g => {
    const matchesSymptom = g.symptom.toLowerCase().includes(lowercaseSymptom) ||
      g.possibleCauses.some(c => c.toLowerCase().includes(lowercaseSymptom));
    const matchesType = !applianceType || g.applianceType === applianceType;
    return matchesSymptom && matchesType;
  });
};

export const findOrderByNumber = (orderNumber: string): Order | undefined => {
  return mockOrders.find(o => o.orderNumber.toLowerCase() === orderNumber.toLowerCase());
};

export const supportTickets: SupportTicket[] = [];
let ticketCounter = 10001;

export interface CreateTicketParams extends SupportTicketFormData {
  conversationSummary: string;
  stepsAlreadyTried: string[];
  priority?: TicketPriority;
}

export const createSupportTicket = (params: CreateTicketParams): SupportTicket => {
  const newTicket: SupportTicket = {
    id: String(supportTickets.length + 1),
    ticketNumber: `ST-2024-${ticketCounter++}`,
    status: "open",
    priority: params.priority || "normal",
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    customerPhone: params.customerPhone,
    issueType: params.issueType,
    applianceType: params.applianceType,
    modelNumber: params.modelNumber,
    partNumber: params.partNumber,
    issueDescription: params.issueDescription,
    conversationSummary: params.conversationSummary,
    stepsAlreadyTried: params.stepsAlreadyTried,
    createdAt: new Date(),
  };
  supportTickets.push(newTicket);
  return newTicket;
};

export const findTicketByNumber = (ticketNumber: string): SupportTicket | undefined => {
  return supportTickets.find(t => t.ticketNumber.toLowerCase() === ticketNumber.toLowerCase());
};

export const getAllTickets = (): SupportTicket[] => {
  return [...supportTickets];
};
