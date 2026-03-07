// CardData matches /api/documents/status response shape
export interface CardData {
  code: string;
  displayName: string;
  required: boolean;
  requiresClassifier: boolean;
  verifyStatus: string;
  classifierStatus: string;
  hasResult: boolean;
  uploadedAt: string | null;
  fileName: string | null;
  description?: string;
}

// Status values as union types (no enums)
export type VerifyStatus = "NOT_SUBMITTED" | "PROCESSING" | "DONE" | "FAILED";
export type ClassifierStatus = "SKIPPED" | "PASSED" | "FAILED";
export type DocumentTypeCode = 
  | "AU_PASSPORT" | "AU_DRIVER_LICENCE" | "AU_MEDICARE_CARD" | "AU_PROOF_OF_AGE"
  | "AU_IMMI_CARD" | "AU_CITIZENSHIP_CERT" | "AU_BIRTH_CERT" | "AU_CHANGE_OF_NAME"
  | "AU_MARRIAGE_CERT" | "PASSPORT" | "DRIVERS_LICENCE" | "MEDICARE" 
  | "PROOF_OF_AGE" | "RESUME" | "BANK_STATEMENT" | "TAX_RETURN" 
  | "PAY_SLIP" | "EMPLOYMENT_CONTRACT" | "UTILITY_BILL" | "COUNCIL_RATES" 
  | "PHOTO_ID" | "SELFIE" | "VISA" | "WORK_PERMIT" | "OTHER";
