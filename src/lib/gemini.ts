import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// ---------- Clarifying Questions ----------

const questionsSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    questions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "3-5 short, specific clarifying questions whose answers would meaningfully change the analysis of this exact decision (e.g. budget, timeline, experience, location, current situation). If the decision is already very specific and well-scoped, return fewer questions or an empty array."
    }
  },
  required: ["questions"]
};

export async function generateClarifyingQuestions(decisionQuery: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: questionsSchema,
    }
  });

  const prompt = `A user wants to analyze this decision: "${decisionQuery}"

Generate 3-5 short, specific clarifying questions whose answers would meaningfully change a decision analysis. Only ask questions relevant to THIS decision. If the decision is already very specific and well-scoped, return fewer questions or an empty array.

Respond ONLY with JSON.`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

// ---------- Main Analysis ----------

const truthLenseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    verdict: {
      type: SchemaType.OBJECT,
      properties: {
        label: { type: SchemaType.STRING, description: 'The verdict label.' },
        summary: { type: SchemaType.STRING, description: 'A plain-language explanation of the verdict.' }
      },
      required: ['label', 'summary']
    },
    decisionScore: {
      type: SchemaType.INTEGER,
      description: "A pragmatic score from 0 to 100 based on viability and risk-to-reward ratio."
    },
    confidenceLevel: {
      type: SchemaType.STRING,
      description: "Confidence in the analysis based on available evidence and context: 'Low', 'Medium', or 'High'. Should be lower if missingInformation is non-empty."
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
    biggestOpportunity: {
      type: SchemaType.STRING,
      description: "The single biggest opportunity in 10 words or less. Punchy, not a full sentence."
    },
    biggestRisk: {
      type: SchemaType.STRING,
      description: "The single biggest risk in 10 words or less. Punchy, not a full sentence."
    },
    immediateNextStep: {
      type: SchemaType.STRING,
      description: "One small, concrete action in 10 words or less. Punchy, not a full sentence."
    },
    whatWouldChangeVerdict: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "3-4 specific conditions that would upgrade this verdict."
    },
    decisionMetrics: {
      type: SchemaType.OBJECT,
      properties: {
        timeRequired: { type: SchemaType.INTEGER, description: "1 (very low) to 5 (very high). Must vary meaningfully based on the decision." },
        moneyRequired: { type: SchemaType.INTEGER, description: "1 (very low) to 5 (very high). Must vary meaningfully based on the decision." },
        riskLevel: { type: SchemaType.INTEGER, description: "1 (very low) to 5 (very high)." },
        difficulty: { type: SchemaType.INTEGER, description: "1 (very low) to 5 (very high)." },
        potentialROI: { type: SchemaType.INTEGER, description: "1 (very low) to 5 (very high)." }
      },
      required: ['timeRequired', 'moneyRequired', 'riskLevel', 'difficulty', 'potentialROI']
    },
    scoreBreakdown: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          factor: { type: SchemaType.STRING, description: 'The factor name, e.g. "Market Demand".' },
          points: { type: SchemaType.INTEGER, description: 'Points this factor contributes, relative to a baseline of 50. Can be positive or negative.' },
          weight: { type: SchemaType.INTEGER, description: 'How important this factor is to the overall decision, 1 (minor) to 5 (critical).' },
          confidence: { type: SchemaType.STRING, description: 'Confidence in this specific factor: high, medium, or low.' }
        },
        required: ['factor', 'points', 'weight', 'confidence']
      },
      description: "4-6 factors explaining how decisionScore was derived, specific to this decision."
    },
    alternativePaths: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "3-4 alternatives. If verdict is 'High Risk', suggest entirely safer paths toward a similar goal. If 'Proceed with Caution', suggest smaller-scale/safer versions. If 'Favorable', suggest ways to derisk further."
    },
    missingInformation: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Specific pieces of information NOT already provided (in the decision text or context) that, if known, would meaningfully improve confidence in this analysis. Empty array if the decision and context together are already well-specified."
    },
    evidenceConsidered: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING, description: 'A specific dimension of evidence relevant to this decision.' },
          strength: { type: SchemaType.STRING, description: 'high, medium, or low.' },
          type: { type: SchemaType.STRING, description: "'Verified' (well-established general fact), 'Inference' (reasonably derived from patterns), or 'Assumption' (unconfirmed guess). Be honest — most items should be Inference or Assumption since no live data was fetched." }
        },
        required: ['text', 'strength', 'type']
      },
      description: '5-6 specific dimensions of evidence relevant to this exact decision.'
    },
    analysisScope: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: '4-5 short labels representing the dimensions analyzed.'
    },
    assumptions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING, description: 'The assumption text.' },
          confidence: { type: SchemaType.STRING, description: 'The confidence level for this assumption.' }
        },
        required: ['text', 'confidence']
      },
      description: "Core assumptions that need to be tested."
    },
    opportunities: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING, description: 'The opportunity text.' },
          impact: { type: SchemaType.STRING, description: 'The impact level.' }
        },
        required: ['text', 'impact']
      },
      description: "Key market opportunities and upside."
    },
    risks: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING, description: 'The risk text.' },
          severity: { type: SchemaType.STRING, description: 'The severity level.' }
        },
        required: ['text', 'severity']
      },
      description: "Major risks and downsides."
    },
    successFactors: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING, description: 'The success factor text.' },
          required: { type: SchemaType.BOOLEAN, description: 'Whether this factor is required.' }
        },
        required: ['text', 'required']
      },
      description: "Critical factors required to succeed."
    },
    recommendation: {
      type: SchemaType.STRING,
      description: "A final, concise, pragmatic recommendation. No fluff."
    }
  },
  required: [
    "verdict", "decisionScore", "confidenceLevel", "positiveFactors", "negativeFactors",
    "biggestOpportunity", "biggestRisk", "immediateNextStep", "whatWouldChangeVerdict",
    "decisionMetrics", "scoreBreakdown", "alternativePaths", "missingInformation",
    "evidenceConsidered", "analysisScope", "assumptions", "opportunities",
    "risks", "successFactors", "recommendation"
  ]
};

