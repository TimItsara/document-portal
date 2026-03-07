const API_KEY = process.env.TRUUTH_API_KEY!;
const API_SECRET = process.env.TRUUTH_API_SECRET!;

if (!API_KEY || !API_SECRET) {
  throw new Error("Missing TRUUTH_API_KEY or TRUUTH_API_SECRET env vars");
}

const basicAuth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");

const CLASSIFY_URL = "https://api.au.truuth.id/document-management/v1/classify";
const SUBMIT_URL = "https://submissions.api.au.truuth.id/verify-document/v1/tenants/truuthhiring/documents/submit";
const GET_RESULT_URL = (id: string) =>
  `https://submissions.api.au.truuth.id/verify-document/v1/tenants/truuthhiring/documents/${id}`;

const DOC_TYPE_MAP: Record<string, string> = {
  AU_PASSPORT: "PASSPORT",
  AU_DRIVER_LICENCE: "DRIVERS_LICENCE",
  AU_MEDICARE_CARD: "MEDICARE",
  AU_PROOF_OF_AGE: "PROOF_OF_AGE",
  AU_IMMI_CARD: "IMMI_CARD",
  AU_CITIZENSHIP_CERT: "CITIZENSHIP_CERT",
  AU_BIRTH_CERT: "BIRTH_CERT",
  AU_CHANGE_OF_NAME: "CHANGE_OF_NAME",
  AU_MARRIAGE_CERT: "MARRIAGE_CERT",
  PASSPORT: "PASSPORT",
  DRIVERS_LICENCE: "DRIVERS_LICENCE",
  MEDICARE: "MEDICARE",
  PROOF_OF_AGE: "PROOF_OF_AGE",
  RESUME: "RESUME",
  BANK_STATEMENT: "BANK_STATEMENT",
  TAX_RETURN: "TAX_RETURN",
  PAY_SLIP: "PAY_SLIP",
  EMPLOYMENT_CONTRACT: "EMPLOYMENT_CONTRACT",
  UTILITY_BILL: "UTILITY_BILL",
  COUNCIL_RATES: "COUNCIL_RATES",
  PHOTO_ID: "PHOTO_ID",
  SELFIE: "SELFIE",
  VISA: "VISA",
  WORK_PERMIT: "WORK_PERMIT",
  OTHER: "OTHER",
};

// ─── CLASSIFY ───────────────────────────────────────────────────────────────
export async function classifyDocument(base64Image: string, mimeType: string) {
  if (!["image/jpeg", "image/png"].includes(mimeType)) {
    throw new Error("Classifier only supports JPEG or PNG images.");
  }

  const res = await fetch(CLASSIFY_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      images: [{ image: base64Image, mimeType }],
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Classification failed (${res.status}): ${error}`);
  }

  return res.json() as Promise<{
    country: { code: string; name: string };
    documentType: { code: string; name: string };
  }>;
}

// ─── VALIDATE CLASSIFICATION RESULT ─────────────────────────────────────────
export function validateClassification(
  result: { country: { code: string }; documentType: { code: string } },
  documentTypeCode: string
): boolean {
  return (
    result.country.code === "AUS" &&
    result.documentType.code === DOC_TYPE_MAP[documentTypeCode]
  );
}

// ─── SUBMIT TO VERIFY ────────────────────────────────────────────────────────
export async function submitToVerify(
  base64Image: string,
  mimeType: string,
  documentTypeCode: string
) {
  const res = await fetch(SUBMIT_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      document: {
        countryCode: "AUS",
        documentType: DOC_TYPE_MAP[documentTypeCode],
        image: { content: base64Image, mimeType },
      },
      externalRefId: `truuth-portal-${documentTypeCode}-${Date.now()}`,
      options: {
        requiredChecks: [
          { name: "ANNOTATION" },
          { name: "C2PA" },
          { name: "COMPRESSION_HEATMAP" },
          { name: "DEEPFAKE" },
          { name: "DEEPFAKE_2" },
          { name: "DEEPFAKE_3" },
          { name: "DEEPFAKE_4" },
          { name: "DEEPFAKE_5" },
          { name: "DEEPFAKE_6" },
          { name: "DEEPFAKE_7" },
          { name: "EOF_COUNT" },
          { name: "HANDWRITING" },
          { name: "SCREENSHOT" },
          { name: "SOFTWARE_EDITOR" },
          { name: "SOFTWARE_FINGERPRINT" },
          { name: "TIMESTAMP" },
          { name: "VISUAL_ANOMALY" },
          { name: "WATERMARK_CHECK" },
        ],
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Verify submission failed (${res.status}): ${error}`);
  }

  return res.json() as Promise<{ documentVerifyId: string; status: string }>;
}

// ─── FETCH VERIFY RESULT ──────────────────────────────────────────────────────
export async function fetchVerifyResult(documentVerifyId: string) {
  const res = await fetch(GET_RESULT_URL(documentVerifyId), {
    method: "GET",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error(`Poll failed (${res.status})`);
  return res.json() as Promise<{ status: string; [key: string]: unknown }>;
}
