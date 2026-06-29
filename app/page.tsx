'use client'

import { useState, useEffect } from 'react'
import DecisionInput from './components/truthlense/DecisionInput'
import AnalyzeButton from './components/truthlense/AnalyzeButton'
import ResultCard from './components/truthlense/ResultCard'
import QuestionsForm from './components/truthlense/QuestionsForm'
import InsufficientInfo from './components/truthlense/InsufficientInfo'
import { saveDecision } from './services/truthlense/decisionService'
import { AnalysisResult, ClarifyingQuestion } from './types/truthlense/decision'

const EXAMPLES = [
  'Should I start a SaaS company?',
  'Should I pursue an MBA?',
  'Should I buy a rental property?',
  'Should I document my learning journey online?',
]

interface HistoryItem {
  decision: string
  verdict: string
  score: number
  date: string
}

type Step = 'input' | 'questions' | 'insufficient' | 'result'

const READINESS_THRESHOLD = 50

export default function Home() {
  const [input, setInput] = useState('')
  const [step, setStep] = useState<Step>('input')
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('truthlense_history')
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch {
        setHistory([])
      }
    }
  }, [])

  const calcReadiness = (qs: ClarifyingQuestion[], a: Record<string, string>) => {
    const critical = qs.filter((q) => q.critical)
    if (critical.length === 0) return 100
    const answered = critical.filter((q) => a[q.question] && a[q.question].trim().length > 0)
    return Math.round((answered.length / critical.length) * 100)
  }

  const getMissingCritical = (qs: ClarifyingQuestion[], a: Record<string, string>) =>
    qs.filter((q) => q.critical && (!a[q.question] || !a[q.question].trim())).map((q) => q.question)

  const runAnalysis = async (context: Record<string, string>) => {
    if (!input.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisionQuery: input, context }),
      })

      if (!res.ok) {
        throw new Error(`Analysis API failed with status ${res.status}`)
      }

      const data = await res.json()
      if (data?.error) {
        throw new Error(data.error)
      }

      const safeResult = data as AnalysisResult
      setResult(safeResult)
      setStep('result')

      const newEntry: HistoryItem = {
        decision: input,
        verdict: safeResult.verdict.label,
        score: safeResult.decisionScore,
        date: new Date().toLocaleDateString(),
      }
      const updatedHistory = [newEntry, ...(history || [])].slice(0, 8)
      setHistory(updatedHistory)
      localStorage.setItem('truthlense_history', JSON.stringify(updatedHistory))
   } catch (err) {
  console.error('Error analyzing decision:', err)
  alert('TruthLense is experiencing high demand right now. Please wait a few seconds and try again.')
  }finally {
      setLoading(false)
    }
  }

  const handleStart = async () => {
    if (!input.trim()) return
    setLoading(true)

    try {
      await saveDecision(input)

      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisionQuery: input }),
      })

      if (!res.ok) {
        throw new Error(`Questions API failed with status ${res.status}`)
      }

      const data = await res.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.questions || data.questions.length === 0) {
        await runAnalysis({})
      } else {
        setQuestions(data.questions)
        setAnswers({})
        setStep('questions')
        setLoading(false)
      }
    } catch (err) {
      console.error('Failed to fetch clarifying questions:', err)
      setLoading(false)
      alert('Could not generate clarifying questions right now. Please try again.')
    }
  }
  
  const handleContinueFromQuestions = (newAnswers: Record<string, string>) => {
    setAnswers(newAnswers)
    const readiness = calcReadiness(questions, newAnswers)

    if (readiness < READINESS_THRESHOLD) {
      setStep('insufficient')
    } else {
      void runAnalysis(newAnswers)
    }
  }

  const handleForceAnalyze = () => {
    void runAnalysis(answers)
  }

  const handleReset = () => {
    setInput('')
    setResult(null)
    setQuestions([])
    setAnswers({})
    setStep('input')
  }

  const verdictColor = (label: string) => {
    if (label === 'Favorable') return 'text-green-400'
    if (label === 'Proceed with Caution') return 'text-yellow-400'
    return 'text-red-400'
  }

  const readiness = calcReadiness(questions, answers)
  const missingCritical = getMissingCritical(questions, answers)

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center px-4 py-24">
      <div className="w-full max-w-2xl space-y-8">

        <div className="text-center space-y-3">
          <h1 className="text-6xl font-semibold text-white tracking-tight">TruthLense</h1>
          <p className="text-gray-400 text-lg">Know before you commit.</p>
        </div>

        {step === 'input' && (
          <>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-2 focus-within:border-[#0ea5a5] transition-colors">
              <DecisionInput value={input} onChange={setInput} />
              <div className="flex justify-end px-2 pb-1">
                <AnalyzeButton onClick={handleStart} loading={loading} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500">Try examples</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(ex)}
                    className="text-sm text-gray-300 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#0ea5a5] rounded-full px-4 py-2 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 'questions' && (
          <QuestionsForm
            questions={questions}
            initialAnswers={answers}
            onContinue={handleContinueFromQuestions}
            loading={loading}
          />
        )}

        {step === 'insufficient' && (
          <InsufficientInfo
            readiness={readiness}
            missingCritical={missingCritical}
            onBack={() => setStep('questions')}
            onForce={handleForceAnalyze}
            loading={loading}
          />
        )}

        {step === 'result' && result && (
          <>
            <ResultCard result={result} />
            <button
              onClick={handleReset}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-200 py-2 transition-colors"
            >
              ← Analyze a new decision
            </button>
          </>
        )}

        {history.length > 0 && step === 'input' && (
          <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <h2 className="font-semibold text-gray-300 mb-3">Recent Analyses</h2>
            <ul className="space-y-3">
              {history.map((h, i) => (
                <li key={i} className="flex items-center justify-between text-sm border-b border-[#2a2a2a] last:border-0 pb-2 last:pb-0">
                  <div>
                    <p className="text-gray-300">{h.decision}</p>
                    <p className="text-gray-500 text-xs">{h.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${verdictColor(h.verdict)}`}>{h.verdict}</p>
                    <p className="text-gray-500 text-xs">{h.score}/100</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </main>
  )
}