import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// ---------- Clarifying Questions ----------

const buildFallbackQuestions = (decisionQuery: string) => {
  const normalizedDecision = decisionQuery.toLowerCase();
  const questions: Array<{ question: string; critical: boolean }> = [];

  const addQuestion = (question: string, critical: boolean) => {
    const trimmedQuestion = question.trim();
    if (trimmedQuestion) {
      questions.push({ question: trimmedQuestion, critical });
    }
  };

  if (/(budget|money|cost|buy|invest|salary|loan|rent|save)/.test(normalizedDecision)) {
    addQuestion('What is your available budget or money for this decision?', true);
  }

  if (/(time|deadline|timeline|soon|when|start|launch|move|job|offer|commit)/.test(normalizedDecision)) {
    addQuestion('What timeline or deadline is involved?', true);
  }

  if (/(job|career|mba|degree|company|offer|role|startup|business|launch)/.test(normalizedDecision)) {
    addQuestion('What options or opportunities are already in front of you?', true);
  }

  if (/(buy|rent|property|house|car|phone|product)/.test(normalizedDecision)) {
    addQuestion('What alternatives are you comparing right now?', false);
  }

  addQuestion('What matters most to you if this decision goes well?', false);
  addQuestion('What would make this feel clearly worth the effort?', false);

  return questions.slice(0, 5);
};

const normalizeClarifyingQuestions = (rawResponse: unknown, decisionQuery: string) => {
  const fallbackQuestions = buildFallbackQuestions(decisionQuery);

  if (!rawResponse || typeof rawResponse !== 'object') {
    return { questions: fallbackQuestions };
  }

  const candidate = (rawResponse as { questions?: unknown }).questions;
  if (!Array.isArray(candidate)) {
    return { questions: fallbackQuestions };
  }

  const normalizedQuestions = candidate
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const entry = item as Record<string, unknown>;
      const question = typeof entry.question === 'string' ? entry.question.trim() : '';
      const critical = typeof entry.critical === 'boolean' ? entry.critical : false;

      return question ? { question, critical } : null;
    })
    .filter((item): item is { question: string; critical: boolean } => Boolean(item));

  return {
    questions: normalizedQuestions.length > 0 ? normalizedQuestions.slice(0, 5) : fallbackQuestions,
  };
};

const questionsSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    questions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING, description: 'The clarifying question text, short and specific.' },
          critical: { type: SchemaType.BOOLEAN, description: 'True if a reliable verdict CANNOT be given without this answer (e.g. budget for a financial decision, salary for a career decision). False if it would only refine the analysis.' }
        },
        required: ['question', 'critical']
      },
      description: "3-5 clarifying questions for this decision. Mark the 1-3 most essential ones (without which any verdict would be unreliable) as critical: true. Mark the rest critical: false. If the decision is already very specific and well-scoped, return fewer questions or an empty array."
    }
  },
  required: ["questions"]
};

