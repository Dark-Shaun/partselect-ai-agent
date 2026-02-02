import * as fs from "fs";
import * as path from "path";

interface ScrapedPart {
  partNumber: string;
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
  symptoms?: string[];
}

const refrigeratorParts: Partial<ScrapedPart>[] = [
  { name: "Ice Maker Assembly", partNumber: "PS11752778", description: "Complete ice maker assembly that produces crescent-shaped ice cubes. Includes motor module, ice mold, and ejector components. Common replacement when ice maker stops producing ice or makes smaller cubes than normal.", price: 89.95, originalPrice: 109.99, symptoms: ["ice maker not working", "no ice", "ice maker not making ice"] },
  { name: "Refrigerator Water Filter", partNumber: "PS11743427", description: "EveryDrop EDR1RXD1 water filter. NSF certified to reduce lead, pesticides, pharmaceuticals, and other contaminants. Replace every 6 months for optimal performance.", price: 49.99, symptoms: ["water tastes bad", "filter light on", "slow water dispenser"] },
  { name: "Evaporator Fan Motor", partNumber: "PS11752927", description: "Circulates cold air throughout refrigerator and freezer. If freezer is cold but fridge section is warm, this motor may need replacement. Listen for unusual noises from inside the freezer.", price: 45.99, originalPrice: 59.99, symptoms: ["fridge not cooling", "freezer works but fridge warm", "humming noise"] },
  { name: "Defrost Thermostat", partNumber: "PS11753399", description: "Controls the defrost heater to prevent frost buildup on evaporator coils. Faulty thermostat causes excessive frost or cooling issues.", price: 23.75, symptoms: ["frost buildup", "freezer icing up", "not defrosting"] },
  { name: "Compressor Start Relay", partNumber: "PS11747867", description: "Helps compressor start properly. If refrigerator clicks but doesn't cool, this relay may be faulty. Easy DIY replacement.", price: 15.99, symptoms: ["clicking noise", "compressor won't start", "fridge not cooling"] },
  { name: "Door Gasket Seal - Fresh Food", partNumber: "PS11757023", description: "Magnetic door seal for fresh food compartment. Damaged gaskets cause air leaks, temperature issues, and increased energy bills.", price: 74.50, symptoms: ["door not sealing", "condensation", "warm spots"] },
  { name: "Water Inlet Valve", partNumber: "PS11749827", description: "Controls water flow to ice maker and dispenser. Replace if ice maker won't fill or water dispenser has low pressure.", price: 52.99, symptoms: ["no water to ice maker", "slow water dispenser", "leaking"] },
  { name: "Defrost Heater Assembly", partNumber: "PS11757119", description: "Melts frost from evaporator coils during defrost cycle. Faulty heater causes frost buildup and cooling problems.", price: 67.50, originalPrice: 79.99, symptoms: ["frost on back wall", "not defrosting", "warm fridge"] },
  { name: "Temperature Control Thermostat", partNumber: "PS11750673", description: "Monitors temperature and controls cooling cycle. Replace if refrigerator is too cold, too warm, or temperature fluctuates.", price: 38.95, symptoms: ["temperature fluctuating", "too cold", "too warm"] },
  { name: "Condenser Fan Motor", partNumber: "PS11757074", description: "Cools the compressor and condenser coils. Located near bottom back. Replace if motor is noisy or not running.", price: 54.99, symptoms: ["compressor overheating", "loud noise from back", "fridge not cooling"] },
  { name: "Ice Maker Water Inlet Tube", partNumber: "PS11739097", description: "Delivers water to ice maker mold. Replace if cracked, kinked, or clogged causing ice maker issues.", price: 12.50, symptoms: ["ice maker not filling", "small ice cubes", "no ice"] },
  { name: "Refrigerator Crisper Drawer", partNumber: "PS11752449", description: "Fresh vegetable crisper drawer with humidity control. OEM replacement for cracked or broken drawers.", price: 89.00, symptoms: ["drawer cracked", "drawer broken", "vegetables spoiling"] },
  { name: "Door Shelf Bin", partNumber: "PS11739091", description: "Clear door bin for storing condiments and beverages. Direct replacement for cracked or broken bins.", price: 34.95, symptoms: ["bin cracked", "bin broken", "door storage"] },
  { name: "Refrigerator Light Bulb", partNumber: "PS11752778", description: "40W appliance bulb for interior lighting. Replace when light stops working or flickers.", price: 8.99, symptoms: ["light not working", "light flickering", "dark inside"] },
  { name: "Water Filter Housing", partNumber: "PS11749505", description: "Houses the water filter cartridge. Replace if cracked or leaking around filter area.", price: 42.99, symptoms: ["filter leaking", "water dripping", "filter housing cracked"] },
  { name: "Ice Dispenser Actuator", partNumber: "PS11752535", description: "Activates ice dispenser when paddle is pressed. Replace if dispenser doesn't respond to paddle.", price: 28.50, symptoms: ["dispenser not working", "no ice dispensing", "paddle broken"] },
  { name: "Freezer Door Gasket", partNumber: "PS11757024", description: "Magnetic seal for freezer door. Proper seal prevents frost buildup and maintains temperature.", price: 68.95, symptoms: ["freezer frost", "door not sealing", "freezer not cold enough"] },
  { name: "Refrigerator Thermostat Control Board", partNumber: "PS11752853", description: "Main control board managing temperature and defrost cycles. Replace for erratic temperature or control issues.", price: 189.99, originalPrice: 229.99, symptoms: ["erratic temperature", "control not working", "display issues"] },
  { name: "Evaporator Cover", partNumber: "PS11752862", description: "Cover panel for evaporator coils in freezer. Replace if cracked, warped, or frost accumulates behind it.", price: 45.00, symptoms: ["frost buildup", "cover cracked", "ice behind panel"] },
  { name: "Defrost Timer", partNumber: "PS11750412", description: "Controls automatic defrost cycle timing. Mechanical timer that can wear out causing frost or defrost issues.", price: 51.99, symptoms: ["frost buildup", "constant defrosting", "not defrosting"] },
  { name: "Refrigerator Run Capacitor", partNumber: "PS11752891", description: "Provides starting boost to compressor motor. Replace if compressor hums but won't start.", price: 19.99, symptoms: ["compressor humming", "won't start", "clicking"] },
  { name: "Ice Bucket Assembly", partNumber: "PS11752643", description: "Storage bucket that catches ice from ice maker. Includes auger motor mount.", price: 76.50, symptoms: ["ice bucket cracked", "auger not turning", "ice not dispensing"] },
  { name: "Water Dispenser Actuator", partNumber: "PS11752536", description: "Switch that activates water dispenser. Replace if water doesn't dispense when paddle pressed.", price: 24.99, symptoms: ["no water dispensing", "paddle not working", "dispenser broken"] },
  { name: "Refrigerator Shelf Glass", partNumber: "PS11752400", description: "Tempered glass shelf insert. Replace cracked or broken glass for safe food storage.", price: 62.00, symptoms: ["shelf cracked", "glass broken", "shelf needed"] },
  { name: "Ice Maker Mold and Heater", partNumber: "PS11752790", description: "Ice mold tray with heating element for ice release. Replace if ice cubes stick or are malformed.", price: 98.50, symptoms: ["ice sticking", "malformed ice", "ice not releasing"] },
  { name: "Refrigerator Fan Blade", partNumber: "PS11752934", description: "Replacement fan blade for evaporator or condenser fan. Replace if blade is cracked or broken.", price: 11.99, symptoms: ["loud fan noise", "rattling", "broken blade"] },
  { name: "Door Handle - Stainless", partNumber: "PS11752145", description: "Stainless steel refrigerator door handle. Direct OEM replacement for broken or damaged handles.", price: 89.95, symptoms: ["handle broken", "handle loose", "handle cracked"] },
  { name: "Refrigerator Drip Pan", partNumber: "PS11752288", description: "Collects defrost water under refrigerator. Replace if cracked or if water leaks on floor.", price: 32.50, symptoms: ["water on floor", "drip pan cracked", "water leaking underneath"] },
  { name: "Ice Level Sensor Arm", partNumber: "PS11752802", description: "Senses ice level to control ice maker operation. Replace if ice maker overflows or won't cycle.", price: 18.75, symptoms: ["ice overflow", "too much ice", "ice maker won't stop"] },
  { name: "Refrigerator Compressor", partNumber: "PS11752999", description: "Main compressor unit. Heart of cooling system. Professional installation recommended.", price: 389.99, originalPrice: 449.99, symptoms: ["not cooling at all", "compressor dead", "no cold"] },
];

