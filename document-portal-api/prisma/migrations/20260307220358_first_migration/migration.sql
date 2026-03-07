-- CreateEnum
CREATE TYPE "DocumentTypeCode" AS ENUM ('AU_PASSPORT', 'AU_DRIVER_LICENCE', 'AU_MEDICARE_CARD', 'AU_PROOF_OF_AGE', 'AU_IMMI_CARD', 'AU_CITIZENSHIP_CERT', 'AU_BIRTH_CERT', 'AU_CHANGE_OF_NAME', 'AU_MARRIAGE_CERT', 'PASSPORT', 'DRIVERS_LICENCE', 'MEDICARE', 'PROOF_OF_AGE', 'RESUME', 'BANK_STATEMENT', 'TAX_RETURN', 'PAY_SLIP', 'EMPLOYMENT_CONTRACT', 'UTILITY_BILL', 'COUNCIL_RATES', 'PHOTO_ID', 'SELFIE', 'VISA', 'WORK_PERMIT', 'OTHER');

-- CreateEnum
CREATE TYPE "ClassifierStatus" AS ENUM ('SKIPPED', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "VerifyStatus" AS ENUM ('NOT_SUBMITTED', 'PROCESSING', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentType" (
    "code" "DocumentTypeCode" NOT NULL,
    "displayName" TEXT NOT NULL,
    "requiresClassifier" BOOLEAN NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "DocumentSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentType" "DocumentTypeCode" NOT NULL,
    "originalFilename" TEXT,
    "mimeType" TEXT,
    "classifierStatus" "ClassifierStatus" NOT NULL DEFAULT 'SKIPPED',
    "classifierResponse" JSONB,
    "classifierError" TEXT,
    "classifiedAt" TIMESTAMP(3),
    "documentVerifyId" TEXT,
    "verifyStatus" "VerifyStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "verifySubmittedAt" TIMESTAMP(3),
    "lastPolledAt" TIMESTAMP(3),
    "pollCount" INTEGER NOT NULL DEFAULT 0,
    "verifyResult" JSONB,
    "verifyError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSubmission_documentVerifyId_key" ON "DocumentSubmission"("documentVerifyId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSubmission_userId_documentType_key" ON "DocumentSubmission"("userId", "documentType");

-- AddForeignKey
ALTER TABLE "DocumentSubmission" ADD CONSTRAINT "DocumentSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSubmission" ADD CONSTRAINT "DocumentSubmission_documentType_fkey" FOREIGN KEY ("documentType") REFERENCES "DocumentType"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
