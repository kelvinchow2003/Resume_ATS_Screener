"use client";

import CompositeScore from "@/components/results/CompositeScore";
import ScoreCard from "@/components/results/ScoreCard";
import KeywordGrid from "@/components/results/KeywordGrid";
import AIFeedbackPanel from "@/components/results/AIFeedbackPanel";
import type {
  LegacyATSResult,
  SemanticATSResult,
  AIRecruiterResult,
} from "@/types/evaluation";

interface ResultsClientProps {
  compositeScore: number;
  legacy: LegacyATSResult;
  semantic: SemanticATSResult;
  aiRecruiter: AIRecruiterResult;
}

export default function ResultsClient({
  compositeScore,
  legacy,
  semantic,
  aiRecruiter,
}: ResultsClientProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <CompositeScore
        score={compositeScore}
        legacyScore={legacy.score}
        semanticScore={semantic.score}
        aiScore={aiRecruiter.Score}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <ScoreCard engine={{ type: "legacy", data: legacy }} delay={0} />
        <ScoreCard engine={{ type: "semantic", data: semantic }} delay={120} />
        <ScoreCard engine={{ type: "ai-recruiter", data: aiRecruiter }} delay={240} />
      </div>

      <KeywordGrid
        matchedKeywords={legacy.matchedKeywords}
        missingKeywords={legacy.missingKeywords}
      />

      <AIFeedbackPanel result={aiRecruiter} />
    </div>
  );
}