export async function generateClarifyingQuestions(decisionQuery: string) {
  if (!genAI) {
    return normalizeClarifyingQuestions({ questions: [] }, decisionQuery);
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: questionsSchema,
      maxOutputTokens: 1024,
    }
  });

  const prompt = `A user wants to analyze this decision: "${decisionQuery}"

  Generate 3-5 short, specific clarifying questions.

  CRITICAL means: without this exact data point, no numeric or directional verdict can be trusted. Critical questions must be about hard facts — money, time, numbers, existing commitments, concrete alternatives already in hand. Examples of CRITICAL: "What are your savings and monthly expenses?", "Do you have a job offer in hand?", "What is your budget?".

  Examples of NOT critical (mark false): reflection questions, opinions, feelings, "why" questions, anything the user could answer in any number of ways without changing the math. Example of NOT critical: "What is your primary reason for wanting to quit?", "What aspects of your job are causing dissatisfaction?".

  Mark at most 2 questions as critical: true. The rest critical: false. If the decision is already very specific and well-scoped, return fewer questions or an empty array.

  Respond ONLY with JSON.`;

  let lastError: any = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsedResponse = JSON.parse(responseText);
      return normalizeClarifyingQuestions(parsedResponse, decisionQuery);
    } catch (error: any) {
      lastError = error;
      const is503 = error?.message?.includes('503') || error?.status === 503;
      const isParseError = error instanceof SyntaxError;
      console.error(`generateClarifyingQuestions attempt ${attempt} failed (503: ${is503}, parseError: ${isParseError}):`, error?.message || error);

      if ((is503 || isParseError) && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        continue;
      }

      return normalizeClarifyingQuestions({ questions: [] }, decisionQuery);
    }
  }

  return normalizeClarifyingQuestions({ questions: [] }, decisionQuery);
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
      description: "Confidence in the analysis: 'Low', 'Medium', or 'High'. STRICT RULE: if missingInformation has any items, confidenceLevel CANNOT be 'High' — it must be 'Medium' or 'Low'. confidenceLevel can only be 'High' when missingInformation is empty."
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
      description: "Specific pieces of information that, if missing, would genuinely BLOCK a confident verdict. Do NOT list minor nice-to-have details — only list something here if its absence is the reason confidenceLevel is not 'High'. If the answer is already confident and decisive, this MUST be an empty array. Do not pad this list just to seem thorough."
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
  if (!genAI) {
    throw new Error("Gemini API is not configured. Please set GEMINI_API_KEY.");
  }

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
CONSISTENCY RULE: confidenceLevel and missingInformation must agree. If you set confidenceLevel to "High", missingInformation MUST be an empty array — no exceptions. Only set confidenceLevel to "Medium" or "Low" if missingInformation actually contains real blocking gaps. Never list missing information just to appear thorough when you are already confident.

If context was provided above, you MUST explicitly use the actual numbers/facts given (e.g. cite the specific savings amount, salary figure, or timeline mentioned) inside verdict.summary, positiveFactors, negativeFactors, and scoreBreakdown. Do not restate the question — use the answer's content directly.

missingInformation must NEVER repeat or rephrase something already answered in context. Each item must be a genuinely new gap, phrased specifically (e.g. "Monthly expenses beyond savings" not "Financial information"). If context already covers most critical gaps, missingInformation should be short (1-2 items) or empty.

Do not default to "Proceed with Caution" out of safety. Apply this test before choosing a verdict: if the user has a financial cushion (savings covering 6+ months) AND no immediate red flag (e.g. dependents with no backup, zero savings, active legal/health issue), lean toward "Favorable" even if some risk remains — calculated risk with a safety net is still a good decision. Reserve "High Risk" for cases with a genuine blocking problem (e.g. less than 2 months runway, no plan, high dependents). Reserve "Proceed with Caution" only for cases that are truly balanced — roughly equal weight of solid reasons for and against, not merely "some risk exists." Most real decisions with decent context should resolve to Favorable or High Risk, not sit in the middle by default.

  The decisionMetrics MUST meaningfully reflect the actual nature of this decision. Do not give generic advice — tailor every field to this exact decision and to the specific context provided.

When the user provides specific numeric context (e.g. an exact savings amount and an exact monthly expense figure), you MUST calculate the precise result (e.g. "₹1.8L savings ÷ ₹30K monthly expenses = 6 months runway") and state that exact number in verdict.summary and scoreBreakdown. Do not convert precise numbers into vague ranges like "6-10 months" — only use a range if the user's own input was itself a range or was vague.`;

    let lastError: any = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
      } catch (error: any) {
        lastError = error;
        const is503 = error?.message?.includes('503') || error?.status === 503;
        console.error(`TruthLense Engine Error (attempt ${attempt}, 503: ${is503}):`, error?.message || error);

        if (is503 && attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
          continue;
        }
        break;
      }
    }

    if (lastError instanceof Error) throw lastError;
    throw new Error("Failed to audit decision. Please try again.");
  } catch (error) {
    console.error("TruthLense Engine Error:", error);
    throw error;
  }
}