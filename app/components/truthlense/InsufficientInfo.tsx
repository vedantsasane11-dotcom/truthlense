interface Props {
  readiness: number
  missingCritical: string[]
  onBack: () => void
  onForce: () => void
  loading?: boolean
}

export default function InsufficientInfo({ readiness, missingCritical, onBack, onForce, loading }: Props) {
  return (
    <div className="w-full space-y-4">
      <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6">
        <p className="text-sm text-gray-400 mb-1">Status</p>
        <p className="text-2xl font-bold text-yellow-400 mb-2">Insufficient Information</p>
        <p className="text-gray-300 text-sm">
          A reliable recommendation cannot be made yet. Answer the required questions below to continue.
        </p>
      </div>

      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Decision Readiness</span>
            <span className="text-gray-300 font-medium">{readiness}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${readiness}%` }} />
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">Missing</p>
          <ul className="space-y-1">
            {missingCritical.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-red-400">✗</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 bg-[#0ea5a5] hover:bg-[#0c8f8f] text-white font-medium px-5 py-2 rounded-full transition-colors disabled:opacity-50"
        >
          Answer These Questions
        </button>
        <button
          onClick={onForce}
          disabled={loading}
          className="text-sm text-gray-500 hover:text-gray-300 px-4 py-2 transition-colors disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Anyway (Low Confidence)'}
        </button>
      </div>
    </div>
  )
}