const express = require("express");
const {
  getRequestRole,
  setAdminSessionCookie,
  clearAdminSessionCookie,
} = require("../middlewares/auth");

const router = express.Router();
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "admin123";

router.get("/me", (req, res) => {
  const role = getRequestRole(req);
  res.status(200).json({ data: { role } });
});

router.post("/unlock", (req, res) => {
  const passcode = String(req.body?.passcode || "");

  if (!passcode) {
    return res.status(400).json({ message: "Passcode is required" });
  }

  if (passcode !== ADMIN_PASSCODE) {
    return res.status(401).json({ message: "Invalid admin passcode" });
  }

  setAdminSessionCookie(res);
  return res.status(200).json({ data: { role: "admin" }, message: "Admin mode unlocked" });
});

router.post("/logout", (req, res) => {
  clearAdminSessionCookie(res);
  res.status(200).json({ data: { role: "public" }, message: "Admin mode locked" });
});

module.exports = router;
