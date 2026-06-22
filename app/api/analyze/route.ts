import { NextResponse } from "next/server";
import { analyzeDecision } from "@/src/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { decisionQuery, context } = body;

    if (!decisionQuery || typeof decisionQuery !== "string") {
      return NextResponse.json(
        { error: "A valid decision string is required." },
        { status: 400 }
      );
    }

    const analysisResult = await analyzeDecision(decisionQuery, context);
    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process decision audit." },
      { status: 500 }
    );
  }
}