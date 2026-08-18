const express = require("express");
const router = express.Router();
const browseDomainMediaController = require("../controllers/browseDomainMedia.controller");
const { requireAdmin } = require("../middlewares/auth");
const { uploadBrowseDomainMediaImages, uploadSingleBrowseDomainMediaImage } = require("../middlewares/upload");

router.get("/", browseDomainMediaController.getBrowseDomainMedia);
router.post("/upload", requireAdmin, uploadBrowseDomainMediaImages, browseDomainMediaController.uploadBrowseDomainMedia);
router.put("/:id", requireAdmin, uploadSingleBrowseDomainMediaImage, browseDomainMediaController.replaceBrowseDomainMedia);
router.delete("/:id", requireAdmin, browseDomainMediaController.deleteBrowseDomainMedia);

module.exports = router;
