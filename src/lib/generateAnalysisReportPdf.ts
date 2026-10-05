import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  RecommendationSeverity,
  TechnicalDebtReport,
} from "../types/analysisReport";
import { getRecommendationSeverity } from "./analysisReport";

export { getRecommendationSeverity } from "./analysisReport";

const BRAND_BLUE: [number, number, number] = [25, 107, 223];
const BRAND_PURPLE: [number, number, number] = [124, 58, 237];
const INK: [number, number, number] = [30, 41, 59];
const MUTED: [number, number, number] = [100, 116, 139];
const PAGE_TOP = 31;
const PAGE_BOTTOM = 276;
const PAGE_LEFT = 15;
const CONTENT_WIDTH = 180;

type PdfWithTable = jsPDF & { lastAutoTable?: { finalY: number } };

const printable = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "N/A";
  return String(value);
};

export function formatBugProbability(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "N/A";
  return `${Math.round(value * 100)}%`;
}

export function sanitizePdfFilenamePart(value: string): string {
  const withoutControlCharacters = [...value].filter((character) => character.charCodeAt(0) > 31).join("");
  const safe = withoutControlCharacters
    .trim()
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[._]+|[._]+$/g, "");
  return safe || "Repository";
}

export function buildAnalysisReportFilename(report: TechnicalDebtReport): string {
  return `DebtLens_${sanitizePdfFilenamePart(report.repositoryName)}_Analysis_${report.analysisId}.pdf`;
}

export function getRecommendationCounts(report: TechnicalDebtReport): Record<RecommendationSeverity, number> {
  const counts: Record<RecommendationSeverity, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const recommendation of report.prioritizedRefactoringList ?? []) {
    counts[getRecommendationSeverity(recommendation)] += 1;
  }
  return counts;
}

function addPageFurniture(doc: jsPDF, generatedAt: string): void {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...BRAND_BLUE);
    doc.setLineWidth(0.7);
    doc.line(PAGE_LEFT, 21, 195, 21);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND_BLUE);
    doc.text("DebtLens", PAGE_LEFT, 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("AI-Powered Technical Debt Analytics", PAGE_LEFT, 18);

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(PAGE_LEFT, 282, 195, 282);
    doc.setFontSize(7.5);
    doc.text("DebtLens - Technical Debt Analysis Report", PAGE_LEFT, 287);
    doc.text(`Generated: ${generatedAt}`, 105, 287, { align: "center" });
    doc.text(`Page ${page} of ${pages}`, 195, 287, { align: "right" });
  }
}

