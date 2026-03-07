import { useState, useEffect, useCallback } from "react";
import api, { getDocumentsStatus } from "../api";
import type { CardData } from "../types";
import DocumentCard from "./DocumentCard";
import UploadModal from "./UploadModal";
import ResultModal from "./ResultModal";
import DownloadReportModal from "./DownloadReportModal";
import Footer from "./Footer";

const ADDITIONAL_DOC_LABELS: Record<string, string> = {
  AU_MEDICARE_CARD: "Medicare Card",
  AU_PROOF_OF_AGE: "Proof of Age Card",
  AU_IMMI_CARD: "ImmiCard",
  AU_CITIZENSHIP_CERT: "Citizenship Certificate",
  AU_BIRTH_CERT: "Birth Certificate",
  AU_CHANGE_OF_NAME: "Change of Name Certificate",
  AU_MARRIAGE_CERT: "Marriage Certificate",
  PASSPORT: "International Passport",
  DRIVERS_LICENCE: "Driver Licence",
  MEDICARE: "Medicare Card",
  PROOF_OF_AGE: "Proof of Age",
  BANK_STATEMENT: "Bank Statement",
  TAX_RETURN: "Tax Return",
  PAY_SLIP: "Pay Slip",
  EMPLOYMENT_CONTRACT: "Employment Contract",
  UTILITY_BILL: "Utility Bill",
  COUNCIL_RATES: "Council Rates Notice",
  PHOTO_ID: "Photo ID",
  SELFIE: "Selfie",
  VISA: "Visa",
  WORK_PERMIT: "Work Permit",
  OTHER: "Other Document",
};

