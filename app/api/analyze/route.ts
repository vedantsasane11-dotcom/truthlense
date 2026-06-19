import { NextResponse } from 'next/server'
import { analyzeDecision } from '@/src/lib/gemini'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { decisionQuery } = body

    if (!decisionQuery || typeof decisionQuery !== 'string') {
      return NextResponse.json(
        { error: 'A valid decision string is required.' },
        { status: 400 }
      )
    }

    const analysisResult = await analyzeDecision(decisionQuery)

    return NextResponse.json(analysisResult)
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze decision' },
      { status: 500 }
    )
  }
  
}
