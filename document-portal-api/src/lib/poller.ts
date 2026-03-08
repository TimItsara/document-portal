import { prisma } from "./prisma";
import { VerifyStatus, Prisma } from "@prisma/client";
import { fetchVerifyResult } from "./truuth";

const TERMINAL_STATUSES = ["DONE", "FAIL"];

export async function checkAndUpdateSubmission(submissionId: string) {
  const submission = await prisma.documentSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission || !submission.documentVerifyId) return submission;
  if (submission.verifyStatus !== VerifyStatus.PROCESSING) return submission;

  const result = await fetchVerifyResult(submission.documentVerifyId);
  const isTerminal = TERMINAL_STATUSES.includes(result.status);
  const isDone = result.status === "DONE";

  return await prisma.documentSubmission.update({
    where: { id: submissionId },
    data: {
      lastPolledAt: new Date(),
      pollCount: { increment: 1 },
      ...(isTerminal && {
        verifyStatus: isDone ? VerifyStatus.DONE : VerifyStatus.FAILED,
        verifyResult: result as Prisma.InputJsonValue,
        verifyError: isDone ? null : "Truuth verification returned FAIL",
      }),
    },
  });
}