export default function Dashboard({
  username,
  profilePhoto,
  onLogout,
}: {
  username: string;
  profilePhoto: string;
  onLogout: () => void;
}) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadCard, setUploadCard] = useState<CardData | null>(null);
  const [resultCard, setResultCard] = useState<CardData | null>(null);
  const [pendingAdditional, setPendingAdditional] = useState<CardData[]>([]);
  const [selectedDocType, setSelectedDocType] = useState("");

  // Download modal
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadDocs, setDownloadDocs] = useState<
    { code: string; displayName: string; result: any }[]
  >([]);
  const [fetchingResults, setFetchingResults] = useState(false);

  const fetchCards = useCallback(async () => {
    try {
      const res = await getDocumentsStatus();
      const docs: CardData[] = res.data.cards ?? [];
      setCards(docs);
      const uploadedCodes = new Set(
        docs
          .filter((d) => !d.required && d.verifyStatus !== "NOT_SUBMITTED")
          .map((d) => d.code),
      );
      setPendingAdditional((prev) => prev.filter((p) => !uploadedCodes.has(p.code)));
    } catch {
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const required = cards.filter((c) => c.required);
  const additional = cards.filter(
    (c) => !c.required && c.verifyStatus !== "NOT_SUBMITTED",
  );

  const uploadedCodes = new Set(additional.map((c) => c.code));
  const filteredPending = pendingAdditional.filter((p) => !uploadedCodes.has(p.code));
  const allAdditional = [...additional, ...filteredPending];

  const usedCodes = new Set([
    ...required.map((c) => c.code),
    ...additional.map((c) => c.code),
    ...pendingAdditional.map((c) => c.code),
  ]);
  const availableOptions = Object.entries(ADDITIONAL_DOC_LABELS).filter(
    ([code]) => !usedCodes.has(code),
  );

  const uploadedCount = required.filter(
    (c) => c.verifyStatus !== "NOT_SUBMITTED",
  ).length;
  const totalRequired = required.length;
  const progressPct = totalRequired ? (uploadedCount / totalRequired) * 100 : 0;

  // Cards with completed results (used by download modal)
  const cardsWithResults = [...required, ...additional].filter((c) => c.hasResult);

  const handleAddDocument = () => {
    if (!selectedDocType) return;
    const newCard: CardData = {
      code: selectedDocType,
      displayName: ADDITIONAL_DOC_LABELS[selectedDocType] ?? selectedDocType,
      required: false,
      requiresClassifier: false,
      verifyStatus: "NOT_SUBMITTED",
      classifierStatus: "SKIPPED",
      hasResult: false,
      uploadedAt: null,
      fileName: null,
    };
    setPendingAdditional((prev) => [...prev, newCard]);
    setSelectedDocType("");
  };

  const handleRemoveDocument = (code: string) => {
    setPendingAdditional((prev) => prev.filter((p) => p.code !== code));
  };

  const handleUpload = (card: CardData) => setUploadCard(card);

  const handleUploadSuccess = () => {
    setUploadCard(null);
    fetchCards();
  };

  // Fetch all results, then open the download modal
  const handleOpenDownloadModal = async () => {
    if (cardsWithResults.length === 0) return;
    setFetchingResults(true);
    try {
      const fetched = await Promise.allSettled(
        cardsWithResults.map((card) =>
          api
            .get(`/api/documents/result/${card.code}`)
            .then((res) => ({
              code: card.code,
              displayName: card.displayName,
              result: res.data.verifyResult ?? null,
            }))
            .catch(() => ({
              code: card.code,
              displayName: card.displayName,
              result: null,
            })),
        ),
      );
      const docs = fetched
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<any>).value);
      setDownloadDocs(docs);
      setShowDownloadModal(true);
    } finally {
      setFetchingResults(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── NAVBAR ── */}
      <nav
        className="bg-white sticky top-0 z-40"
        style={{ borderBottom: "1px solid #E5E7EB", height: "72px" }}
      >
        <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
          <img src="/truuth-tran-crop.png" alt="Truuth" className="h-8 object-contain" />
          <div className="flex items-center gap-3">
            {/* Download All Results button */}
            {cardsWithResults.length > 0 && (
              <button
                onClick={handleOpenDownloadModal}
                disabled={fetchingResults}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "#F3E2F8", color: "#8C07DD", border: "1px solid #E9D5FF" }}
              >
                {fetchingResults ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Loading...
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Results
                  </>
                )}
              </button>
            )}

            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold" style={{ color: "#111827" }}>
                {username}
              </span>
            </div>
            <div
              className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: "#8C07DD" }}
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt={username} className="w-full h-full object-cover" />
              ) : (
                (username?.[0]?.toUpperCase() ?? "U")
              )}
            </div>
            <button
              onClick={onLogout}
              className="hidden sm:block px-3 py-1.5 rounded-lg text-sm font-semibold cursor-pointer transition-all"
              style={{ border: "1px solid #E5E7EB", color: "#6B7280", background: "#FFFFFF" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#8C07DD";
                e.currentTarget.style.color = "#8C07DD";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.color = "#6B7280";
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-10">
        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
            style={{
              background: "#FEE2E2",
              color: "#DC2626",
              border: "1px solid rgba(220,38,38,0.2)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* ── Progress ── */}
        <div
          className="rounded-xl p-6"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            boxShadow: "0px 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-start justify-between mb-5">
            <div className="space-y-0.5">
              <h2
                className="font-bold"
                style={{ fontSize: "18px", lineHeight: "28px", color: "#111827" }}
              >
                Document Upload Progress
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "20px", color: "#6B7280" }}>
                Track your required document submissions
              </p>
            </div>
            <div className="text-right">
              <p
                className="font-bold"
                style={{ fontSize: "36px", lineHeight: "40px", color: "#8C07DD" }}
              >
                {uploadedCount}
              </p>
              <p style={{ fontSize: "13px", color: "#6B7280" }}>of {totalRequired} required</p>
            </div>
          </div>
          <div
            style={{ height: "10px", background: "#E5E7EB", borderRadius: "9999px" }}
            className="mb-3"
          >
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${progressPct}%`, background: "#8C07DD", borderRadius: "9999px" }}
            />
          </div>
          <p style={{ fontSize: "13px", color: "#6B7280" }}>
            {uploadedCount} of {totalRequired} required documents uploaded
          </p>
        </div>

        {/* ── Required Documents ── */}
        <section className="space-y-5">
          <div>
            <h2
              className="font-bold"
              style={{ fontSize: "22px", lineHeight: "32px", color: "#111827" }}
            >
              Required Documents
            </h2>
            <p style={{ fontSize: "14px", lineHeight: "24px", color: "#6B7280" }}>
              Please upload all required documents to complete your onboarding
            </p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl animate-pulse"
                  style={{ height: "96px", background: "#F9FAFB", border: "1px solid #E5E7EB" }}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {required.map((card) => (
                <DocumentCard
                  key={card.code}
                  card={card}
                  onUpload={() => handleUpload(card)}
                  onViewResult={() => setResultCard(card)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Additional Documents ── */}
        <section className="space-y-5">
          <div>
            <h2
              className="font-bold"
              style={{ fontSize: "22px", lineHeight: "32px", color: "#111827" }}
            >
              Additional Documents
            </h2>
            <p style={{ fontSize: "14px", lineHeight: "24px", color: "#6B7280" }}>
              If you have been asked to provide additional documents, you can upload them here.
            </p>
          </div>

          {allAdditional.length > 0 && (
            <div className="space-y-3">
              {allAdditional.map((card) => (
                <DocumentCard
                  key={card.code}
                  card={card}
                  onUpload={() => handleUpload(card)}
                  onViewResult={() => setResultCard(card)}
                  onRemove={
                    card.verifyStatus === "NOT_SUBMITTED"
                      ? () => handleRemoveDocument(card.code)
                      : undefined
                  }
                />
              ))}
            </div>
          )}

          {/* Select + Add row */}
          <div
            className="flex items-center gap-4"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "12px",
              padding: "16px 20px",
              boxShadow: "0px 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{ width: "44px", height: "44px", borderRadius: "8px", background: "#F3F4F6" }}
            >
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                <path
                  d="M10 1H4C2.9 1 2 1.9 2 3V17C2 18.1 2.9 19 4 19H13C14.1 19 15 18.1 15 17V6L10 1Z"
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 1V6H15"
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 10H11M5 13H9"
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="relative" style={{ width: "260px" }}>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full appearance-none cursor-pointer outline-none"
                style={{
                  padding: "10px 36px 10px 14px",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  color: selectedDocType ? "#111827" : "#9CA3AF",
                  background: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                <option value="" disabled>
                  Select document type
                </option>
                {availableOptions.map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "#9CA3AF" }}
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
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>

            <div className="flex-1" />

            <button
              onClick={handleAddDocument}
              disabled={!selectedDocType}
              className="inline-flex items-center gap-2 font-semibold text-white shrink-0 cursor-pointer disabled:cursor-not-allowed transition-all"
              style={{
                padding: "10px 24px",
                background: selectedDocType ? "#8C07DD" : "#D0D0DD",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1V11M1 6H11"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Add
            </button>
          </div>
        </section>

        {/* ── Confirm ── */}
        <div className="flex justify-end pb-10">
          <a
            href="https://github.com/TimItsara/document-portal"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white font-semibold cursor-pointer transition-opacity hover:opacity-90"
            style={{
              padding: "12px 32px",
              background: "#8C07DD",
              borderRadius: "8px",
              fontSize: "15px",
              textDecoration: "none",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Confirm
          </a>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <Footer />

      {/* ── MODALS ── */}
      {uploadCard && (
        <UploadModal
          card={uploadCard}
          onClose={() => setUploadCard(null)}
          onSuccess={handleUploadSuccess}
        />
      )}
      {resultCard && <ResultModal card={resultCard} onClose={() => setResultCard(null)} />}

      {/* Download Report Modal */}
      {showDownloadModal && (
        <DownloadReportModal documents={downloadDocs} onClose={() => setShowDownloadModal(false)} />
      )}
    </div>
  );
}
