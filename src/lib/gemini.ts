import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";

// Ensure you have GEMINI_API_KEY in your .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// 1. Define the strict JSON schema TruthLense requires using SchemaType
const truthLenseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    decisionScore: { 
      type: SchemaType.INTEGER, 
      description: "A pragmatic score from 0 to 100 based on viability and risk-to-reward ratio." 
    },
    researchConfidence: { 
      type: SchemaType.INTEGER, 
      description: "Confidence level in the available data/analysis from 0 to 100." 
    },
    assumptions: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING }, 
      description: "Core assumptions the user is making that need to be tested." 
    },
    opportunities: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING }, 
      description: "Key market opportunities and potential upside." 
    },
    risks: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING }, 
      description: "Major risks, blindspots, and downsides." 
    },
    successFactors: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING }, 
      description: "Critical factors absolutely required for this execution to succeed." 
    },
    recommendation: { 
      type: SchemaType.STRING, 
      description: "A final, concise, and pragmatic recommendation. No fluff." 
    }
  },
  required: [
    "decisionScore", 
    "researchConfidence", 
    "assumptions", 
    "opportunities", 
    "risks", 
    "successFactors", 
    "recommendation"
  ]
};

// 2. Export the analysis function
export async function analyzeDecision(decisionQuery: string) {
  try {
    // Find this block inside export async function analyzeDecision(decisionQuery: string)
const model = genAI.getGenerativeModel({
  // CHANGE THIS: Route to the open, high-quota lite lane
  model: "gemini-2.5-flash-lite", 
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: truthLenseSchema,
  }
});

    const prompt = `
      You are the core analytical engine for TruthLense, a strict Decision Audit System.
      Analyze the following decision: "${decisionQuery}".
      
      RULES:
      - Be objective, pragmatic, and highly analytical.
      - Strip away all AI jargon (do not use words like "delve", "testament", or "AI").
      - Focus heavily on blindspots and risk mitigation.
      - Provide realistic scores. Not every idea is a 90/100.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    
    return JSON.parse(response.text());
    
  } catch (error) {
    console.error("TruthLense Engine Error:", error);
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to audit decision. Please try again.");
  }
}