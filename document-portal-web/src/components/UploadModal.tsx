import { useState, useRef } from "react";
import { uploadDocument } from "../api";
import type { CardData } from "../types";

export default function UploadModal({
  card,
  onClose,
  onSuccess,
}: {
  card: CardData;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      await uploadDocument(card.code, file);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white overflow-hidden"
        style={{ boxShadow: "0px 20px 60px rgba(0,0,0,0.2)" }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #E5E7EB" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#F3E2F8" }}
            >
              <svg width="14" height="18" viewBox="0 0 16 20" fill="none">
                <path
                  d="M10 1H4C2.9 1 2 1.9 2 3V17C2 18.1 2.9 19 4 19H13C14.1 19 15 18.1 15 17V6L10 1Z"
                  stroke="#8C07DD"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 1V6H15"
                  stroke="#8C07DD"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="font-semibold" style={{ fontSize: "16px", color: "#111827" }}>
              Upload: {card.displayName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
            style={{ color: "#6B7280" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F3F4F6";
              e.currentTarget.style.color = "#111827";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#6B7280";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-4">
          {/* Info text */}
          <p style={{ fontSize: "14px", lineHeight: "20px", color: "#6B7280" }}>
            {card.requiresClassifier
              ? "This document will be classified and verified automatically."
              : "This document will be stored securely for review."}
          </p>

          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer transition-all"
            style={{
              border: `2px dashed ${file ? "#8C07DD" : "#D0D0DD"}`,
              borderRadius: "12px",
              padding: "32px 24px",
              textAlign: "center",
              background: file ? "#FAF5FF" : "#FAFAFA",
            }}
            onMouseEnter={(e) => {
              if (!file) {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#8C07DD";
                (e.currentTarget as HTMLDivElement).style.background = "#FAF5FF";
              }
            }}
            onMouseLeave={(e) => {
              if (!file) {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#D0D0DD";
                (e.currentTarget as HTMLDivElement).style.background = "#FAFAFA";
              }
            }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: file ? "#F3E2F8" : "#F3F4F6" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={file ? "#8C07DD" : "#9CA3AF"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
            </div>

            <p
              className="font-medium"
              style={{ fontSize: "14px", color: file ? "#8C07DD" : "#374151" }}
            >
              {file ? file.name : "Click to choose a file"}
            </p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>
              {card.requiresClassifier
                ? "JPG or PNG only (max 10MB)"
                : "JPG, PNG or PDF (max 10MB)"}
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={card.requiresClassifier ? ".jpg,.jpeg,.png" : ".jpg,.jpeg,.png,.pdf"}
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setError("");
            }}
          />

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm"
              style={{
                background: "#FEE2E2",
                color: "#DC2626",
                border: "1px solid rgba(220,38,38,0.2)",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="px-6 py-4 flex justify-end gap-3"
          style={{ borderTop: "1px solid #E5E7EB" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all"
            style={{ border: "1px solid #E5E7EB", color: "#6B7280", background: "#FFFFFF" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#D0D0DD";
              e.currentTarget.style.background = "#F9FAFB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.background = "#FFFFFF";
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed transition-opacity"
            style={{
              background: !file || loading ? "#D0D0DD" : "#8C07DD",
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  className="animate-spin"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Uploading...
              </span>
            ) : (
              "Upload"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
