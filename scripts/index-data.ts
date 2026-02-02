import * as fs from "fs";
import * as path from "path";
import { ChromaClient } from "chromadb";

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
  installationDifficulty: string;
  installationTime: string;
  symptoms?: string[];
}

const COLLECTION_NAME = "partselect_parts";

const main = async () => {
  console.log("Starting data indexing...");
  
  const dataPath = path.join(process.cwd(), "data", "scraped-parts.json");
  if (!fs.existsSync(dataPath)) {
    console.error("No data file found. Run 'npm run generate-data' first.");
    process.exit(1);
  }
  
  const parts: ScrapedPart[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  console.log(`Loaded ${parts.length} parts from data file`);
  
  const client = new ChromaClient();
  
  try {
    await client.deleteCollection({ name: COLLECTION_NAME });
    console.log("Deleted existing collection");
  } catch {
    console.log("No existing collection to delete");
  }
  
  const collection = await client.createCollection({
    name: COLLECTION_NAME,
    metadata: { description: "PartSelect refrigerator and dishwasher parts" },
  });
  console.log("Created new collection");
  
  const ids: string[] = [];
  const documents: string[] = [];
  const metadatas: Record<string, string | number | boolean | null>[] = [];
  
  parts.forEach((part, index) => {
    const symptomsText = part.symptoms?.join(", ") || "";
    const document = `${part.name}. ${part.description}. Category: ${part.category}. Brand: ${part.brand}. Part Number: ${part.partNumber}. Symptoms: ${symptomsText}. Compatible with: ${part.compatibleModels.join(", ")}.`;
    
    ids.push(`part_${index}`);
    documents.push(document);
    metadatas.push({
      partNumber: part.partNumber,
      name: part.name,
      description: part.description,
      category: part.category,
      brand: part.brand,
      price: part.price,
      originalPrice: part.originalPrice || null,
      imageUrl: part.imageUrl,
      rating: part.rating,
      reviewCount: part.reviewCount,
      inStock: part.inStock,
      installationDifficulty: part.installationDifficulty,
      installationTime: part.installationTime,
      symptoms: symptomsText,
      compatibleModels: part.compatibleModels.join(", "),
    });
  });
  
  console.log("Adding documents to collection (using default embeddings)...");
  
  const batchSize = 20;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batchIds = ids.slice(i, i + batchSize);
    const batchDocs = documents.slice(i, i + batchSize);
    const batchMeta = metadatas.slice(i, i + batchSize);
    
    await collection.add({
      ids: batchIds,
      documents: batchDocs,
      metadatas: batchMeta,
    });
    
    console.log(`Indexed ${Math.min(i + batchSize, ids.length)}/${ids.length} parts`);
  }
  
  const count = await collection.count();
  console.log(`\nIndexing complete! Collection has ${count} documents.`);
  
  console.log("\nTesting search...");
  const testResults = await collection.query({
    queryTexts: ["ice maker not working"],
    nResults: 3,
  });
  
  console.log("Search results for 'ice maker not working':");
  testResults.ids[0]?.forEach((id, idx) => {
    const meta = testResults.metadatas?.[0]?.[idx];
    console.log(`  ${idx + 1}. ${meta?.name} (${meta?.partNumber}) - $${meta?.price}`);
  });
};

main().catch(console.error);
