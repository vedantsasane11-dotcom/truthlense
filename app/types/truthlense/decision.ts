export interface Decision {
  id: string;
  decision_text: string;
  created_at: string;
}

export interface Assumption {
  text: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface Opportunity {
  text: string;
  impact: 'high' | 'medium' | 'low';
}

export interface Risk {
  text: string;
  severity: 'high' | 'medium' | 'low';
}

export interface SuccessFactor {
  text: string;
  required: boolean;
}

export interface Verdict {
  label: 'Favorable' | 'Proceed with Caution' | 'High Risk';
  summary: string;
}
export interface EvidenceItem {
  text: string;
  strength: 'high' | 'medium' | 'low';
}

export interface AnalysisResult {
  verdict: Verdict;
  decisionScore: number;
  confidence: number;
  positiveFactors: string[];
  negativeFactors: string[];
  evidenceConsidered: EvidenceItem[];
  analysisScope: string[];
  assumptions: Assumption[];
  opportunities: Opportunity[];
  risks: Risk[];
  successFactors: SuccessFactor[];
  recommendation: string;
}