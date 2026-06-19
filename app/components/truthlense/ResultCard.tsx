import { AnalysisResult } from '../../types/truthlense/decision'

interface Props {
  result: AnalysisResult
}

const severityColor = (level: string) => {
  if (level === 'high') return 'text-red-400'
  if (level === 'medium') return 'text-yellow-400'
  return 'text-green-400'
}

const verdictStyles = {
  Favorable: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  'Proceed with Caution': { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  'High Risk': { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
}

export default function ResultCard({ result }: Props) {
  const verdict = result?.verdict ?? {
    label: 'Proceed with Caution' as const,
    summary: 'The analysis result was incomplete, so a safe default verdict is shown.'
  }
  const positiveFactors = result?.positiveFactors ?? []
  const negativeFactors = result?.negativeFactors ?? []
  const assumptions = result?.assumptions ?? []
  const opportunities = result?.opportunities ?? []
  const risks = result?.risks ?? []
  const successFactors = result?.successFactors ?? []
  const decisionScore = typeof result?.decisionScore === 'number' ? result.decisionScore : 0
  const confidence = typeof result?.confidence === 'number' ? result.confidence : 0
  const style = verdictStyles[verdict.label]

  return (
    <div className="w-full space-y-4">

      {/* Verdict Card */}
      <div className={`rounded-2xl border p-6 ${style.bg} ${style.border}`}>
        <p className="text-sm text-gray-400 mb-1">Verdict</p>
        <p className={`text-2xl font-bold mb-2 ${style.text}`}>{verdict.label}</p>
        <p className="text-gray-300 text-sm">{verdict.summary}</p>
      </div>

      {/* Main Card */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 space-y-6 text-gray-300">

        {/* Score + Evidence Strength */}
        <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
          <div>
            <p className="text-sm text-gray-500">Decision Score</p>
            <p className="text-3xl font-bold text-[#0ea5a5]">{decisionScore}/100</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Evidence Strength</p>
            <p className="text-3xl font-bold text-gray-200">{confidence}%</p>
          </div>
        </div>

        {/* Why This Verdict */}
        <div>
          <h3 className="font-semibold text-gray-200 mb-3">Why This Verdict?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Positive Factors</p>
              <ul className="space-y-1">
                {positiveFactors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-400">
                    <span>✓</span><span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Negative Factors</p>
              <ul className="space-y-1">
                {negativeFactors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-400">
                    <span>✗</span><span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Assumptions */}
        <div>
          <h3 className="font-semibold text-gray-200 mb-2">Assumptions</h3>
          <ul className="space-y-1">
            {assumptions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className={severityColor(a.confidence)}>◆</span>
                <span>{a.text} <span className="text-gray-500">({a.confidence} confidence)</span></span>
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div>
          <h3 className="font-semibold text-gray-200 mb-2">Opportunities</h3>
          <ul className="space-y-1">
            {opportunities.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-400">
                <span>✓</span><span>{o.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risks */}
        <div>
          <h3 className="font-semibold text-gray-200 mb-2">Risks</h3>
          <ul className="space-y-1">
            {risks.map((r, i) => (
              <li key={i} className={`flex items-start gap-2 text-sm ${severityColor(r.severity)}`}>
                <span>⚠</span><span>{r.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Success Factors */}
        <div>
          <h3 className="font-semibold text-gray-200 mb-2">Success Factors</h3>
          <ul className="space-y-1">
            {successFactors.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span>{s.required ? '★' : '☆'}</span>
                <span>{s.text} {s.required && <span className="text-red-400 text-xs">(required)</span>}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Next Step */}
        <div className="bg-[#0ea5a5]/10 border border-[#0ea5a5]/30 rounded-lg p-4">
          <h3 className="font-semibold text-gray-200 mb-1">Recommended Next Step</h3>
          <p className="text-gray-300 text-sm">{result.recommendation}</p>
        </div>

      </div>
    </div>
  )
}