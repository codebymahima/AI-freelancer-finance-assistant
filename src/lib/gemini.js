import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export async function askFinanceAssistant(question) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
You are a helpful finance assistant for freelancers.

Answer clearly and practically.

Rules:
- Keep the answer under 180 words.
- Use short bullet points.
- Do not give legal/tax advice as final truth.
- End with one practical recommendation.

Question:
${question}
    `,
  });

  return response.text;
}