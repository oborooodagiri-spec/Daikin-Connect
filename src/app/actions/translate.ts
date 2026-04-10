"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * AI Professional Technical Translation Action (Optimized)
 * Translates a map of strings using a specialized Daikin HVAC Engineer persona.
 * This version is lightweight to avoid hit 1MB Server Action payload limits.
 */
export async function translateReportStringsAction(
  translatableMap: Record<string, any>, 
  targetLang: 'en' | 'ja' | 'id'
) {
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: "Missing GEMINI_API_KEY" };
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Corrected to a stable available model
      systemInstruction: `You are a Senior Daikin HVAC Technical Specialist and Professional Japanese Translator. 
      Your task is to translate technical maintenance notes into ${targetLang === 'en' ? 'Technical English' : targetLang === 'ja' ? 'Technical Japanese' : 'Bahasa Indonesia'}.
      
      CRITICAL RULES:
      1. Use precise engineering terminology (e.g., HVAC, BMS, Chilled Water System, Coil, Fins, Bearing).
      2. For Japanese translation, use formal business language (Keigo) suitable for professional reports.
      3. Maintain the exact same JSON structure as the input.
      4. Only translate strings that contain descriptive text.
      5. Do NOT translate numerical values, units (m/s, Bar, °C), or codes (DKN001, etc.).
      6. If a field is empty or "-", keep it as is.
      7. Be concise and accurate.
      
      Target Language: ${targetLang}`
    });

    const prompt = `Translate the following report fields into ${targetLang}. Return ONLY the translated JSON object:
    ${JSON.stringify(translatableMap, null, 2)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up response
    if (text.includes("```json")) {
      text = text.match(/```json\n([\s\S]*?)\n```/)?.[1] || text;
    } else if (text.includes("```")) {
       text = text.match(/```\n([\s\S]*?)\n```/)?.[1] || text;
    }

    const translatedMap = JSON.parse(text);

    return { success: true, translatedMap };

  } catch (error: any) {
    console.error("AI Translation Error:", error);
    return { success: false, error: error.message || "Failed to translate strings" };
  }
}
