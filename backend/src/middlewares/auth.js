const crypto = require("crypto");

const COOKIE_NAME = "uc_admin_session";
const ACCESS_COOKIE_NAME = "uc_access_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const SESSION_SECRET = String(process.env.ADMIN_SESSION_SECRET || "").trim();
const ACCESS_SESSION_SECRET = String(process.env.ACCESS_SESSION_SECRET || SESSION_SECRET).trim();

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

function signPayloadWithSecret(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
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

function createAccessSessionToken(accessUserId) {
  const payload = JSON.stringify({
    accessUserId: Number(accessUserId),
    iat: Date.now(),
  });
  const encoded = base64urlEncode(payload);
  const signature = signPayloadWithSecret(encoded, ACCESS_SESSION_SECRET);
  return `${encoded}.${signature}`;
}

function verifyAccessSessionToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature = signPayloadWithSecret(encoded, ACCESS_SESSION_SECRET);
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
    const accessUserId = Number(payload?.accessUserId);
    if (!Number.isFinite(accessUserId) || accessUserId <= 0) {
      return null;
    }
    return { accessUserId };
  } catch (_error) {
    return null;
  }
}

function getRequestRole(req) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  const payload = verifySessionToken(token);
  return payload?.role || "public";
}

function getAccessSession(req) {
  const cookies = parseCookies(req);
  const token = cookies[ACCESS_COOKIE_NAME];
  return verifyAccessSessionToken(token);
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

function setAccessSessionCookie(res, accessUserId) {
  const token = createAccessSessionToken(accessUserId);
  const secure = process.env.NODE_ENV === "production";
  // Session cookie: survives tab changes and expires when the browser session ends.
  res.cookie(ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
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

function clearAccessSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production";
  res.clearCookie(ACCESS_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });
}

module.exports = {
  getRequestRole,
  getAccessSession,
  requireAdmin,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  setAccessSessionCookie,
  clearAccessSessionCookie,
};
