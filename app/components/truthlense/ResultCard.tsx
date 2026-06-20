'use client'

import { useState } from 'react'
import { AnalysisResult } from '../../types/truthlense/decision'

interface Props {
  result: AnalysisResult
}

const severityColor = (level: string) => {
  if (level === 'high') return 'text-red-400'
  if (level === 'medium') return 'text-yellow-400'
  return 'text-green-400'
}

const evidenceColor = (level: string) => {
  if (level === 'high') return 'text-green-400'
  if (level === 'medium') return 'text-yellow-400'
  return 'text-gray-500'
}

const evidenceLabel = (level: string) => {
  if (level === 'high') return 'High Evidence'
  if (level === 'medium') return 'Medium Evidence'
  return 'Low Evidence'
}

const verdictStyles = {
  Favorable: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  'Proceed with Caution': { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  'High Risk': { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
}

export default function ResultCard({ result }: Props) {
  const [showFull, setShowFull] = useState(false)
  const style = verdictStyles[result.verdict.label]

  return (
    <div className="w-full space-y-4">

      {/* Verdict Card */}
      <div className={`rounded-2xl border p-6 ${style.bg} ${style.border}`}>
        <p className="text-sm text-gray-400 mb-1">Verdict</p>
        <p className={`text-2xl font-bold mb-2 ${style.text}`}>{result.verdict.label}</p>
        <p className="text-gray-300 text-sm">{result.verdict.summary}</p>
      </div>

      {/* Decision Snapshot */}
<div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 space-y-4">
  <h3 className="font-semibold text-gray-200 mb-1">Decision Snapshot</h3>

  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-500">Recommendation</span>
    <span className={`font-semibold ${style.text}`}>{result.verdict.label}</span>
  </div>

  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-500">Success Probability</span>
    <span className="font-semibold text-[#0ea5a5]">{result.decisionScore}%</span>
  </div>

  <div className="pt-2 border-t border-[#2a2a2a] space-y-3">
    <div>
      <p className="text-gray-500 text-sm mb-1">Biggest Opportunity</p>
      <p className="text-gray-200 text-sm">{result.biggestOpportunity}</p>
    </div>
    <div>
      <p className="text-gray-500 text-sm mb-1">Biggest Risk</p>
      <p className="text-gray-200 text-sm">{result.biggestRisk}</p>
    </div>
    <div>
      <p className="text-gray-500 text-sm mb-1">Immediate Next Step</p>
      <p className="text-gray-200 text-sm font-medium">{result.immediateNextStep}</p>
    </div>
  </div>
</div>
      {/* Score + Confidence Level */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Decision Score</p>
            <p className="text-3xl font-bold text-[#0ea5a5]">{result.decisionScore}/100</p>
          </div>
          <div
            className="text-right cursor-help"
            title="Based on available market and industry evidence."
          >
            <p className="text-sm text-gray-500">Confidence Level</p>
            <p className="text-3xl font-bold text-gray-200">{result.confidenceLevel}</p>
          </div>
        </div>
      </div>

      {/* What Would Change This Verdict? */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
        <h3 className="font-semibold text-gray-200 mb-3">What Would Change This Verdict?</h3>
        <ul className="space-y-1">
          {result.whatWouldChangeVerdict.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-[#0ea5a5]">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Toggle Full Analysis */}
      <button
        onClick={() => setShowFull(!showFull)}
        className="w-full text-center text-sm text-[#0ea5a5] hover:text-[#0c8f8f] py-2 transition-colors"
      >
        {showFull ? 'Hide Full Analysis ▲' : 'Show Full Analysis ▼'}
      </button>

      {showFull && (
        <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 space-y-6 text-gray-300">

          {/* Why This Verdict */}
          <div>
            <h3 className="font-semibold text-gray-200 mb-3">Why This Verdict?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Positive Factors</p>
                <ul className="space-y-1">
                  {result.positiveFactors.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-400">
                      <span>✓</span><span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Negative Factors</p>
                <ul className="space-y-1">
                  {result.negativeFactors.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-400">
                      <span>✗</span><span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Evidence Considered */}
          <div>
            <h3 className="font-semibold text-gray-200 mb-2">Evidence Considered</h3>
            <ul className="space-y-1">
              {result.evidenceConsidered.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="text-gray-500">•</span>
                  <span>{e.text} <span className={evidenceColor(e.strength)}>({evidenceLabel(e.strength)})</span></span>
                </li>
              ))}
            </ul>
          </div>

          {/* Analysis Scope */}
          <div>
            <h3 className="font-semibold text-gray-200 mb-2">Analysis Scope</h3>
            <ul className="space-y-1">
              {result.analysisScope.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-[#0ea5a5]">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Assumptions */}
          <div>
            <h3 className="font-semibold text-gray-200 mb-2">Assumptions</h3>
            <ul className="space-y-1">
              {result.assumptions.map((a, i) => (
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
              {result.opportunities.map((o, i) => (
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
              {result.risks.map((r, i) => (
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
              {result.successFactors.map((s, i) => (
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
      )}
    </div>
  )
}