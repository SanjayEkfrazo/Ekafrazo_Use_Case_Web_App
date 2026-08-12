const express = require("express");
const router = express.Router();
const domainMediaController = require("../controllers/domainMedia.controller");
const { requireAdmin } = require("../middlewares/auth");
const { uploadDomainMediaImages, uploadSingleDomainMediaImage } = require("../middlewares/upload");

router.get("/", domainMediaController.getDomainMedia);
router.post("/upload", requireAdmin, uploadDomainMediaImages, domainMediaController.uploadDomainMedia);
router.put("/:id", requireAdmin, uploadSingleDomainMediaImage, domainMediaController.replaceDomainMedia);
router.delete("/:id", requireAdmin, domainMediaController.deleteDomainMedia);

module.exports = router;
