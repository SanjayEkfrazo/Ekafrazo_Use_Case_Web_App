const crypto = require("crypto");

const COOKIE_NAME = "uc_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const SESSION_SECRET = String(process.env.ADMIN_SESSION_SECRET || "").trim();

if (!SESSION_SECRET || SESSION_SECRET === "change-me-to-a-long-random-secret") {
  throw new Error("ADMIN_SESSION_SECRET must be set to a strong value");
}

function base64urlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64urlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
}

function createSessionToken(role) {
  const payload = JSON.stringify({
    role,
    exp: Date.now() + SESSION_TTL_MS,
  });
  const encoded = base64urlEncode(payload);
  const signature = signPayload(encoded);
  return `${encoded}.${signature}`;
}

function parseCookies(req) {
  const raw = req.headers.cookie || "";
  return raw
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const eqIndex = part.indexOf("=");
      if (eqIndex === -1) return acc;
      const key = decodeURIComponent(part.slice(0, eqIndex));
      const value = decodeURIComponent(part.slice(eqIndex + 1));
      acc[key] = value;
      return acc;
    }, {});
}

function verifySessionToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encoded);
  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedSignatureBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length
    || !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64urlDecode(encoded));
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

function getRequestRole(req) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  const payload = verifySessionToken(token);
  return payload?.role || "public";
}

function requireAdmin(req, res, next) {
  const role = getRequestRole(req);
  if (role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  return next();
}

function setAdminSessionCookie(res) {
  const token = createSessionToken("admin");
  const secure = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

function clearAdminSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production";
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });
}

module.exports = {
  getRequestRole,
  requireAdmin,
  setAdminSessionCookie,
  clearAdminSessionCookie,
};
