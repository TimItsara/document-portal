import { PrismaClient, DocumentTypeCode } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {

  // ── Document Types ──────────────────────────────────────────────────────────
  const documentTypes: {
    code: DocumentTypeCode;
    displayName: string;
    requiresClassifier: boolean;
    required: boolean;
  }[] = [

    // ── Required (3 core docs) ──
    { code: DocumentTypeCode.AU_PASSPORT,         displayName: "Australian Passport",           requiresClassifier: true,  required: true  },
    { code: DocumentTypeCode.AU_DRIVER_LICENCE,   displayName: "Australian Driver Licence",     requiresClassifier: true,  required: true  },
    { code: DocumentTypeCode.RESUME,              displayName: "Résumé",                        requiresClassifier: false, required: true  },

    // ── Australian Identity ──
    { code: DocumentTypeCode.AU_MEDICARE_CARD,    displayName: "Medicare Card",                 requiresClassifier: false, required: false },
    { code: DocumentTypeCode.AU_PROOF_OF_AGE,     displayName: "Proof of Age Card",             requiresClassifier: false, required: false },
    { code: DocumentTypeCode.AU_IMMI_CARD,        displayName: "ImmiCard",                      requiresClassifier: false, required: false },
    { code: DocumentTypeCode.AU_CITIZENSHIP_CERT, displayName: "Citizenship Certificate",       requiresClassifier: false, required: false },
    { code: DocumentTypeCode.AU_BIRTH_CERT,       displayName: "Birth Certificate",             requiresClassifier: false, required: false },
    { code: DocumentTypeCode.AU_CHANGE_OF_NAME,   displayName: "Change of Name Certificate",   requiresClassifier: false, required: false },
    { code: DocumentTypeCode.AU_MARRIAGE_CERT,    displayName: "Marriage Certificate",          requiresClassifier: false, required: false },

    // ── Generic International ──
    { code: DocumentTypeCode.PASSPORT,            displayName: "International Passport",        requiresClassifier: true,  required: false },
    { code: DocumentTypeCode.DRIVERS_LICENCE,     displayName: "Driver Licence",                requiresClassifier: true,  required: false },
    { code: DocumentTypeCode.MEDICARE,            displayName: "Medicare Card",                 requiresClassifier: false, required: false },
    { code: DocumentTypeCode.PROOF_OF_AGE,        displayName: "Proof of Age",                  requiresClassifier: false, required: false },

    // ── Financial / Employment ──
    { code: DocumentTypeCode.BANK_STATEMENT,      displayName: "Bank Statement",                requiresClassifier: false, required: false },
    { code: DocumentTypeCode.TAX_RETURN,          displayName: "Tax Return",                    requiresClassifier: false, required: false },
    { code: DocumentTypeCode.PAY_SLIP,            displayName: "Pay Slip",                      requiresClassifier: false, required: false },
    { code: DocumentTypeCode.EMPLOYMENT_CONTRACT, displayName: "Employment Contract",           requiresClassifier: false, required: false },

    // ── Address Verification ──
    { code: DocumentTypeCode.UTILITY_BILL,        displayName: "Utility Bill",                  requiresClassifier: false, required: false },
    { code: DocumentTypeCode.COUNCIL_RATES,       displayName: "Council Rates Notice",          requiresClassifier: false, required: false },

    // ── Photo / Facial Identity ──
    { code: DocumentTypeCode.PHOTO_ID,            displayName: "Photo ID",                      requiresClassifier: false, required: false },
    { code: DocumentTypeCode.SELFIE,              displayName: "Selfie",                        requiresClassifier: false, required: false },

    // ── Visa / Immigration ──
    { code: DocumentTypeCode.VISA,                displayName: "Visa",                          requiresClassifier: false, required: false },
    { code: DocumentTypeCode.WORK_PERMIT,         displayName: "Work Permit",                   requiresClassifier: false, required: false },

    // ── Other ──
    { code: DocumentTypeCode.OTHER,               displayName: "Other Document",                requiresClassifier: false, required: false },
  ];

  for (const dt of documentTypes) {
    await prisma.documentType.upsert({
      where:  { code: dt.code },
      update: {
        displayName:        dt.displayName,
        requiresClassifier: dt.requiresClassifier,
        required:           dt.required,          // ✅ update required on re-seed
      },
      create: dt,
    });
  }

  console.log(`✅ Seeded ${documentTypes.length} document types`);

  // ── Demo User ───────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash("demo1234", 10);
  await prisma.user.upsert({
    where:  { username: "demo" },
    update: {},
    create: { username: "demo", passwordHash: hash },
  });

  console.log("✅ Seed complete — login: demo / demo1234");
}

main().finally(() => prisma.$disconnect());
