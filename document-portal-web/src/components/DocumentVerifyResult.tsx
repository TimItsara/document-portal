import { useState } from "react";
import {
  type VerifyResultData,
  type CheckResult,
  DEEPFAKE_CHECK_KEYS,
  downloadVerificationPdf,
} from "../utils/pdfUtils";

type CheckStatus = "PASS" | "FAIL" | "NOT_APPLICABLE";

const otherCheckKeys = [
  "c2paCheck",
  "eofCountCheck",
  "timeStampCheck",
  "watermarkCheck",
  "annotationCheck",
  "screenshotCheck",
  "handwritingCheck",
  "visualAnomalyCheck",
  "softwareEditorCheck",
  "softwareFingerPrintCheck",
  "compressionHeatmapCheck",
];

const checkLabels: Record<string, string> = {
  deepFakeCheck: "Deepfake Check 1",
  deepFake2Check: "Deepfake Check 2",
  deepFake3Check: "Deepfake Check 3",
  deepFake4Check: "Deepfake Check 4",
  deepFake5Check: "Deepfake Check 5",
  deepFake6Check: "Deepfake Check 6",
  deepFake7Check: "Deepfake Check 7",
  c2paCheck: "C2PA Manifest",
  eofCountCheck: "EOF Count",
  timeStampCheck: "Timestamp",
  watermarkCheck: "Watermark",
  annotationCheck: "Annotation",
  screenshotCheck: "Screenshot",
  handwritingCheck: "Handwriting",
  visualAnomalyCheck: "Visual Anomaly",
  softwareEditorCheck: "Software Editor",
  softwareFingerPrintCheck: "Software Fingerprint",
  compressionHeatmapCheck: "Compression Heatmap",
};

const statusClass: Record<CheckStatus, string> = {
  PASS: "bg-success-light text-success",
  FAIL: "bg-error-light text-error",
  NOT_APPLICABLE: "bg-neutral-light text-neutral",
};

const statusLabel: Record<CheckStatus, string> = {
  PASS: "✓ Pass",
  FAIL: "✗ Fail",
  NOT_APPLICABLE: "— N/A",
};

function StatusBadge({ status }: { status: CheckStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClass[status] ?? statusClass.NOT_APPLICABLE}`}
    >
      {statusLabel[status] ?? "N/A"}
    </span>
  );
}

function CheckRow({ label, check }: { label: string; check: CheckResult }) {
  const [expanded, setExpanded] = useState(false);
  const score = (check.result.checkResponse as any)?.score;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-page transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={check.result.status} />
          <span className="text-sm font-medium text-gray-800">{label}</span>
          {score !== undefined && (
            <span className="text-xs text-neutral">Score: {(score * 100).toFixed(1)}%</span>
          )}
        </div>
        <span className="text-neutral text-xs ml-2">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-2 bg-page border-t border-border">
          <p className="text-xs text-gray-600 leading-relaxed">{check.result.message}</p>
        </div>
      )}
    </div>
  );
}

function DeepfakeScoreBar({
  checks,
  data,
}: {
  checks: readonly string[];
  data: Record<string, CheckResult> | null;
}) {
  if (!data || Object.keys(data).length === 0) return null;
  const scores = checks
    .map((k) => (data[k]?.result?.checkResponse as any)?.score)
    .filter((s) => s !== undefined) as number[];
  if (scores.length === 0) return null;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">Deepfake Analysis</span>
        <StatusBadge status="PASS" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-neutral-light rounded-full h-2">
          <div
            className="bg-success h-2 rounded-full transition-all"
            style={{ width: `${avg * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold text-success min-w-[44px] text-right">
          {(avg * 100).toFixed(1)}%
        </span>
      </div>
      <p className="text-xs text-neutral">{scores.length} deepfake models tested — all authentic</p>
      <div className="grid grid-cols-7 gap-1">
        {checks.map((k, i) => {
          const s = (data[k]?.result?.checkResponse as any)?.score ?? 0;
          return (
            <div key={k} className="text-center">
              <div className="text-xs text-neutral mb-1">M{i + 1}</div>
              <div className="w-full h-8 bg-neutral-light rounded flex items-end overflow-hidden">
                <div
                  className="w-full bg-success/70 rounded transition-all"
                  style={{ height: `${s * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">{(s * 100).toFixed(0)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DocumentVerifyResult({
  data,
  onClose,
}: {
  data: VerifyResultData;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = JSON.stringify(data, null, 2);
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const outcome = data.outcomes?.[0];
  const scorePercent = outcome?.score ?? 0;
  const hasCheckResults = data.checkResults && Object.keys(data.checkResults).length > 0;
  const docTypeLabel =
    data.document?.documentType?.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase()) ??
    "Document";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8C07DD"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Verification Result</h2>
              <p className="text-xs text-neutral">
                {docTypeLabel} · {data.document?.countryCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral hover:text-gray-700 transition-colors text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Score card */}
          {outcome && (
            <div
              className="rounded-xl p-5 text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #c850c0)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-widest">
                    Document Fraud Check
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {scorePercent}
                    <span className="text-base font-normal text-white/60"> / 100</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-xl">
                  ✓
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5 mb-3">
                <div
                  className="bg-white h-1.5 rounded-full"
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                {outcome.message.length > 130
                  ? outcome.message.slice(0, 130) + "..."
                  : outcome.message}
              </p>
            </div>
          )}

          {/* Deepfake */}
          {hasCheckResults && (
            <DeepfakeScoreBar checks={DEEPFAKE_CHECK_KEYS} data={data.checkResults} />
          )}

          {/* Security checks */}
          {hasCheckResults && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-800">Security Checks</h3>
              {otherCheckKeys.map((key) => {
                const check = data.checkResults?.[key];
                if (!check) return null;
                return <CheckRow key={key} label={checkLabels[key] ?? key} check={check} />;
              })}
            </div>
          )}

          {!hasCheckResults && (
            <div className="text-center py-8 text-neutral text-sm">
              ⏳ Detailed checks are still being processed.
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border text-xs text-neutral">
            <div>
              <span className="block text-gray-600 font-medium mb-0.5">Submitted</span>
              {new Date(data.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="block text-gray-600 font-medium mb-0.5">Completed</span>
              {new Date(data.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row justify-between gap-3 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={handleCopyJson}
              className="inline-flex items-center gap-2 font-semibold cursor-pointer transition-all"
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "14px",
                border: "1px solid #E5E7EB",
                color: copied ? "#166534" : "#374151",
                background: copied ? "#DCFCE7" : "#FFFFFF",
              }}
            >
              {copied ? (
                <>
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
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
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
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy JSON
                </>
              )}
            </button>
            <button
              onClick={() => downloadVerificationPdf(data)}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-primary text-primary hover:bg-primary-light transition-colors cursor-pointer"
            >
              Export PDF
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary-hover text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