const dishwasherParts: Partial<ScrapedPart>[] = [
  { name: "Dishwasher Pump and Motor Assembly", partNumber: "WPW10195416", description: "Main wash pump and motor that circulates water through spray arms. Replace if dishwasher won't spray water or makes grinding noises.", price: 189.99, originalPrice: 229.99, symptoms: ["not cleaning dishes", "no spray", "grinding noise"] },
  { name: "Dishwasher Drain Pump", partNumber: "W10712395", description: "Pumps water out during drain cycle. Replace if water doesn't drain or pump makes unusual noises.", price: 67.50, originalPrice: 79.99, symptoms: ["won't drain", "water standing", "drain noise"] },
  { name: "Door Latch Assembly", partNumber: "W10872845", description: "Door latch and strike mechanism. Replace if door won't close properly or dishwasher won't start.", price: 42.50, symptoms: ["door won't latch", "won't start", "door problem"] },
  { name: "Water Inlet Valve", partNumber: "W10653840", description: "Controls water flow into dishwasher. Replace if dishwasher won't fill or fills slowly.", price: 52.99, symptoms: ["no water", "slow fill", "won't fill"] },
  { name: "Upper Spray Arm", partNumber: "W10491331", description: "Rotates and sprays water to clean top rack dishes. Replace if clogged, cracked, or not spinning.", price: 28.95, symptoms: ["top rack not clean", "spray arm broken", "not spinning"] },
  { name: "Lower Spray Arm", partNumber: "W10491330", description: "Main spray arm for bottom rack cleaning. Replace if holes are clogged or arm is damaged.", price: 32.50, symptoms: ["bottom rack not clean", "spray arm clogged", "dishes dirty"] },
  { name: "Dishwasher Rack Adjuster Kit", partNumber: "PS11745957", description: "Repair kit for upper rack height adjustment. Includes wheels, clips, and adjusters.", price: 18.99, symptoms: ["rack won't stay up", "rack falling", "wheels broken"] },
  { name: "Dishwasher Float Switch", partNumber: "W10844024", description: "Prevents overfilling by detecting water level. Replace if dishwasher overfills or won't fill.", price: 24.50, symptoms: ["overfilling", "water overflow", "won't fill properly"] },
  { name: "Detergent Dispenser", partNumber: "W10861000", description: "Dispenses detergent at proper cycle time. Replace if dispenser doesn't open or is damaged.", price: 68.99, symptoms: ["soap not dispensing", "dispenser stuck", "dispenser broken"] },
  { name: "Dishwasher Door Gasket", partNumber: "W10660528", description: "Rubber seal around door edge. Replace if water leaks from door during cycle.", price: 45.00, symptoms: ["leaking from door", "water on floor", "gasket torn"] },
  { name: "Heating Element", partNumber: "W10518394", description: "Heats water for washing and drying. Replace if dishes don't dry or water isn't hot.", price: 54.99, symptoms: ["dishes wet", "not drying", "water cold"] },
  { name: "Dishwasher Control Board", partNumber: "W10854221", description: "Main electronic control board. Replace for button issues, display problems, or erratic operation.", price: 165.00, originalPrice: 199.99, symptoms: ["buttons not working", "display dead", "won't respond"] },
  { name: "Door Strike Plate", partNumber: "W10275768", description: "Metal strike plate for door latch. Replace if door won't close securely.", price: 12.99, symptoms: ["door not closing", "latch not catching", "door loose"] },
  { name: "Dishwasher Silverware Basket", partNumber: "W10861219", description: "Utensil basket for lower rack. Replace if broken, cracked, or missing sections.", price: 34.95, symptoms: ["basket broken", "basket cracked", "silverware falling"] },
  { name: "Upper Rack Assembly", partNumber: "W10311986", description: "Complete upper dish rack with tines and frame. Replace if rack is rusted or damaged.", price: 129.99, symptoms: ["rack rusted", "tines broken", "rack damaged"] },
  { name: "Lower Rack Assembly", partNumber: "W10311987", description: "Complete lower dish rack. Replace for rusted or broken tines.", price: 149.99, symptoms: ["rack rusted", "tines broken", "rack bent"] },
  { name: "Dishwasher Spray Arm Seal", partNumber: "W10195093", description: "Seals spray arm to pump outlet. Replace if water leaks from spray arm connection.", price: 8.50, symptoms: ["leak at spray arm", "water under rack", "spray arm loose"] },
  { name: "Door Hinge Kit", partNumber: "W10810403", description: "Door hinge assembly with springs and cables. Replace if door falls open or won't stay closed.", price: 56.99, symptoms: ["door falls open", "door won't stay", "hinge broken"] },
  { name: "Dishwasher Pump Seal", partNumber: "W10195677", description: "Seals the wash pump shaft. Replace if water leaks from under dishwasher.", price: 15.99, symptoms: ["leak underneath", "water under dishwasher", "pump leaking"] },
  { name: "Rinse Aid Dispenser", partNumber: "W10861001", description: "Dispenses rinse aid for spot-free drying. Replace if rinse aid doesn't dispense.", price: 42.50, symptoms: ["spots on dishes", "rinse aid not dispensing", "dispenser broken"] },
  { name: "Dishwasher Door Handle", partNumber: "W10861225", description: "Exterior door handle. Replace if broken, cracked, or loose.", price: 38.95, symptoms: ["handle broken", "handle loose", "can't open door"] },
  { name: "Vent Assembly with Fan", partNumber: "W10862259", description: "Vents steam during drying cycle. Replace if dishwasher doesn't dry properly.", price: 72.00, symptoms: ["not drying", "steam buildup", "moisture inside"] },
  { name: "Wash Arm Support", partNumber: "W10195094", description: "Supports and positions lower spray arm. Replace if spray arm wobbles or doesn't spin.", price: 19.99, symptoms: ["spray arm wobbling", "not spinning", "support broken"] },
  { name: "Dishwasher Door Spring", partNumber: "W10810388", description: "Counterbalance spring for door. Replace if door slams shut or won't stay open.", price: 22.50, symptoms: ["door slamming", "won't stay open", "spring broken"] },
  { name: "Dishwasher Filter Assembly", partNumber: "W10872845", description: "Filters food debris from wash water. Clean regularly or replace if damaged.", price: 35.99, symptoms: ["dishes dirty", "food particles", "filter clogged"] },
  { name: "Turbidity Sensor", partNumber: "W10705575", description: "Senses water cleanliness to optimize cycles. Replace for cycle timing issues.", price: 48.50, symptoms: ["long cycles", "short cycles", "sensor error"] },
  { name: "Dishwasher Tub Gasket", partNumber: "W10860089", description: "Seals tub to door frame. Replace if water leaks around door edges.", price: 28.99, symptoms: ["leak around door", "water escaping", "gasket worn"] },
  { name: "Control Panel Overlay", partNumber: "W10861214", description: "Button panel overlay. Replace if buttons are worn, peeling, or hard to read.", price: 45.00, symptoms: ["buttons worn", "labels faded", "panel peeling"] },
  { name: "Dishwasher Motor Capacitor", partNumber: "W10804665", description: "Provides starting power to pump motor. Replace if motor hums but won't start.", price: 24.99, symptoms: ["motor humming", "won't start", "pump not running"] },
  { name: "Door Balance Link Kit", partNumber: "W10810398", description: "Links and cables for door balance system. Replace if door doesn't stay in position.", price: 31.50, symptoms: ["door won't stay", "door drops", "balance issue"] },
];

