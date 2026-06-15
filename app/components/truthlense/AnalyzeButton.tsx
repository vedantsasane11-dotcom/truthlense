interface Props {
  onClick: () => void
  loading?: boolean
}

export default function AnalyzeButton({ onClick, loading }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50"
    >
      {loading ? 'Analyzing...' : 'Analyze'}
    </button>
  )
}