export async function analyzeDecision(decisionQuery: string, context?: Record<string, string>) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: truthLenseSchema,
      }
    });

    const decision = decisionQuery;

    const contextEntries = context ? Object.entries(context).filter(([, v]) => v && v.trim()) : [];
    const contextBlock = contextEntries.length > 0
      ? `\n\nAdditional context provided by the user:\n${contextEntries.map(([q, a]) => `- ${q}: ${a}`).join('\n')}`
      : '';

    const prompt = `You are a decision analysis engine. Analyze the following decision and respond ONLY with valid JSON, no markdown, no preamble.

Decision: "${decision}"${contextBlock}

Return JSON in exactly this structure:
{
  "verdict": { "label": "Favorable" | "Proceed with Caution" | "High Risk", "summary": string (2 sentences max) },
  "decisionScore": number (0-100),
  "confidenceLevel": "Low" | "Medium" | "High",
  "positiveFactors": string[] (3 short bullets),
  "negativeFactors": string[] (3 short bullets),
  "biggestOpportunity": string (10 words max, punchy),
  "biggestRisk": string (10 words max, punchy),
  "immediateNextStep": string (10 words max, punchy),
  "whatWouldChangeVerdict": string[] (3-4 conditions),
  "decisionMetrics": { "timeRequired": 1-5, "moneyRequired": 1-5, "riskLevel": 1-5, "difficulty": 1-5, "potentialROI": 1-5 },
  "scoreBreakdown": [{ "factor": string, "points": number, "weight": 1-5, "confidence": "high"|"medium"|"low" }] (4-6 factors, points relative to baseline 50),
  "alternativePaths": string[] (3-4 alternatives based on verdict type),
  "missingInformation": string[] (specific info not yet known that would improve confidence, empty array if context already covers it),
  "evidenceConsidered": [{ "text": string, "strength": "high"|"medium"|"low", "type": "Verified"|"Inference"|"Assumption" }] (5-6 items, be honest about type),
  "analysisScope": string[] (4-5 labels),
  "assumptions": [{ "text": string, "confidence": "high"|"medium"|"low" }],
  "opportunities": [{ "text": string, "impact": "high"|"medium"|"low" }],
  "risks": [{ "text": string, "severity": "high"|"medium"|"low" }],
  "successFactors": [{ "text": string, "required": boolean }],
  "recommendation": string
}

Use any additional context provided above to make the analysis sharper and to reduce missingInformation. The decisionMetrics MUST meaningfully reflect the actual nature of this decision. Do not give generic advice — tailor every field to this exact decision.`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());

  } catch (error) {
    console.error("TruthLense Engine Error:", error);
    if (error instanceof Error) throw error;
    throw new Error("Failed to audit decision. Please try again.");
  }
}