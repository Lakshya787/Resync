import { GoogleGenAI } from "@google/genai";

const primaryAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const fallbackAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_1,
});

export const generateAI = async (prompt) => {
  try {
    const response = await primaryAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (err) {
    // fallback to secondary key
    const response = await fallbackAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  }
};

export const parseGeminiJSON = (text) => {
  const clean = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    throw new Error("Failed to parse Gemini response as JSON");
  }
};