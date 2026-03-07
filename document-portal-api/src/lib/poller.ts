import { prisma } from "./prisma";
import { VerifyStatus, Prisma } from "@prisma/client";
import { fetchVerifyResult } from "./truuth";

const POLL_INTERVAL_MS = 5000; // 5 seconds
const TERMINAL_STATUSES = ["DONE", "FAIL"];

// ─── POLL A SINGLE SUBMISSION ─────────────────────────────────────────────────
export async function pollSubmission(submissionId: string) {
  const submission = await prisma.documentSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission || !submission.documentVerifyId) return;
  if (submission.verifyStatus !== VerifyStatus.PROCESSING) return;

  const interval = setInterval(async () => {
    try {
      // Refresh latest state from DB each tick
      const current = await prisma.documentSubmission.findUnique({
        where: { id: submissionId },
      });

      if (
        !current ||
        current.verifyStatus !== VerifyStatus.PROCESSING ||
        current.documentVerifyId !== submission.documentVerifyId
      ) {
        clearInterval(interval);
        return;
      }

      const result = await fetchVerifyResult(current.documentVerifyId!);
      const isTerminal = TERMINAL_STATUSES.includes(result.status);
      const isDone = result.status === "DONE";

      if (isTerminal) clearInterval(interval);

      await prisma.documentSubmission.update({
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

      if (isTerminal) {
        console.log(`Submission ${submissionId} completed with status: ${result.status}`);
      }

    } catch (err) {
      clearInterval(interval);
      await prisma.documentSubmission.update({
        where: { id: submissionId },
        data: {
          verifyStatus: VerifyStatus.FAILED,
          verifyError: err instanceof Error ? err.message : "Unknown polling error",
          lastPolledAt: new Date(),
        },
      });
    }
  }, POLL_INTERVAL_MS);
}

// ─── RESUME POLLING ON SERVER START ──────────────────────────────────────────
// Called once on startup — resumes any docs still in PROCESSING state
// e.g. after server restart or Vercel cold start
export async function resumePolling() {
  const pending = await prisma.documentSubmission.findMany({
    where: { verifyStatus: VerifyStatus.PROCESSING },
  });

  if (pending.length === 0) {
    console.log("No pending submissions to resume polling.");
    return;
  }

  console.log(`Resuming polling for ${pending.length} pending submission(s)...`);

  for (const submission of pending) {
    void pollSubmission(submission.id);
  }
}
