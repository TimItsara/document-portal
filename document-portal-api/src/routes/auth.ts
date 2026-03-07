import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken, getUserIdFromRequest } from "../lib/auth";

const router = Router();

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user.id);
    return res.json({ token, username: user.username });
  } catch {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, profilePhoto: true },
    });
    return res.json({ user });
  } catch {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { username, password, profilePhoto } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });
    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing)
      return res.status(409).json({ error: "Username already taken" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        profilePhoto: profilePhoto || null,
      },
    });
    const token = signToken(user.id);
    return res.status(201).json({ token, username: user.username });
  } catch {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
