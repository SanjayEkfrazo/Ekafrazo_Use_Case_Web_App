const express = require("express");
const crypto = require("crypto");
const {
  getRequestRole,
  setAdminSessionCookie,
  clearAdminSessionCookie,
} = require("../middlewares/auth");

const router = express.Router();
const ADMIN_PASSCODE = String(process.env.ADMIN_PASSCODE || "").trim();
const UNLOCK_WINDOW_MS = 15 * 60 * 1000;
const UNLOCK_MAX_ATTEMPTS = 5;
const unlockAttemptsByIp = new Map();

if (!ADMIN_PASSCODE || ADMIN_PASSCODE === "change-me" || ADMIN_PASSCODE === "admin123") {
  throw new Error("ADMIN_PASSCODE must be set to a strong non-default value");
}

function getClientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.ip || "unknown";
}

function getAttemptWindow(ip) {
  const now = Date.now();
  const current = unlockAttemptsByIp.get(ip);

  if (!current || now > current.resetAt) {
    const next = { count: 0, resetAt: now + UNLOCK_WINDOW_MS };
    unlockAttemptsByIp.set(ip, next);
    return next;
  }

  return current;
}

function hashSecret(value) {
  return crypto.createHash("sha256").update(String(value)).digest();
}

function isPasscodeMatch(input, expected) {
  const inputHash = hashSecret(input);
  const expectedHash = hashSecret(expected);
  return crypto.timingSafeEqual(inputHash, expectedHash);
}

router.get("/me", (req, res) => {
  const role = getRequestRole(req);
  res.status(200).json({ data: { role } });
});

router.post("/unlock", (req, res) => {
  const passcode = String(req.body?.passcode || "");
  const ip = getClientIp(req);
  const attempts = getAttemptWindow(ip);

  if (!passcode) {
    return res.status(400).json({ message: "Passcode is required" });
  }

  if (attempts.count >= UNLOCK_MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((attempts.resetAt - Date.now()) / 1000));
    res.set("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({ message: "Too many unlock attempts. Try again later." });
  }

  if (!isPasscodeMatch(passcode.trim(), ADMIN_PASSCODE)) {
    attempts.count += 1;
    return res.status(401).json({ message: "Invalid admin passcode" });
  }

  unlockAttemptsByIp.delete(ip);
  setAdminSessionCookie(res);
  return res.status(200).json({ data: { role: "admin" }, message: "Admin mode unlocked" });
});

router.post("/logout", (req, res) => {
  clearAdminSessionCookie(res);
  res.status(200).json({ data: { role: "public" }, message: "Admin mode locked" });
});

module.exports = router;
