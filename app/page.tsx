"use client";

import { useState } from "react";
import DecisionInput from "./components/truthlense/DecisionInput";
import AnalyzeButton from "./components/truthlense/AnalyzeButton";
import ResultCard from "./components/truthlense/ResultCard";

export default function Page() {
  const [decisionQuery, setDecisionQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!decisionQuery.trim()) return;
    
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionQuery }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Audit failed");
      }

      setAnalysisResult(data);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Something went wrong with the decision audit.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center px-4 py-24">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-6xl font-semibold text-white tracking-tight">TruthLense</h1>
          <p className="text-gray-400 text-lg">Know before you commit.</p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-2 focus-within:border-[#0ea5a5] transition-colors">
          <DecisionInput value={decisionQuery} onChange={setDecisionQuery} />
          <div className="flex justify-end px-2 pb-1">
            <AnalyzeButton onClick={handleAnalyze} loading={isLoading} />
          </div>
        </div>

        {analysisResult && <ResultCard result={analysisResult} />}
      </div>
    </main>
  )
}