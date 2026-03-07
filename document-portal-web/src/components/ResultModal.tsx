import { useState, useEffect } from "react";
import api from "../api";
import type { CardData } from "../types";
import DocumentVerifyResult from "./DocumentVerifyResult";
import { DocumentIcon, XIcon } from "./Icons";

// ── Reusable modal shell ──────────────────────────────────────────────────────
// Defined outside ResultModal so React never remounts children on re-render.

function ModalWrapper({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white overflow-hidden"
        style={{ boxShadow: "0px 20px 60px rgba(0,0,0,0.2)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #E5E7EB" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#F3E2F8" }}
            >
              <DocumentIcon size={14} color="#8C07DD" />
            </div>
            <h3 className="font-semibold" style={{ fontSize: "16px", color: "#111827" }}>
              {title}
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
            <XIcon />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ModalCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <div className="px-6 py-4 flex justify-end" style={{ borderTop: "1px solid #E5E7EB" }}>
      <button
        onClick={onClose}
        className="px-5 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90"
        style={{ background: "#8C07DD" }}
      >
        Close
      </button>
    </div>
  );
}

// ── ResultModal ───────────────────────────────────────────────────────────────

export default function ResultModal({ card, onClose }: { card: CardData; onClose: () => void }) {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/documents/result/${card.code}`)
      .then((res: any) => setResult(res.data.verifyResult))
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [card.code]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white">Loading result...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (!result || result.error) {
    return (
      <ModalWrapper title={`Result: ${card.displayName}`} onClose={onClose}>
        <div className="px-6 py-10 text-center space-y-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "#FEE2E2" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#DC2626"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p className="font-semibold" style={{ fontSize: "16px", color: "#111827" }}>
            Could not load result
          </p>
          <p style={{ fontSize: "14px", color: "#6B7280" }}>Please try again later.</p>
        </div>
        <ModalCloseButton onClose={onClose} />
      </ModalWrapper>
    );
  }

  // ── Processing ───────────────────────────────────────────────────────────
  if (result.status === "PROCESSING") {
    return (
      <ModalWrapper title={`Result: ${card.displayName}`} onClose={onClose}>
        <div className="px-6 py-10 text-center space-y-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "#FEF9C3" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#854D0E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <p className="font-semibold" style={{ fontSize: "16px", color: "#111827" }}>
            Verification in progress...
          </p>
          <p style={{ fontSize: "14px", color: "#6B7280" }}>
            This usually takes 1–2 minutes. Please check back shortly.
          </p>
        </div>
        <ModalCloseButton onClose={onClose} />
      </ModalWrapper>
    );
  }

  // ── Full result ──────────────────────────────────────────────────────────
  return <DocumentVerifyResult data={result} onClose={onClose} />;
}
