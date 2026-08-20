const accessDb = require("../database/access.database");
const { validateAccessSignup, validateAccessSignin } = require("../utils/validators");

function normalizeProfile(data) {
  return {
    full_name: String(data?.fullName || data?.full_name || "").trim(),
    work_email: String(data?.workEmail || data?.work_email || "").trim(),
    organization: String(data?.organization || "").trim(),
    purpose: String(data?.purpose || "").trim(),
    phone: String(data?.phone || "").trim(),
    department: String(data?.department || "").trim(),
    project_timeline: String(data?.projectTimeline || data?.project_timeline || "").trim(),
    notes: String(data?.notes || "").trim(),
  };
}

function signupAccessUser(payload) {
  const normalized = normalizeProfile(payload);
  const errors = validateAccessSignup(normalized);
  if (errors.length > 0) {
    return { errors };
  }

  const existing = accessDb.findUserByEmail(normalized.work_email);
  if (!existing) {
    const created = accessDb.createUser(normalized);
    return { data: created, created: true };
  }

  const updated = accessDb.updateUserById(existing.id, {
    ...normalized,
    work_email: existing.work_email,
  });

  return { data: updated, created: false };
}

function signinAccessUser(payload) {
  const normalized = normalizeProfile(payload);
  const errors = validateAccessSignin(normalized);
  if (errors.length > 0) {
    return { errors };
  }

  const user = accessDb.findUserByEmail(normalized.work_email);
  if (!user) {
    return { unauthorized: true, message: "User is not registered. Please sign up first." };
  }

  const expectedName = String(user.full_name || "").trim().toLowerCase();
  const providedName = normalized.full_name.toLowerCase();
  if (expectedName && providedName !== expectedName) {
    return { unauthorized: true, message: "Name does not match registered profile." };
  }

  const updatedUser = accessDb.touchLastSignedIn(user.id);
  accessDb.createSigninLog(updatedUser.id, normalized.full_name, normalized.work_email);

  return { data: updatedUser };
}

function identifyAccessUser(payload) {
  const workEmail = String(payload?.workEmail || payload?.work_email || "").trim();
  const emailErrors = validateAccessSignin({ full_name: "placeholder", work_email: workEmail })
    .filter((error) => !error.includes("full name"));

  if (emailErrors.length > 0) {
    return { errors: emailErrors };
  }

  const user = accessDb.findUserByEmail(workEmail);
  if (!user) {
    return { data: { exists: false } };
  }

  return {
    data: {
      exists: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        work_email: user.work_email,
      },
    },
  };
}

function getAccessUserById(id) {
  const accessUserId = Number(id);
  if (!Number.isFinite(accessUserId) || accessUserId <= 0) {
    return null;
  }
  return accessDb.findUserById(accessUserId);
}

function getAccessUsers({ limit } = {}) {
  return accessDb.findUsers({ limit });
}

function getAccessSigninLogs({ limit } = {}) {
  return accessDb.findSigninLogs({ limit });
}

function updateAccessUser(id, payload) {
  const accessUserId = Number(id);
  if (!Number.isFinite(accessUserId) || accessUserId <= 0) {
    return { errors: ["invalid user id"] };
  }

  const existing = accessDb.findUserById(accessUserId);
  if (!existing) {
    return { notFound: true };
  }

  const normalized = normalizeProfile(payload);
  const errors = validateAccessSignup(normalized);
  if (errors.length > 0) {
    return { errors };
  }

  const duplicate = accessDb.findUserByEmail(normalized.work_email);
  if (duplicate && Number(duplicate.id) !== accessUserId) {
    return { conflict: true, message: "Work email already exists for another user." };
  }

  const updated = accessDb.updateUserById(accessUserId, normalized);
  if (!updated) {
    return { notFound: true };
  }

  return { data: updated };
}

function deleteAccessUser(id) {
  const accessUserId = Number(id);
  if (!Number.isFinite(accessUserId) || accessUserId <= 0) {
    return { errors: ["invalid user id"] };
  }

  const deleted = accessDb.deleteUserById(accessUserId);
  if (!deleted) {
    return { notFound: true };
  }

  return { deleted: true };
}

module.exports = {
  signupAccessUser,
  signinAccessUser,
  identifyAccessUser,
  getAccessUserById,
  getAccessUsers,
  getAccessSigninLogs,
  updateAccessUser,
  deleteAccessUser,
};
