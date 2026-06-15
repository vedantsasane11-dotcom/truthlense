'use client'

import { useState } from 'react'
import DecisionInput from './components/truthlense/DecisionInput'
import AnalyzeButton from './components/truthlense/AnalyzeButton'
import ResultCard from './components/truthlense/ResultCard'

const MOCK_RESULT = {
  score: 78,
  pros: ['Growing market demand', 'Low startup costs', 'High profit margins'],
  cons: ['High competition', 'Requires strong network', 'Long sales cycles'],
  risks: ['Requires sales skills', 'Market may be oversaturated by 2027', 'Client dependency risk'],
  recommendation: 'Start with 3 pilot clients first. Validate your niche before scaling.',
}

export default function Home() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<typeof MOCK_RESULT | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = () => {
    if (!input.trim()) return
    setLoading(true)
    setTimeout(() => {
      setResult(MOCK_RESULT)
      setLoading(false)
    }, 1500)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">TruthLense</h1>
          <p className="text-gray-500">Validate ideas before execution</p>
        </div>

        {/* Input */}
        <DecisionInput value={input} onChange={setInput} />

        {/* Button */}
        <AnalyzeButton onClick={handleAnalyze} loading={loading} />

        {/* Result */}
        {result && <ResultCard result={result} />}

      </div>
    </main>
  )
}