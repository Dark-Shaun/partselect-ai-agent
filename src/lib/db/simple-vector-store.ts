import * as fs from "fs";
import * as path from "path";

export interface StoredPart {
  id: string;
  partNumber: string;
  manufacturerPartNumber?: string;
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
  embedding?: number[];
  searchText: string;
  url?: string;
}

let partsCache: StoredPart[] | null = null;

const loadParts = (): StoredPart[] => {
  if (partsCache) return partsCache;
  
  try {
    const dataPath = path.join(process.cwd(), "data", "scraped-parts.json");
    const rawData = fs.readFileSync(dataPath, "utf-8");
    const parts = JSON.parse(rawData);
    
    partsCache = parts.map((part: Omit<StoredPart, 'id' | 'searchText'>, index: number) => ({
      ...part,
      id: `part_${index}`,
      searchText: buildSearchText(part),
    }));
    
    return partsCache;
  } catch (error) {
    console.error("Error loading parts data:", error);
    return [];
  }
};

const buildSearchText = (part: Partial<StoredPart>): string => {
  const symptoms = part.symptoms?.join(" ") || "";
  const models = part.compatibleModels?.join(" ") || "";
  return `${part.name} ${part.description} ${part.category} ${part.brand} ${part.partNumber} ${symptoms} ${models}`.toLowerCase();
};

const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const textSimilarity = (query: string, text: string, partName?: string): number => {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const textLower = text.toLowerCase();
  const nameLower = partName?.toLowerCase() || "";
  
  let matchCount = 0;
  let exactMatchBonus = 0;
  let nameMatchBonus = 0;
  
  for (const word of queryWords) {
    if (textLower.includes(word)) {
      matchCount++;
      if (textLower.includes(` ${word} `) || textLower.startsWith(word) || textLower.endsWith(word)) {
        exactMatchBonus += 0.5;
      }
      if (nameLower.includes(word)) {
        nameMatchBonus += 2.0;
      }
    }
  }
  
  return queryWords.length > 0 ? (matchCount + exactMatchBonus + nameMatchBonus) / queryWords.length : 0;
};

export interface SearchOptions {
  category?: "refrigerator" | "dishwasher";
  maxResults?: number;
  minScore?: number;
  sortBy?: "relevance" | "price" | "rating" | "reviews";
  sortOrder?: "asc" | "desc";
}

export interface SearchResult extends StoredPart {
  score: number;
}

export const searchParts = (query: string, options: SearchOptions = {}): SearchResult[] => {
  const { category, maxResults = 5, minScore = 0.4, sortBy = "relevance", sortOrder = "desc" } = options;
  const parts = loadParts();
  
  let filteredParts = parts;
  if (category) {
    filteredParts = parts.filter(p => p.category === category);
  }
  
  const results: SearchResult[] = filteredParts.map(part => ({
    ...part,
    score: textSimilarity(query, part.searchText, part.name),
  }));
  
  const filtered = results.filter(r => r.score >= minScore);
  
  const sortFunctions: Record<string, (a: SearchResult, b: SearchResult) => number> = {
    relevance: (a, b) => sortOrder === "desc" ? b.score - a.score : a.score - b.score,
    price: (a, b) => sortOrder === "asc" ? a.price - b.price : b.price - a.price,
    rating: (a, b) => sortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating,
    reviews: (a, b) => sortOrder === "desc" ? b.reviewCount - a.reviewCount : a.reviewCount - b.reviewCount,
  };
  
  const sortFn = sortFunctions[sortBy] || sortFunctions.relevance;
  
  return filtered.sort(sortFn).slice(0, maxResults);
};

export const searchBySymptom = (symptom: string, options: SearchOptions = {}): SearchResult[] => {
  const { category, maxResults = 5 } = options;
  const parts = loadParts();
  
  let filteredParts = parts;
  if (category) {
    filteredParts = parts.filter(p => p.category === category);
  }
  
  const symptomLower = symptom.toLowerCase();
  
  const results: SearchResult[] = filteredParts
    .filter(part => part.symptoms && part.symptoms.length > 0)
    .map(part => {
      const symptomMatches = part.symptoms!.filter(s => 
        s.toLowerCase().includes(symptomLower) || 
        symptomLower.includes(s.toLowerCase())
      );
      
      const score = symptomMatches.length > 0 
        ? 1 + (symptomMatches.length * 0.2) 
        : textSimilarity(symptom, part.searchText);
      
      return { ...part, score };
    });
  
  return results
    .filter(r => r.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
};

export const getPartByNumber = (partNumber: string): StoredPart | undefined => {
  const parts = loadParts();
  return parts.find(p => p.partNumber.toLowerCase() === partNumber.toLowerCase());
};

export interface CompatiblePartsOptions {
  maxResults?: number;
  sortBy?: "relevance" | "price" | "rating" | "reviews";
  sortOrder?: "asc" | "desc";
}

export const getCompatibleParts = (modelNumber: string, options: CompatiblePartsOptions = {}): StoredPart[] => {
  const { maxResults, sortBy = "rating", sortOrder = "desc" } = options;
  const parts = loadParts();
  const modelLower = modelNumber.toLowerCase();
  
  let compatible = parts.filter(part => 
    part.compatibleModels.some(m => m.toLowerCase().includes(modelLower))
  );
  
  const sortFunctions: Record<string, (a: StoredPart, b: StoredPart) => number> = {
    relevance: () => 0,
    price: (a, b) => sortOrder === "asc" ? a.price - b.price : b.price - a.price,
    rating: (a, b) => sortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating,
    reviews: (a, b) => sortOrder === "desc" ? b.reviewCount - a.reviewCount : a.reviewCount - b.reviewCount,
  };
  
  const sortFn = sortFunctions[sortBy] || sortFunctions.rating;
  compatible = compatible.sort(sortFn);
  
  if (maxResults) {
    return compatible.slice(0, maxResults);
  }
  
  return compatible;
};

export const checkCompatibility = (partNumber: string, modelNumber: string): {
  isCompatible: boolean;
  part?: StoredPart;
  compatibleModels: string[];
} => {
  const part = getPartByNumber(partNumber);
  if (!part) {
    return { isCompatible: false, compatibleModels: [] };
  }
  
  const modelLower = modelNumber.toLowerCase();
  const isCompatible = part.compatibleModels.some(m => 
    m.toLowerCase().includes(modelLower) || modelLower.includes(m.toLowerCase())
  );
  
  return {
    isCompatible,
    part,
    compatibleModels: part.compatibleModels,
  };
};

export const getAllParts = (): StoredPart[] => {
  return loadParts();
};

export const getPartsByCategory = (category: "refrigerator" | "dishwasher"): StoredPart[] => {
  return loadParts().filter(p => p.category === category);
};

export const clearCache = (): void => {
  partsCache = null;
};
