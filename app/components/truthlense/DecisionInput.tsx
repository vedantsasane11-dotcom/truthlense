'use client'

interface Props {
  value: string
  onChange: (val: string) => void
}

export default function DecisionInput({ value, onChange }: Props) {
  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter a claim or decision to analyze...\n\nExample: "Should I start an AI agency in 2026?"`}
        className="w-full h-40 p-4 text-base border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-400"
      />
    </div>
  )
}