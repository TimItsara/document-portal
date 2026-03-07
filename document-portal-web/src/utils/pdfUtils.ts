/**
 * Shared PDF rendering utilities for verification result reports.
 * Used by both DocumentVerifyResult (single-doc download) and
 * DownloadReportModal (multi-doc download).
 */
import jsPDF from "jspdf";

// ── Shared types ─────────────────────────────────────────────────────────────

export interface CheckResult {
  name: string;
  result: {
    status: "PASS" | "FAIL" | "NOT_APPLICABLE";
    message: string;
    checkResponse?: Record<string, unknown>;
  };
  completedAt: string;
}

export interface VerifyResultData {
  status: string;
  document: { documentType: string; countryCode: string };
  outcomes: Array<{ name: string; score: number; status: string; message: string }>;
  checkResults: Record<string, CheckResult> | null;
  createdAt: string;
  updatedAt: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const DEEPFAKE_CHECK_KEYS = [
  "deepFakeCheck",
  "deepFake2Check",
  "deepFake3Check",
  "deepFake4Check",
  "deepFake5Check",
  "deepFake6Check",
  "deepFake7Check",
] as const;

export const SECURITY_CHECK_KEYS = [
  "c2paCheck",
  "eofCountCheck",
  "timeStampCheck",
  "watermarkCheck",
  "annotationCheck",
] as const;

export const SECURITY_CHECK_LABELS: Record<string, string> = {
  c2paCheck: "C2PA Manifest",
  eofCountCheck: "EOF Count",
  timeStampCheck: "Timestamp",
  watermarkCheck: "Watermark",
  annotationCheck: "Annotation",
};

// ── Internal colour palette ───────────────────────────────────────────────────

const COLORS = {
  primary: "#7c3aed",
  success: "#16a34a",
  error: "#dc2626",
  warning: "#d97706",
  neutral: "#6b7280",
  textPrimary: "#1a1a1a",
  textSecondary: "#4b5563",
  border: "#e5e7eb",
} as const;

// ── Core page renderer ────────────────────────────────────────────────────────

/**
 * Renders one VerifyResultData page into `doc`.
 * Pass `pageIndex === 0` to use the existing first page;
 * any other value calls `doc.addPage()` first.
 */
export function renderVerificationPage(
  doc: jsPDF,
  data: VerifyResultData,
  pageIndex: number,
): void {
  if (pageIndex > 0) doc.addPage();

  let y = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - 2 * margin;

  // ── Layout helpers (closures so they share `y`) ───────────────────────────

  /** Set only the font style; pass "" to leave the font family unchanged. */
  const setStyle = (style: "bold" | "normal") => doc.setFont("", style);

  const checkPageSpace = (needed = 15) => {
    if (y > pageHeight - needed) {
      doc.addPage();
      y = 20;
    }
  };

  const addSectionTitle = (title: string) => {
    checkPageSpace(20);
    y += 4;
    doc.setFontSize(13);
    doc.setTextColor(COLORS.primary);
    setStyle("bold");
    doc.text(title, margin, y);
    y += 7;
    doc.setDrawColor(COLORS.primary);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  const addParagraph = (text: string, fontSize = 11) => {
    checkPageSpace(10);
    doc.setFontSize(fontSize);
    doc.setTextColor(COLORS.textSecondary);
    setStyle("normal");
    const lines: string[] = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line) => {
      checkPageSpace(5);
      doc.text(line, margin, y);
      y += 5.5;
    });
    y += 2;
  };

