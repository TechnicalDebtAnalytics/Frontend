import { describe, expect, it } from "vitest";
import type { ClassRecommendation, TechnicalDebtReport } from "../types/analysisReport";
import {
  buildAnalysisReportFilename,
  createAnalysisReportPdfDocument,
  formatBugProbability,
  getRecommendationCounts,
  getRecommendationSeverity,
  sanitizePdfFilenamePart,
} from "./generateAnalysisReportPdf";

const recommendation = (riskLevel: string, rank: number): ClassRecommendation => ({
  classId: rank,
  className: `${riskLevel}AnalysisService.java`,
  filePath: `src/main/java/com/example/${"very-long-directory/".repeat(5)}${riskLevel}AnalysisService.java`,
  startLine: 1,
  endLine: 240,
  numberOfLinesOfCode: 240,
  technicalDebtScore: 90 - rank * 10,
  healthScore: "POOR",
  riskLevel,
  bugProbability: 0.72,
  refactorPriorityRank: rank,
  primaryDrivers: ["High cyclomatic complexity", "Large class size"],
  recommendedActions: [{
    type: "EXTRACT_CLASS",
    priority: riskLevel,
    title: "Extract responsibilities",
    description: "Refactor the class into smaller components. ".repeat(20),
    suggestedRefactoring: "Extract repository processing logic into a dedicated service component. ".repeat(20),
  }],
});

const report: TechnicalDebtReport = {
  reportId: 7,
  analysisId: 42,
  repositoryId: 3,
  repositoryName: "Analysis: Service/Spring*Boot?",
  branch: "main",
  generatedAt: "2026-10-05T12:00:00Z",
  overallDebtScore: 64,
  overallHealthScore: "FAIR",
  overallRiskLevel: "HIGH",
  totalClasses: 24,
  defectiveClassesCount: 4,
  totalSatdComments: 9,
  prioritizedRefactoringList: [
    recommendation("CRITICAL", 1),
    recommendation("HIGH", 2),
    recommendation("MEDIUM", 3),
    recommendation("LOW", 4),
  ],
};

describe("analysis report PDF helpers", () => {
  it("formats probabilities and missing optional values", () => {
    expect(formatBugProbability(0.72)).toBe("72%")
    expect(formatBugProbability(undefined)).toBe("N/A")
  });

  it("sanitizes the repository name used by the filename", () => {
    expect(sanitizePdfFilenamePart(" Analysis: Service/Spring*Boot? ")).toBe("Analysis_Service_Spring_Boot");
    expect(buildAnalysisReportFilename(report)).toBe("DebtLens_Analysis_Service_Spring_Boot_Analysis_42.pdf");
  });

  it("groups the complete recommendation set into all four severity levels", () => {
    expect(getRecommendationCounts(report)).toEqual({ CRITICAL: 1, HIGH: 1, MEDIUM: 1, LOW: 1 });
    expect(getRecommendationSeverity({ ...recommendation("UNKNOWN", 5), technicalDebtScore: 51 })).toBe("HIGH");
  });

  it("generates a multi-page document with long content and tolerates missing values", () => {
    const incomplete = {
      ...report,
      prioritizedRefactoringList: [
        ...report.prioritizedRefactoringList,
        { ...recommendation("LOW", 5), bugProbability: undefined, primaryDrivers: [], recommendedActions: [] },
      ],
    } as unknown as TechnicalDebtReport;

    const result = createAnalysisReportPdfDocument(incomplete);
    expect(result.filename).toBe("DebtLens_Analysis_Service_Spring_Boot_Analysis_42.pdf");
    expect(result.document.getNumberOfPages()).toBeGreaterThan(1);
  });
});
