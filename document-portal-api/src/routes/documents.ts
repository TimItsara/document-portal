import { Router } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma";
import { getUserIdFromRequest } from "../lib/auth";
import { DocumentTypeCode, ClassifierStatus, VerifyStatus, Prisma } from "@prisma/client";
import { classifyDocument, validateClassification, submitToVerify } from "../lib/truuth";
import { checkAndUpdateSubmission } from "../lib/poller";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const CLASSIFIER_ERROR_MISMATCH = "Document type mismatch";

function getDocumentDisplayName(documentTypeCode: string): string {
  const names: Record<string, string> = {
    // Australian Identity
    AU_PASSPORT: "Australian Passport",
    AU_DRIVER_LICENCE: "Australian Driver Licence",
    AU_MEDICARE_CARD: "Australian Medicare Card",
    AU_PROOF_OF_AGE: "Australian Proof of Age Card",
    AU_IMMI_CARD: "Australian ImmiCard",
    AU_CITIZENSHIP_CERT: "Australian Citizenship Certificate",
    AU_BIRTH_CERT: "Australian Birth Certificate",
    AU_CHANGE_OF_NAME: "Change of Name Certificate",
    AU_MARRIAGE_CERT: "Marriage Certificate",
    // Generic International
    PASSPORT: "Passport",
    DRIVERS_LICENCE: "Driver Licence",
    MEDICARE: "Medicare Card",
    PROOF_OF_AGE: "Proof of Age Card",
    // Financial / Employment
    RESUME: "Résumé",
    BANK_STATEMENT: "Bank Statement",
    TAX_RETURN: "Tax Return",
    PAY_SLIP: "Pay Slip",
    EMPLOYMENT_CONTRACT: "Employment Contract",
    // Address
    UTILITY_BILL: "Utility Bill",
    COUNCIL_RATES: "Council Rates Notice",
    // Photo / Facial
    PHOTO_ID: "Photo ID",
    SELFIE: "Selfie",
    // Visa
    VISA: "Visa",
    WORK_PERMIT: "Work Permit",
    // Other
    OTHER: "Document",
  };
  return names[documentTypeCode] ?? documentTypeCode;
}

