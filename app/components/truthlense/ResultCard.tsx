interface Result {
  score: number
  pros: string[]
  cons: string[]
  risks: string[]
  recommendation: string
}

interface Props {
  result: Result
}

export default function ResultCard({ result }: Props) {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      
      {/* Score */}
      <div className="flex items-center justify-between border-b pb-4">
        <span className="text-gray-500 font-medium">Decision Score</span>
        <span className="text-3xl font-bold text-blue-600">{result.score}/100</span>
      </div>

      {/* Pros */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Pros</h3>
        <ul className="space-y-1">
          {result.pros.map((pro, i) => (
            <li key={i} className="flex items-start gap-2 text-green-700 text-sm">
              <span>✓</span><span>{pro}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cons */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Cons</h3>
        <ul className="space-y-1">
          {result.cons.map((con, i) => (
            <li key={i} className="flex items-start gap-2 text-red-600 text-sm">
              <span>✗</span><span>{con}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Risks */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Risks</h3>
        <ul className="space-y-1">
          {result.risks.map((risk, i) => (
            <li key={i} className="flex items-start gap-2 text-yellow-600 text-sm">
              <span>⚠</span><span>{risk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendation */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-1">Recommendation</h3>
        <p className="text-gray-600 text-sm">{result.recommendation}</p>
      </div>

    </div>
  )
}