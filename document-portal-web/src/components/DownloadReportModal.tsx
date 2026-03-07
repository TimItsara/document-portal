import { useState } from "react";
import jsPDF from "jspdf";
import { renderVerificationPage, type VerifyResultData } from "../utils/pdfUtils";

interface DocumentOption {
  code: string;
  displayName: string;
  result: VerifyResultData | null;
}

interface Props {
  documents: DocumentOption[];
  onClose: () => void;
}

// ---- Modal Component ----
export default function DownloadReportModal({ documents, onClose }: Props) {
  const available = documents.filter((d) => d.result !== null);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(available.map((d) => d.code)), // all selected by default
  );
  const [loading, setLoading] = useState(false);

  const toggle = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === available.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(available.map((d) => d.code)));
    }
  };

  const handleDownload = () => {
    const toExport = available.filter((d) => selected.has(d.code));
    if (toExport.length === 0) return;

    setLoading(true);
    try {
      const doc = new jsPDF();
      toExport.forEach((item, idx) => {
        renderVerificationPage(doc, item.result!, idx);
      });
      doc.save(`truuth-verification-report-${Date.now()}.pdf`);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        style={{ border: "1px solid #E1E1EA" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "#E1E1EA" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "#F3E2F8" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8C07DD"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "#20203A" }}>
                Download Report
              </h2>
              <p className="text-xs" style={{ color: "#70708F" }}>
                Select documents to include
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-3">
          {/* Select All */}
          <button
            onClick={toggleAll}
            className="text-xs font-semibold cursor-pointer hover:underline"
            style={{ color: "#8C07DD" }}
          >
            {selected.size === available.length ? "Deselect All" : "Select All"}
          </button>

          {/* Document list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {available.length === 0 && (
              <p className="text-sm text-center py-6" style={{ color: "#70708F" }}>
                No completed verification results available.
              </p>
            )}
            {available.map((doc) => {
              const isChecked = selected.has(doc.code);
              const score = doc.result?.outcomes?.[0]?.score;
              const scoreColor =
                score !== undefined
                  ? score >= 90
                    ? "#16a34a"
                    : score >= 70
                      ? "#d97706"
                      : "#dc2626"
                  : "#6b7280";

              return (
                <label
                  key={doc.code}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                  style={{
                    border: `1.5px solid ${isChecked ? "#8C07DD" : "#E1E1EA"}`,
                    background: isChecked ? "#FAF5FF" : "white",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(doc.code)}
                    className="w-4 h-4 cursor-pointer"
                    style={{ accentColor: "#8C07DD" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#20203A" }}>
                      {doc.displayName}
                    </p>
                    <p className="text-xs" style={{ color: "#70708F" }}>
                      {doc.result?.document?.countryCode} ·{" "}
                      {doc.result?.document?.documentType?.replace(/_/g, " ")}
                    </p>
                  </div>
                  {score !== undefined && (
                    <span className="text-xs font-bold" style={{ color: scoreColor }}>
                      {score} / 100
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Not available note */}
          {documents.filter((d) => d.result === null).length > 0 && (
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              * Documents without results are not available for download.
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex justify-between items-center gap-3"
          style={{ borderColor: "#E1E1EA" }}
        >
          <span className="text-xs" style={{ color: "#70708F" }}>
            {selected.size} of {available.length} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
              style={{ border: "1px solid #E1E1EA", color: "#374151", background: "white" }}
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={selected.size === 0 || loading}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ background: "#8C07DD" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {loading ? "Generating..." : `Download PDF`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