// ─── GET /status ──────────────────────────────────────────────────────────────
router.get("/status", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  try {
    const types = await prisma.documentType.findMany();
    let subs = await prisma.documentSubmission.findMany({
      where: { userId },
    });

    // Polling-on-read: check Truuth live for any PROCESSING submissions
    subs = await Promise.all(
      subs.map(sub =>
        sub.verifyStatus === VerifyStatus.PROCESSING
          ? checkAndUpdateSubmission(sub.id).then(updated => updated ?? sub)
          : sub
      )
    );

    const byType = new Map(subs.map((s) => [s.documentType, s]));

    const cards = types.map((t) => {
      const s = byType.get(t.code);
      return {
        code: t.code,
        displayName: t.displayName,
        required: t?.code === DocumentTypeCode.RESUME || t?.code === DocumentTypeCode.AU_DRIVER_LICENCE || t?.code === DocumentTypeCode.AU_PASSPORT,
        requiresClassifier: t.requiresClassifier,
        verifyStatus: s?.verifyStatus ?? "NOT_SUBMITTED",
        classifierStatus: s?.classifierStatus ?? "SKIPPED",
        hasResult: !!s?.verifyResult && s?.verifyStatus === VerifyStatus.DONE,
        uploadedAt: s?.createdAt ?? null,
      };
    });

    const uploadedCount = cards.filter(
      (c) => c.verifyStatus !== "NOT_SUBMITTED"
    ).length;

    return res.json({ uploadedCount, totalRequired: 3, cards });
  } catch {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ─── GET /result/:code ────────────────────────────────────────────────────────
router.get("/result/:code", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { code } = req.params;
  if (!Object.values(DocumentTypeCode).includes(code as DocumentTypeCode)) {
    return res.status(400).json({ error: "Invalid document type" });
  }

  try {
    const sub = await prisma.documentSubmission.findUnique({
      where: {
        userId_documentType: {
          userId,
          documentType: code as DocumentTypeCode,
        },
      },
    });

    if (!sub) return res.status(404).json({ error: "Document submission not found" });
    return res.json({
      verifyStatus: sub.verifyStatus,
      verifyResult: sub.verifyResult,
    });
  } catch {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ─── POST /upload ─────────────────────────────────────────────────────────────
router.post("/upload", upload.single("file"), async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { documentType } = req.body;
  if (!documentType || !Object.values(DocumentTypeCode).includes(documentType)) {    
    return res.status(400).json({ error: "Invalid document type" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const requiresClassifier =
    documentType === DocumentTypeCode.AU_PASSPORT ||
    documentType === DocumentTypeCode.AU_DRIVER_LICENCE;

  const allowedMimes = requiresClassifier
    ? ["image/jpeg", "image/png"]
    : ["image/jpeg", "image/png", "application/pdf"];

  if (!allowedMimes.includes(req.file.mimetype)) {
    return res.status(400).json({
      error: requiresClassifier
        ? "Passport and Driver Licence must be JPEG or PNG images."
        : "Unsupported file type. Please upload JPEG, PNG, or PDF.",
    });
  }

  const base64Image = req.file.buffer.toString("base64");
  const mimeType = req.file.mimetype;

  try {
    // Step 1: Classify (skip for RESUME)
    let classifierStatus: ClassifierStatus = ClassifierStatus.SKIPPED;
    let classifierResponse = null;

    if (requiresClassifier) {
      let classifyResult: Awaited<ReturnType<typeof classifyDocument>>;
      try {
        classifyResult = await classifyDocument(base64Image, mimeType);
      } catch {
        return res.status(502).json({
          error: "Classification service unavailable. Please try again.",
        });
      }

      classifierResponse = classifyResult;
      const passed = validateClassification(classifyResult, documentType);

      if (!passed) {
        await prisma.documentSubmission.upsert({
          where: { userId_documentType: { userId, documentType } },
          update: {
            classifierStatus: ClassifierStatus.FAILED,
            classifierResponse,
            classifierError: CLASSIFIER_ERROR_MISMATCH,
            classifiedAt: new Date(),
            verifyStatus: VerifyStatus.NOT_SUBMITTED,
            documentVerifyId: null,
            verifyResult: Prisma.JsonNull,
            verifyError: null,
            verifySubmittedAt: null,
            pollCount: 0,
          },
          create: {
            userId,
            documentType,
            originalFilename: req.file.originalname,
            mimeType,
            classifierStatus: ClassifierStatus.FAILED,
            classifierResponse,
            classifierError: CLASSIFIER_ERROR_MISMATCH,
            classifiedAt: new Date(),
          },
        });

        return res.status(400).json({
          error: `This does not appear to be a valid ${getDocumentDisplayName(documentType)}. Please upload the correct document.`,
        });
      }

      classifierStatus = ClassifierStatus.PASSED;
    }

    // Step 2: Submit to Verify API
    let verifyResponse: { documentVerifyId: string; status: string };
    try {
      verifyResponse = await submitToVerify(base64Image, mimeType, documentType);
    } catch {
      return res.status(502).json({
        error: "Verification service unavailable. Please try again.",
      });
    }

    // Step 3: Upsert DB record
    const sharedFields = {
      originalFilename: req.file.originalname,
      mimeType,
      classifierStatus,
      classifierResponse: classifierResponse as Prisma.InputJsonValue,
      classifiedAt: requiresClassifier ? new Date() : null,
      documentVerifyId: verifyResponse.documentVerifyId,
      verifyStatus: VerifyStatus.PROCESSING,
      verifySubmittedAt: new Date(),
      lastPolledAt: null,
    };

    const submission = await prisma.documentSubmission.upsert({
      where: { userId_documentType: { userId, documentType } },
      update: {
        ...sharedFields,
        verifyResult: Prisma.JsonNull,
        verifyError: null,
        pollCount: 0,
      },
      create: {
        userId,
        documentType,
        ...sharedFields,
      },
    });

    return res.json({
      success: true,
      documentVerifyId: submission.documentVerifyId,
      verifyStatus: submission.verifyStatus,
    });

  } catch {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
