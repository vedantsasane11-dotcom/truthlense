import { AnalysisResult } from '../../types/truthlense/decision'

interface Props {
  data: AnalysisResult
}

const severityColor = (level: string) => {
  if (level === 'high') return 'text-red-600'
  if (level === 'medium') return 'text-yellow-600'
  return 'text-green-600'
}

export default function ResultCard({ data }: Props) {
  return (
    <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 space-y-6 text-gray-300">
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
        <div>
          <p className="text-sm text-gray-500">Decision Score</p>
          <p className="text-3xl font-bold text-[#0ea5a5]">{data.decisionScore}/100</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Research Confidence</p>
          <p className="text-3xl font-bold text-gray-200">{data.researchConfidence || 0}%</p>
        </div>
      </div>

      {/* Assumptions */}
      <div>
        <h3 className="font-semibold text-amber-400">Assumptions</h3>
        <ul className="space-y-2 mt-2">
          {data.assumptions?.map((item: string, i: number) => (
            <li key={i} className="text-gray-300 flex items-start gap-2">
              <span>◆</span> <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Opportunities */}
      <div>
        <h3 className="font-semibold text-green-400">Opportunities</h3>
        <ul className="space-y-2 mt-2">
          {data.opportunities?.map((item: string, i: number) => (
            <li key={i} className="text-gray-300 flex items-start gap-2">
              <span className="text-green-400">✓</span> <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Risks */}
      <div>
        <h3 className="font-semibold text-red-400">Risks</h3>
        <ul className="space-y-2 mt-2">
          {data.risks?.map((item: string, i: number) => (
            <li key={i} className="text-gray-300 flex items-start gap-2">
              <span className="text-red-400">⚠</span> <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Success Factors */}
      <div>
        <h3 className="font-semibold text-teal-400">Success Factors</h3>
        <ul className="space-y-2 mt-2">
          {data.successFactors?.map((item: string, i: number) => (
            <li key={i} className="text-gray-300 flex items-start gap-2">
              <span className="text-teal-400">☆</span> <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Verdict */}
      <div className="bg-[#0ea5a5]/10 rounded-lg p-4">
        <h3 className="font-semibold text-gray-300 mb-1">Execution Recommendation</h3>
        <p className="text-gray-300 text-sm">{data.recommendation}</p>
      </div>

    </div>
  )
}