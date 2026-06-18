import { NextResponse } from "next/server";
import { analyzeDecision } from "@/src/lib/gemini";

export async function POST(request: Request) {
  try {
    // DIAGNOSTIC LOGS — Check your VS Code terminal output for these
    console.log("--- SYSTEM HEALTH CHECK ---");
    console.log("Is Key Loaded?:", !!process.env.GEMINI_API_KEY);
    console.log("Key Prefix Structure:", process.env.GEMINI_API_KEY?.substring(0, 5));
    console.log("---------------------------");

    // 1. Log incoming requests to verify the endpoint is hit
    console.log("TruthLense API: Audit Request Received");
    
    const body = await request.json().catch(() => ({}));
    const { decisionQuery } = body;

    if (!decisionQuery || typeof decisionQuery !== "string") {
      return NextResponse.json(
        { error: "A valid decision string is required." },
        { status: 400 }
      );
    }

    console.log(`TruthLense API: Executing Gemini audit for: "${decisionQuery.substring(0, 30)}..."`);

    // 2. Execute the engine
    const analysisResult = await analyzeDecision(decisionQuery);
    
    // 3. Send structured response back
    return NextResponse.json(analysisResult);

  } catch (error: any) {
    // This will print the exact stack trace in your server terminal!
    console.error("CRITICAL TRUTHLENSE BACKEND ERROR:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to process decision audit." },
      { status: 500 }
    );
  }
}