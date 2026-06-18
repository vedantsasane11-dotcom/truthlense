interface Props {
  onClick: () => void
  loading?: boolean
}

export default function AnalyzeButton({ onClick, loading }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="bg-[#0ea5a5] hover:bg-[#0c8f8f] text-white font-medium px-5 py-2 rounded-full transition-colors disabled:opacity-50"
    >
      {loading ? 'Analyzing...' : 'Analyze'}
    </button>
  )
}