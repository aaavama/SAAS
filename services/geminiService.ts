import { GoogleGenAI, Type } from "@google/genai";
import { AIInvoiceExtraction } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to check if API key is set
export const hasApiKey = (): boolean => !!apiKey;

/**
 * Parses natural language invoice descriptions into structured items.
 * Example input: "10 hours of web development at $50/hr and a $200 hosting fee"
 */
export const parseInvoiceText = async (text: string): Promise<AIInvoiceExtraction> => {
  if (!apiKey) throw new Error("API Key missing");

  const model = "gemini-2.5-flash";
  const systemInstruction = `You are a helpful accounting assistant. 
  Extract invoice line items and a brief summary note from the user's natural language description.
  If the quantity isn't specified, assume 1. If price isn't specified, assume 0.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Parse this invoice description: "${text}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  price: { type: Type.NUMBER },
                },
                required: ["description", "quantity", "price"],
              },
            },
            suggestedNotes: { type: Type.STRING },
          },
          required: ["items"],
        },
      },
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as AIInvoiceExtraction;
  } catch (error) {
    console.error("Gemini parse error:", error);
    throw new Error("Failed to parse invoice text with AI.");
  }
};

/**
 * Generates a polite email reminder for an invoice.
 */
export const generateEmailReminder = async (clientName: string, invoiceNumber: string, amount: string, dueDate: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  const model = "gemini-2.5-flash";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Write a polite, professional, and concise email reminder to ${clientName} for Invoice #${invoiceNumber} totaling ${amount}, which is due on ${dueDate}.
      Do not include subject line placeholders, just give me the body text.`,
    });
    return response.text || "Could not generate email.";
  } catch (error) {
    console.error("Gemini email generation error:", error);
    return "Error generating email. Please try again.";
  }
};
