'use client'

import { useState } from 'react'

interface Props {
  questions: string[]
  onSubmit: (answers: Record<string, string>) => void
  onSkip: () => void
  loading?: boolean
}

export default function QuestionsForm({ questions, onSubmit, onSkip, loading }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const handleChange = (q: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [q]: value }))
  }

  return (
    <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-200 mb-1">A few quick questions</h3>
        <p className="text-sm text-gray-500">Answering these sharpens the analysis. Optional — you can skip.</p>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={i}>
            <label className="text-sm text-gray-400 block mb-1">{q}</label>
            <input
              type="text"
              value={answers[q] || ''}
              onChange={(e) => handleChange(q, e.target.value)}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0ea5a5]"
              placeholder="Your answer..."
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onSkip}
          disabled={loading}
          className="text-sm text-gray-400 hover:text-gray-200 px-4 py-2 transition-colors disabled:opacity-50"
        >
          Skip
        </button>
        <button
          onClick={() => onSubmit(answers)}
          disabled={loading}
          className="flex-1 bg-[#0ea5a5] hover:bg-[#0c8f8f] text-white font-medium px-5 py-2 rounded-full transition-colors disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}