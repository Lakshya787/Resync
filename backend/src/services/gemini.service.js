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