import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  const models = ["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: "hi"
      });
      console.log(`Success ${model}:`, response.text);
    } catch (e: any) {
      console.error(`Error ${model}:`, e.status, e.message);
    }
  }
}
test();
