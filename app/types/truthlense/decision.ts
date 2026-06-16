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

export interface AnalysisResult {
  decisionScore: number;      // 0-100
  confidence: number;         // 0-100, how confident the AI is
  assumptions: Assumption[];
  opportunities: Opportunity[];
  risks: Risk[];
  successFactors: SuccessFactor[];
  recommendation: string;
}