import jwt from "jsonwebtoken";
import type { Request } from "express";

const SECRET = process.env.AUTH_SECRET;
if (!SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing AUTH_SECRET env var");
  }
  console.warn("AUTH_SECRET is not set — using insecure fallback. Do not use in production.");
}
const secret = SECRET ?? "fallback-secret";

export function signToken(userId: string) {
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, secret) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return verifyToken(auth.split(" ")[1]);
}
