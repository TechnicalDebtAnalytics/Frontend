export interface RefactoringAction {
  type: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  title: string;
  description: string;
  suggestedRefactoring: string;
}

export interface ClassRecommendation {
  classId: number;
  className: string;
  filePath: string;
  startLine: number;
  endLine: number;
  numberOfLinesOfCode: number;
  technicalDebtScore: number;
  healthScore: "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
  bugProbability: number;
  refactorPriorityRank: number;
  primaryDrivers: string[];
  recommendedActions: RefactoringAction[];
}

export interface TechnicalDebtReport {
  reportId: number;
  analysisId: number;
  repositoryId: number;
  repositoryName: string;
  branch: string;
  generatedAt: string;
  overallDebtScore: number;
  overallHealthScore: string;
  overallRiskLevel: string;
  totalClasses: number;
  defectiveClassesCount: number;
  totalSatdComments: number;
  prioritizedRefactoringList: ClassRecommendation[];
}

export type RecommendationSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
