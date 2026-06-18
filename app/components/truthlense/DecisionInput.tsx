'use client'

interface Props {
  value: string
  onChange: (val: string) => void
}

export default function DecisionInput({ value, onChange }: Props) {
  return (
    <div className="w-full flex flex-col">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='What decision are you about to make?'
        className="w-full h-24 p-4 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-base"
      />
      <p className="mt-3 text-xs text-gray-600 text-center">
  Business • Career • Investment • Education • Personal Goals
</p>
    </div>
  )
}