export function createAnalysisReportPdfDocument(report: TechnicalDebtReport): { document: jsPDF; filename: string } {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" }) as PdfWithTable;
  const recommendations = [...(report.prioritizedRefactoringList ?? [])];
  const generatedAt = new Date().toLocaleString();
  let y = PAGE_TOP;

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_BOTTOM) {
      doc.addPage();
      y = PAGE_TOP;
    }
  };

  const wrappedText = (text: unknown, indent = 0, fontSize = 9, bold = false) => {
    const content = printable(text);
    const lines = doc.splitTextToSize(content, CONTENT_WIDTH - indent);
    const height = Math.max(5, lines.length * (fontSize * 0.42 + 1));
    ensureSpace(height + 2);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...INK);
    doc.text(lines, PAGE_LEFT + indent, y);
    y += height;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...BRAND_PURPLE);
  doc.text("TECHNICAL DEBT ANALYSIS REPORT", PAGE_LEFT, y);
  y += 9;

  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text("Repository Information", PAGE_LEFT, y);
  y += 3;
  autoTable(doc, {
    startY: y,
    theme: "grid",
    body: [
      ["Repository", printable(report.repositoryName), "Branch", printable(report.branch)],
      ["Analysis ID", printable(report.analysisId), "Report date", report.generatedAt ? new Date(report.generatedAt).toLocaleString() : "N/A"],
    ],
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 2.5, textColor: INK, overflow: "linebreak" },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [239, 246, 255] }, 2: { fontStyle: "bold", fillColor: [245, 243, 255] } },
    margin: { left: PAGE_LEFT, right: PAGE_LEFT, top: PAGE_TOP, bottom: 20 },
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Analysis Summary", PAGE_LEFT, y);
  y += 3;
  autoTable(doc, {
    startY: y,
    head: [["Debt Score", "Health", "Risk", "Classes", "Defective", "SATD"]],
    body: [[
      `${printable(report.overallDebtScore)} / 100`, printable(report.overallHealthScore), printable(report.overallRiskLevel),
      printable(report.totalClasses), printable(report.defectiveClassesCount), printable(report.totalSatdComments),
    ]],
    headStyles: { fillColor: BRAND_BLUE, textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { font: "helvetica", fontSize: 8.5, halign: "center", cellPadding: 2.8, textColor: INK },
    margin: { left: PAGE_LEFT, right: PAGE_LEFT, top: PAGE_TOP, bottom: 20 },
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("PRIORITIZED RECOMMENDATIONS", PAGE_LEFT, y);
  y += 6;
  wrappedText("Recommendations are grouped by risk and ordered by refactoring priority. Address the highest-priority items first.");
  y += 3;

  const severities: RecommendationSeverity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  let recommendationNumber = 1;
  for (const severity of severities) {
    const group = recommendations
      .filter((item) => getRecommendationSeverity(item) === severity)
      .sort((a, b) => (a.refactorPriorityRank ?? Number.MAX_SAFE_INTEGER) - (b.refactorPriorityRank ?? Number.MAX_SAFE_INTEGER));

    ensureSpace(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const severityColor: [number, number, number] = severity === "CRITICAL"
      ? [190, 24, 93]
      : severity === "HIGH"
        ? [217, 119, 6]
        : severity === "MEDIUM"
          ? BRAND_BLUE
          : [5, 150, 105];
    doc.setTextColor(...severityColor);
    doc.text(`${severity} (${group.length})`, PAGE_LEFT, y);
    y += 7;

    if (group.length === 0) {
      wrappedText("No recommendations in this category.", 2, 8.5);
      y += 3;
      continue;
    }

    for (const recommendation of group) {
      ensureSpace(48);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...INK);
      const title = `${recommendationNumber}. ${printable(recommendation.className)}`;
      doc.text(doc.splitTextToSize(title, CONTENT_WIDTH), PAGE_LEFT, y);
      y += 6;
      wrappedText(`File: ${printable(recommendation.filePath)}${recommendation.startLine != null && recommendation.endLine != null ? ` (lines ${recommendation.startLine}-${recommendation.endLine})` : ""}`, 2, 8.5);

      autoTable(doc, {
        startY: y,
        head: [["Debt Score", "Risk", "Health", "Bug Probability", "LOC"]],
        body: [[
          recommendation.technicalDebtScore == null ? "N/A" : `${recommendation.technicalDebtScore} / 100`,
          printable(recommendation.riskLevel), printable(recommendation.healthScore),
          formatBugProbability(recommendation.bugProbability), printable(recommendation.numberOfLinesOfCode),
        ]],
        headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255] },
        styles: { font: "helvetica", fontSize: 8, halign: "center", cellPadding: 2, textColor: INK, overflow: "linebreak" },
        margin: { left: PAGE_LEFT + 2, right: PAGE_LEFT, top: PAGE_TOP, bottom: 20 },
        pageBreak: "auto",
      });
      y = (doc.lastAutoTable?.finalY ?? y) + 5;

      wrappedText("Primary Debt Drivers:", 2, 9, true);
      const drivers = recommendation.primaryDrivers?.length ? recommendation.primaryDrivers : ["N/A"];
      for (const driver of drivers) wrappedText(`- ${printable(driver)}`, 6, 8.5);

      const actions = recommendation.recommendedActions?.length ? recommendation.recommendedActions : [];
      if (actions.length === 0) {
        wrappedText("Recommended Action: N/A", 2, 9, true);
        wrappedText("Suggested Refactoring: N/A", 2, 8.5);
      } else {
        for (const action of actions) {
          wrappedText(`Recommended Action: ${printable(action.title)}`, 2, 9, true);
          wrappedText(printable(action.description), 6, 8.5);
          wrappedText("Suggested Refactoring:", 2, 9, true);
          wrappedText(action.suggestedRefactoring, 6, 8.5);
        }
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(PAGE_LEFT, y, 195, y);
      y += 7;
      recommendationNumber += 1;
    }
  }

  const counts = getRecommendationCounts(report);
  ensureSpace(58);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BRAND_PURPLE);
  doc.text("REPORT SUMMARY", PAGE_LEFT, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    theme: "striped",
    body: [
      ["Total Recommendations", recommendations.length],
      ["Critical", counts.CRITICAL],
      ["High", counts.HIGH],
      ["Medium", counts.MEDIUM],
      ["Low", counts.LOW],
    ],
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.2, textColor: INK },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 65 }, 1: { halign: "center" } },
    margin: { left: PAGE_LEFT, right: PAGE_LEFT, top: PAGE_TOP, bottom: 20 },
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 7;
  wrappedText("This report was generated by DebtLens based on the technical debt analysis performed on the selected repository.", 0, 8.5);

  addPageFurniture(doc, generatedAt);
  const filename = buildAnalysisReportFilename(report);
  return { document: doc, filename };
}

export function generateAnalysisReportPdf(report: TechnicalDebtReport): string {
  const { document, filename } = createAnalysisReportPdfDocument(report);
  document.save(filename);
  return filename;
}
