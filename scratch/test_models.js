const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY in .env");
    return;
  }

  console.log("Testing API Key:", apiKey.substring(0, 8) + "...");
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Note: The library doesn't always have a direct listModels on the main class
    // We can try to hit the API directly or use the model-manager if available
    
    console.log("Attempting to list models using a manual fetch to be sure...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("API Error:", data.error);
    } else {
      console.log("Available Models:");
      data.models.forEach(m => {
        console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(", ")})`);
      });
    }
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

listModels();
