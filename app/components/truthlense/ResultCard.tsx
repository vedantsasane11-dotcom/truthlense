import { AnalysisResult } from '../../types/truthlense/decision'

interface Props {
  result: AnalysisResult
}

const severityColor = (level: string) => {
  if (level === 'high') return 'text-red-600'
  if (level === 'medium') return 'text-yellow-600'
  return 'text-green-600'
}

export default function ResultCard({ result }: Props) {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 space-y-6">

      {/* Score */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <p className="text-sm text-gray-400">Decision Score</p>
          <p className="text-3xl font-bold text-blue-600">{result.decisionScore}/100</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">AI Confidence</p>
          <p className="text-3xl font-bold text-gray-700">{result.confidence}%</p>
        </div>
      </div>

      {/* Assumptions */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Assumptions</h3>
        <ul className="space-y-1">
          {result.assumptions.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className={severityColor(a.confidence)}>◆</span>
              <span>{a.text} <span className="text-gray-400">({a.confidence} confidence)</span></span>
            </li>
          ))}
        </ul>
      </div>

      {/* Opportunities */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Opportunities</h3>
        <ul className="space-y-1">
          {result.opportunities.map((o, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-green-700">
              <span>✓</span><span>{o.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Risks */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Risks</h3>
        <ul className="space-y-1">
          {result.risks.map((r, i) => (
            <li key={i} className={`flex items-start gap-2 text-sm ${severityColor(r.severity)}`}>
              <span>⚠</span><span>{r.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Success Factors */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Success Factors</h3>
        <ul className="space-y-1">
          {result.successFactors.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span>{s.required ? '★' : '☆'}</span>
              <span>{s.text} {s.required && <span className="text-red-400 text-xs">(required)</span>}</span>
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