const brands = ["Whirlpool", "GE", "Samsung", "LG", "Frigidaire", "KitchenAid", "Maytag", "Kenmore", "Bosch"];
const refrigeratorModels = ["WRS325SDHZ", "WRS588FIHZ", "WRF555SDFZ", "WRX735SDHZ", "KRSC503ESS", "GSS25GSHSS", "GFE26JSMSS", "RF28HMEDBSR", "RF263BEAESR", "LFXS26973S"];
const dishwasherModels = ["WDT780SAEM1", "WDT750SAHZ", "KDTM354ESS", "KDTE334GPS", "WDF520PADM", "GDF520PGJWW", "FFCD2418US", "FGID2466QF", "LDF5545ST", "SHPM88Z75N"];
const difficulties: ("Easy" | "Moderate" | "Difficult")[] = ["Easy", "Moderate", "Difficult"];
const times = ["5-10 minutes", "15-30 minutes", "30-45 minutes", "45-60 minutes", "60-90 minutes"];

const generateProduct = (part: Partial<ScrapedPart>, index: number, category: "refrigerator" | "dishwasher"): ScrapedPart => {
  const models = category === "refrigerator" ? refrigeratorModels : dishwasherModels;
  const numModels = Math.floor(Math.random() * 5) + 3;
  const selectedModels = [...models].sort(() => Math.random() - 0.5).slice(0, numModels);
  
  return {
    partNumber: part.partNumber || `PS${10000000 + index}`,
    name: part.name || "Replacement Part",
    description: part.description || "OEM replacement part for your appliance.",
    price: part.price || Math.floor(Math.random() * 150) + 20,
    originalPrice: part.originalPrice,
    imageUrl: `https://placehold.co/200x200/e2e8f0/475569?text=${encodeURIComponent(part.partNumber || "Part")}`,
    rating: Math.round((Math.random() * 1 + 4) * 10) / 10,
    reviewCount: Math.floor(Math.random() * 2000) + 100,
    inStock: Math.random() > 0.1,
    brand: brands[Math.floor(Math.random() * brands.length)],
    category,
    compatibleModels: selectedModels,
    installationDifficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    installationTime: times[Math.floor(Math.random() * times.length)],
    symptoms: part.symptoms,
  };
};

const generateAllProducts = (): ScrapedPart[] => {
  const products: ScrapedPart[] = [];
  
  refrigeratorParts.forEach((part, index) => {
    products.push(generateProduct(part, index, "refrigerator"));
  });
  
  dishwasherParts.forEach((part, index) => {
    products.push(generateProduct(part, refrigeratorParts.length + index, "dishwasher"));
  });
  
  return products;
};

const main = () => {
  console.log("Generating product data...");
  const products = generateAllProducts();
  
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const outputPath = path.join(dataDir, "scraped-parts.json");
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
  
  console.log(`Generated ${products.length} products`);
  console.log(`- Refrigerator parts: ${products.filter(p => p.category === "refrigerator").length}`);
  console.log(`- Dishwasher parts: ${products.filter(p => p.category === "dishwasher").length}`);
  console.log(`Saved to: ${outputPath}`);
};

main();
