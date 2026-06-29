'use client'

import { useState, useEffect } from 'react'
import { ClarifyingQuestion } from '../../types/truthlense/decision'

interface Props {
  questions: ClarifyingQuestion[]
  initialAnswers?: Record<string, string>
  onContinue: (answers: Record<string, string>) => void
  loading?: boolean
}

export default function QuestionsForm({ questions, initialAnswers, onContinue, loading }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers || {})

  useEffect(() => {
    if (initialAnswers) setAnswers(initialAnswers)
  }, [initialAnswers])

  const handleChange = (q: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [q]: value }))
  }

  const criticalQuestions = questions.filter((q) => q.critical)
  const answeredCritical = criticalQuestions.filter(
    (q) => answers[q.question] && answers[q.question].trim().length > 0
  )
  const readiness = criticalQuestions.length === 0
    ? 100
    : Math.round((answeredCritical.length / criticalQuestions.length) * 100)

  const readinessColor = readiness >= 80 ? 'bg-green-500' : readiness >= 50 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 space-y-5">
      <div>
        <h3 className="font-semibold text-gray-200 mb-1">Before I can evaluate this</h3>
        <p className="text-sm text-gray-500">Questions marked Required directly affect whether a reliable verdict can be given.</p>
      </div>

      {criticalQuestions.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Decision Readiness</span>
            <span className="text-gray-300 font-medium">{readiness}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${readinessColor} transition-all`}
              style={{ width: `${readiness}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={i}>
            <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
              {q.question}
              {q.critical && (
                <span className="text-xs text-red-400 border border-red-400/30 rounded-full px-2 py-0.5">Required</span>
              )}
            </label>
            <input
              type="text"
              value={answers[q.question] || ''}
              onChange={(e) => handleChange(q.question, e.target.value)}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0ea5a5]"
              placeholder="Your answer..."
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => onContinue(answers)}
        disabled={loading}
        className="w-full bg-[#0ea5a5] hover:bg-[#0c8f8f] text-white font-medium px-5 py-2 rounded-full transition-colors disabled:opacity-50"
      >
        {loading ? 'Checking...' : 'Continue'}
      </button>
    </div>
  )
}