'use client'

import { useState, useEffect } from 'react'

interface Props {
  value: string
  onChange: (val: string) => void
}

const EXAMPLES = [
  'Should I launch an AI agency in 2026?',
  'Should I move to Bangalore for work?',
  'Should I start a clothing brand?',
  'Should I buy a rental property?',
  "Should I pursue a master's degree?",
]

export default function DecisionInput({ value, onChange }: Props) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % EXAMPLES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={EXAMPLES[placeholderIndex]}
      className="w-full h-24 p-4 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-base"
    />
  )
}