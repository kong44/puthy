import { GoogleGenAI, Type } from "@google/genai";
import fallbackQuotes from "../data/fallbackQuotes.json";

// Safe way to access process.env in Vite/Browser environment
const getApiKey = () => {
  try {
    return process.env.GEMINI_API_KEY;
  } catch (e) {
    return undefined;
  }
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface Quote {
  khmer: string;
  english: string;
  author: string;
  category: string;
}

const CACHE_KEY = "puthy_wisdom_quotes_cache";

function getCachedQuotes(): Quote[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    return [];
  }
}

function saveToCache(quote: Quote) {
  try {
    const cached = getCachedQuotes();
    if (!cached.some(q => q.khmer === quote.khmer)) {
      const updated = [quote, ...cached].slice(0, 50);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error("Failed to save to cache", e);
  }
}

function getFallbackQuote(category: string): Quote {
  const cached = getCachedQuotes().filter(q => q.category === category);
  const local = (fallbackQuotes as Quote[]).filter(q => q.category === category);
  
  // Combine both pools for better variety
  const pool = [...cached, ...local];
  
  if (pool.length === 0) {
    // If no match for category in either pool, pick any from fallback
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)] as Quote;
  }
  
  // Pick a random one from the combined pool
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function generateQuote(category: string = "wisdom"): Promise<Quote> {
  const currentKey = getApiKey();
  
  if (!currentKey || currentKey === "MY_GEMINI_API_KEY" || currentKey === "") {
    console.warn("Gemini API key is missing or invalid. Using fallback quotes.");
    return getFallbackQuote(category);
  }

  const model = "gemini-3-flash-preview";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate an inspirational or wise quote in both Khmer and English. 
      The category is: ${category}.
      Ensure the Khmer translation is natural and culturally appropriate.
      Return the result in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            khmer: { type: Type.STRING, description: "The quote in Khmer language" },
            english: { type: Type.STRING, description: "The quote in English language" },
            author: { type: Type.STRING, description: "The author of the quote (or 'Unknown')" },
            category: { type: Type.STRING, description: "The category of the quote" },
          },
          required: ["khmer", "english", "author", "category"],
        },
      },
    });

    let text = response.text || "";
    
    // Clean up potential markdown formatting if present
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0].trim();
    } else if (text.includes("```")) {
      text = text.split("```")[1].split("```")[0].trim();
    }

    const quote = JSON.parse(text) as Quote;
    saveToCache(quote);
    return quote;
  } catch (error) {
    console.error("Gemini API call failed, using fallback:", error);
    return getFallbackQuote(category);
  }
}
