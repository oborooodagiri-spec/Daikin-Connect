import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveAttendance } from "@/app/actions/attendance";
import { getSession } from "@/app/actions/auth";
import { serializePrisma } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const apiKey = process.env.GEMINI_API_KEY || "";
    const apiKeyLength = apiKey.length;
    const apiKeyMasked = apiKeyLength > 8 ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKeyLength - 4)}` : "too short/empty";

    let geminiTest: any = { status: "Not tested" };
    
    if (apiKey) {
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Test 1: Simple text generation with gemini-1.5-flash
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent("Hello! Are you working?");
          geminiTest.flashTextGen = result.response.text();
        } catch (e: any) {
          geminiTest.flashTextGenError = e.message || String(e);
        }

        // Test 2: Simple text generation with gemini-1.5-pro
        try {
          const modelPro = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
          const result = await modelPro.generateContent("Hello! Are you working?");
          geminiTest.proTextGen = result.response.text();
        } catch (e: any) {
          geminiTest.proTextGenError = e.message || String(e);
        }

        // Test 3: List models if possible (some keys don't support listing but let's try)
        try {
          // ListModels is not always directly exposed in newer JS SDK versions but let's see if we can fetch
          const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
          const data = await response.json();
          geminiTest.availableModels = data;
        } catch (e: any) {
          geminiTest.listModelsError = e.message || String(e);
        }

      } catch (err: any) {
        geminiTest.initError = err.message || String(err);
      }
    }

    return NextResponse.json(serializePrisma({
      success: true,
      session,
      apiKeyConfigured: !!apiKey,
      apiKeyLength,
      apiKeyMasked,
      geminiTest
    }));
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
