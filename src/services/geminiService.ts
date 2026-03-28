import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Quote {
  khmer: string;
  english: string;
  author: string;
  category: string;
}

export async function generateQuote(category: string = "wisdom"): Promise<Quote> {
  const model = "gemini-3-flash-preview";
  
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

  try {
    const text = response.text;
    return JSON.parse(text) as Quote;
  } catch (error) {
    console.error("Failed to parse quote response:", error);
    throw new Error("Failed to generate a valid quote.");
  }
}