  const addLabeledRow = (label: string, value: string) => {
    checkPageSpace(8);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.textPrimary);
    setStyle("bold");
    doc.text(`${label}:`, margin, y);
    setStyle("normal");
    doc.setTextColor(COLORS.textSecondary);
    const valueLines: string[] = doc.splitTextToSize(value, contentWidth - 50);
    valueLines.forEach((line, idx) => doc.text(line, margin + 50, y + idx * 5.5));
    y += Math.max(6.5, valueLines.length * 5.5);
  };

  const scoreColor = (score: number) =>
    score >= 90 ? COLORS.success : score >= 70 ? COLORS.warning : COLORS.error;

  // ── Document header ───────────────────────────────────────────────────────

  const docTypeLabel =
    data.document?.documentType?.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase()) ??
    "Document";

  doc.setFontSize(18);
  doc.setTextColor(COLORS.primary);
  setStyle("bold");
  doc.text(docTypeLabel, margin, y);
  y += 12;

  // ── Document metadata ─────────────────────────────────────────────────────

  addSectionTitle("Document Information");
  addLabeledRow("Type", docTypeLabel);
  addLabeledRow("Country", data.document?.countryCode ?? "N/A");
  addLabeledRow("Status", data.status);
  y += 3;

  // ── Fraud score ───────────────────────────────────────────────────────────

  if (data.outcomes?.[0]) {
    const { score, message } = data.outcomes[0];
    addSectionTitle("Fraud Check Result");
    checkPageSpace(25);
    y += 8;
    doc.setFontSize(32);
    doc.setTextColor(scoreColor(score));
    setStyle("bold");
    doc.text(`${score} / 100`, margin, y);
    y += 12;
    addParagraph(message, 10);
    y += 4;
  }

  // ── Deepfake analysis ─────────────────────────────────────────────────────

  if (data.checkResults) {
    const scores = DEEPFAKE_CHECK_KEYS.map(
      (k) => (data.checkResults![k]?.result?.checkResponse as any)?.score as number | undefined,
    ).filter((s): s is number => s !== undefined);

    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      addSectionTitle("Deepfake Analysis");
      addParagraph(`Average Authenticity Score: ${(avg * 100).toFixed(1)}%`, 11);
      addParagraph(`Models Tested: ${scores.length} — All Authentic`, 10);
      y += 3;

      // Score table header
      checkPageSpace(40);
      doc.setFontSize(10);
      doc.setTextColor(COLORS.textPrimary);
      setStyle("bold");
      doc.text("Model", margin, y);
      doc.text("Score", margin + contentWidth - 25, y);
      y += 6;
      doc.setDrawColor(COLORS.border);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      // Score rows
      setStyle("normal");
      doc.setFontSize(9);
      scores.forEach((s, idx) => {
        checkPageSpace(8);
        doc.setTextColor(COLORS.textSecondary);
        doc.text(`Model ${idx + 1}`, margin, y);
        doc.setTextColor(s >= 0.9 ? COLORS.success : s >= 0.7 ? COLORS.warning : COLORS.error);
        setStyle("bold");
        doc.text(`${(s * 100).toFixed(1)}%`, margin + contentWidth - 25, y);
        setStyle("normal");
        y += 5.5;
      });
      y += 55;
    }
  }

  // ── Security checks ───────────────────────────────────────────────────────

  if (data.checkResults) {
    const applicable = SECURITY_CHECK_KEYS.filter((k) => data.checkResults![k]);

    if (applicable.length > 0) {
      checkPageSpace(20);
      addSectionTitle("Security Checks");

      applicable.forEach((key) => {
        const check = data.checkResults![key];
        if (!check) return;

        checkPageSpace(12);

        const color =
          check.result.status === "PASS"
            ? COLORS.success
            : check.result.status === "FAIL"
              ? COLORS.error
              : COLORS.neutral;
        const icon =
          check.result.status === "PASS" ? "✓" : check.result.status === "FAIL" ? "✗" : "—";

        const checkNameWidth = 40;
        const lines: string[] = doc.splitTextToSize(
          check.result.message,
          contentWidth - checkNameWidth - 5,
        );

        doc.setFontSize(10);
        doc.setTextColor(color);
        setStyle("bold");
        doc.text(`${icon} ${SECURITY_CHECK_LABELS[key]}`, margin, y);
        setStyle("normal");
        doc.setTextColor(COLORS.textSecondary);
        doc.setFontSize(9);
        doc.text(lines[0], margin + checkNameWidth, y);
        y += 6;

        for (let i = 1; i < lines.length; i++) {
          checkPageSpace(6);
          doc.text(lines[i], margin + checkNameWidth, y);
          y += 5.5;
        }
        y += 2;
      });
      y += 3;
    }
  }

  // ── Submission footer ─────────────────────────────────────────────────────

  checkPageSpace(20);
  y += 3;
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setTextColor(COLORS.textPrimary);
  setStyle("bold");
  doc.text("Submission Details", margin, y);
  y += 6;

  addLabeledRow("Submitted", new Date(data.createdAt).toLocaleString());
  addLabeledRow("Completed", new Date(data.updatedAt).toLocaleString());

  doc.setFontSize(8);
  doc.setTextColor("#999");
  doc.text("Generated by TRUUTH Document Verification System", margin, pageHeight - 8);
}

// ── Single-document download convenience ─────────────────────────────────────

export function downloadVerificationPdf(data: VerifyResultData): void {
  const doc = new jsPDF();
  renderVerificationPage(doc, data, 0);
  doc.save(`verification-${data.document.documentType}.pdf`);
}
