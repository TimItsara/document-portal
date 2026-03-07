import type { CardData } from "../types";

type Props = {
  card: CardData;
  onUpload: () => void;
  onViewResult: () => void;
  onRemove?: () => void;
};

export default function DocumentCard({ card, onUpload, onViewResult, onRemove }: Props) {
  const isDone = card.verifyStatus === 'DONE';
  const isProcessing = card.verifyStatus === 'PROCESSING'; 
  const isFailed = card.verifyStatus === 'FAILED';  

  const badge = isDone
    ? { bg: "#DCFCE7", color: "#166534", dot: "#22C55E", label: "Uploaded" }
    : isProcessing
      ? { bg: "#FEF9C3", color: "#854D0E", dot: "#EAB308", label: "Processing" }
      : isFailed
        ? { bg: "#FEE2E2", color: "#DC2626", dot: "#EF4444", label: "Failed" }
        : { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF", label: "Not uploaded" };

  const iconBg = isDone ? "#F3E2F8" : "#F3F4F6";
  const iconColor = isDone ? "#8C07DD" : "#9CA3AF";
  const cardBorder = isDone
    ? "2px solid #8C07DD"
    : isFailed
      ? "1px solid #FCA5A5"
      : "1px solid #E5E7EB";

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div
      className="flex items-center justify-between"
      style={{
        background: "#FFFFFF",
        border: cardBorder,
        borderRadius: "12px",
        padding: "20px 24px",
        boxShadow: "0px 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      {/* Left: icon + info */}
      <div className="flex items-start gap-3 flex-1">
        {/* Doc icon */}
        <div
          className="flex items-center justify-center shrink-0 mt-0.5"
          style={{ width: "44px", height: "44px", borderRadius: "8px", background: iconBg }}
        >
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
            <path
              d="M10 1H4C2.9 1 2 1.9 2 3V17C2 18.1 2.9 19 4 19H13C14.1 19 15 18.1 15 17V6L10 1Z"
              stroke={iconColor}
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 1V6H15"
              stroke={iconColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M5 10H11M5 13H9" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Text */}
        <div className="space-y-1.5 flex-1">
          {/* Title */}
          <p
            className="font-semibold"
            style={{ fontSize: "16px", lineHeight: "24px", color: "#111827" }}
          >
            {card.displayName ?? card.code}
          </p>

          {/* Badge + filename */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 font-medium"
              style={{
                padding: "2px 10px",
                borderRadius: "9999px",
                background: badge.bg,
                color: badge.color,
                fontSize: "12px",
                lineHeight: "20px",
              }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: badge.dot }} />
              {badge.label}
            </span>

            {/* Filename next to badge when uploaded */}
            {isDone && card.fileName && (
              <span style={{ fontSize: "13px", color: "#6B7280" }}>{card.fileName}</span>
            )}
          </div>

          {/* Uploaded date OR description */}
          {isDone && card.uploadedAt ? (
            <p style={{ fontSize: "13px", lineHeight: "20px", color: "#6B7280" }}>
              Uploaded on {formatDate(card.uploadedAt)}
            </p>
          ) : !isDone && card.description ? (
            <p style={{ fontSize: "13px", lineHeight: "20px", color: "#6B7280" }}>
              {card.description}
            </p>
          ) : null}

          {/* Failed message */}
          {isFailed && (
            <p style={{ fontSize: "13px", lineHeight: "20px", color: "#DC2626" }}>
              Verification failed. Please upload again.
            </p>
          )}
        </div>
      </div>

      {/* Right: action button + remove */}
      <div className="pl-6 shrink-0 flex items-center gap-2">
          {/* View Result button */}
        {isDone && card.hasResult && (
          <button
            onClick={onViewResult}
            className="inline-flex items-center gap-2 font-semibold cursor-pointer transition-all"
            style={{
              padding: "10px 20px",
              background: "#FFFFFF",
              border: "1px solid #8C07DD",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#8C07DD",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F9F0FF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FFFFFF";
            }}
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
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            View Result
          </button>
        )}
        {isDone || isFailed ? (
          <button
            onClick={onUpload}
            className="inline-flex items-center gap-2 font-semibold text-white cursor-pointer transition-opacity hover:opacity-90"
            style={{
              padding: "10px 20px",
              background: "#8C07DD",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
            </svg>
            Upload again
          </button>
        ) : isProcessing ? (
          <div
            className="inline-flex items-center gap-2 font-semibold"
            style={{ padding: "10px 20px", color: "#854D0E", fontSize: "14px" }}
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
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Processing...
          </div>
        ) : (
          <button
            onClick={onUpload}
            className="inline-flex items-center gap-2 font-semibold text-white cursor-pointer transition-opacity hover:opacity-90"
            style={{
              padding: "10px 24px",
              background: "#8C07DD",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload
          </button>
        )}

          {/* Remove button */}
        {onRemove && (
          <button
            onClick={onRemove}
            title="Remove"
            className="flex items-center justify-center transition-all"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "#F3F4F6",
              border: "1px solid transparent",
              color: "#9CA3AF",
              cursor: "pointer",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FEE2E2";
              e.currentTarget.style.borderColor = "#FCA5A5";
              e.currentTarget.style.color = "#DC2626";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#F3F4F6";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.color = "#9CA3AF";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
