import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";

// Ensure you have GEMINI_API_KEY in your .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// 1. Define the strict JSON schema TruthLense requires using SchemaType
const truthLenseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    verdict: {
      type: SchemaType.OBJECT,
      properties: {
        label: {
          type: SchemaType.STRING,
          description: 'The verdict label.'
        },
        summary: {
          type: SchemaType.STRING,
          description: 'A plain-language explanation of the verdict.'
        }
      },
      required: ['label', 'summary']
    },
    decisionScore: { 
      type: SchemaType.INTEGER, 
      description: "A pragmatic score from 0 to 100 based on viability and risk-to-reward ratio." 
    },
    confidence: { 
      type: SchemaType.INTEGER, 
      description: "Confidence level in the available data/analysis from 0 to 100." 
    },
    positiveFactors: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Three short reasons in favor of the decision.'
    },
    negativeFactors: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Three short reasons against the decision.'
    },
    assumptions: { 
      type: SchemaType.ARRAY, 
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: {
            type: SchemaType.STRING,
            description: 'The assumption text.'
          },
          confidence: {
            type: SchemaType.STRING,
            description: 'The confidence level for this assumption.'
          }
        },
        required: ['text', 'confidence']
      }, 
      description: "Core assumptions the user is making that need to be tested." 
    },
    opportunities: { 
      type: SchemaType.ARRAY, 
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: {
            type: SchemaType.STRING,
            description: 'The opportunity text.'
          },
          impact: {
            type: SchemaType.STRING,
            description: 'The impact level for this opportunity.'
          }
        },
        required: ['text', 'impact']
      }, 
      description: "Key market opportunities and potential upside." 
    },
    risks: { 
      type: SchemaType.ARRAY, 
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: {
            type: SchemaType.STRING,
            description: 'The risk text.'
          },
          severity: {
            type: SchemaType.STRING,
            description: 'The severity level for this risk.'
          }
        },
        required: ['text', 'severity']
      }, 
      description: "Major risks, blindspots, and downsides." 
    },
    successFactors: { 
      type: SchemaType.ARRAY, 
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: {
            type: SchemaType.STRING,
            description: 'The success factor text.'
          },
          required: {
            type: SchemaType.BOOLEAN,
            description: 'Whether this factor is required.'
          }
        },
        required: ['text', 'required']
      }, 
      description: "Critical factors absolutely required for this execution to succeed." 
    },
    recommendation: { 
      type: SchemaType.STRING, 
      description: "A final, concise, and pragmatic recommendation. No fluff." 
    }
  },
  required: [
    "verdict",
    "decisionScore", 
    "confidence", 
    "positiveFactors",
    "negativeFactors",
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

    const decision = decisionQuery;
    const prompt = `You are a decision analysis engine. Analyze the following decision and respond ONLY with valid JSON, no markdown, no preamble.

Decision: "${decision}"

Return JSON in exactly this structure:
{
  "verdict": {
    "label": "Favorable" | "Proceed with Caution" | "High Risk",
    "summary": string (2 sentences max, explain the verdict in plain language)
  },
  "decisionScore": number (0-100),
  "confidence": number (0-100),
  "positiveFactors": string[] (3 short bullet points, the strongest reasons in favor),
  "negativeFactors": string[] (3 short bullet points, the strongest reasons against),
  "assumptions": [{ "text": string, "confidence": "high" | "medium" | "low" }],
  "opportunities": [{ "text": string, "impact": "high" | "medium" | "low" }],
  "risks": [{ "text": string, "severity": "high" | "medium" | "low" }],
  "successFactors": [{ "text": string, "required": boolean }],
  "recommendation": string (one specific, actionable next step — not generic advice)
}

Make the analysis specific to "${decision}". Do not give generic startup advice — tailor every field to this exact decision.`;

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