export interface Decision {
  id: string;
  decision_text: string;
  created_at: string;
}

export interface AnalysisResult {
  decisionScore: number;      // 0-100
  researchConfidence?: number; // 0-100, how confident the AI is
  confidence?: number;         // legacy field support
  assumptions: string[];
  opportunities: string[];
  risks: string[];
  successFactors: string[];
  recommendation: string;
}