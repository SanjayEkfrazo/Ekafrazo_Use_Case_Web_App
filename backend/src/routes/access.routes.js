const express = require("express");
const router = express.Router();
const accessController = require("../controllers/access.controller");
const { requireAdmin } = require("../middlewares/auth");

router.post("/signup", accessController.signup);
router.post("/signin", accessController.signin);
router.post("/identify", accessController.identify);
router.get("/session", accessController.getSession);
router.get("/users", requireAdmin, accessController.getAccessUsers);
router.get("/signin-logs", requireAdmin, accessController.getAccessSigninLogs);
router.patch("/users/:id", requireAdmin, accessController.updateAccessUser);
router.delete("/users/:id", requireAdmin, accessController.deleteAccessUser);

module.exports = router;
