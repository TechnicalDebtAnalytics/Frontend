import type { ClassRecommendation, RecommendationSeverity } from "../types/analysisReport";

export function getRecommendationSeverity(recommendation: ClassRecommendation): RecommendationSeverity {
  const risk = recommendation.riskLevel?.toUpperCase();
  if (risk === "CRITICAL" || risk === "HIGH" || risk === "MEDIUM" || risk === "LOW") return risk;

  const score = recommendation.technicalDebtScore ?? 0;
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MEDIUM";
  return "LOW";
}
