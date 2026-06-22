import { NextResponse } from "next/server";
import { generateClarifyingQuestions } from "@/src/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { decisionQuery } = body;

    if (!decisionQuery || typeof decisionQuery !== "string") {
      return NextResponse.json({ error: "A valid decision string is required." }, { status: 400 });
    }

    const result = await generateClarifyingQuestions(decisionQuery);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Questions error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate questions" }, { status: 500 });
  }
}