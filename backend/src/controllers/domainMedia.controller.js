const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const domainMediaService = require("../services/domainMedia.service");

function safeDeleteFromGalleryUrl(imageUrl) {
  const marker = "/uploads/domain-gallery/";
  const resolvedUrl = String(imageUrl || "").trim();
  const markerIndex = resolvedUrl.indexOf(marker);

  if (markerIndex < 0) {
    return;
  }

  const usage = domainMediaService.countImageUrlUsage(resolvedUrl);
  if (usage > 0) {
    return;
  }

  const fileName = path.basename(resolvedUrl.slice(markerIndex + marker.length).split("?")[0]);
  const filePath = path.join(__dirname, "..", "..", "uploads", "domain-gallery", fileName);
  if (fileName && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function getDomainMedia(req, res) {
  try {
    const { domain } = req.query;
    const domains = String(req.query.domains || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const data = domainMediaService.getDomainMedia({ domain, domains });
    res.status(200).json({ data });
  } catch (_error) {
    res.status(500).json({ message: "Failed to fetch domain media" });
  }
}

function uploadDomainMedia(req, res) {
  try {
    const domain = String(req.body.domain || "").trim();
    if (!domain) {
      return res.status(400).json({ message: "Domain is required" });
    }

    if (!Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const imageUrls = [];

    req.files.forEach((file) => {
      const tempFilePath = file.path;
      const extension = path.extname(file.filename || "").toLowerCase() || ".png";
      const fileBuffer = fs.readFileSync(tempFilePath);
      const contentHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
      const finalFileName = `${contentHash}${extension}`;
      const finalFilePath = path.join(path.dirname(tempFilePath), finalFileName);

      if (path.basename(tempFilePath) !== finalFileName) {
        if (fs.existsSync(finalFilePath)) {
          fs.unlinkSync(tempFilePath);
        } else {
          fs.renameSync(tempFilePath, finalFilePath);
        }
      }

      imageUrls.push(`${req.protocol}://${req.get("host")}/uploads/domain-gallery/${finalFileName}`);
    });

    const result = domainMediaService.addDomainMediaImages(domain, imageUrls);
    if (result.errors) {
      return res.status(400).json({ message: "Validation failed", errors: result.errors });
    }

    return res.status(201).json({ data: result.data, message: "Domain media uploaded successfully" });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to upload domain media" });
  }
}

function deleteDomainMedia(req, res) {
  try {
    const result = domainMediaService.deleteDomainMediaImage(req.params.id);
    if (result.notFound) {
      return res.status(404).json({ message: "Domain media image not found" });
    }

    safeDeleteFromGalleryUrl(result.data.image_url);

    return res.status(200).json({ message: "Domain media image deleted successfully" });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to delete domain media image" });
  }
}

function replaceDomainMedia(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const tempFilePath = req.file.path;
    const extension = path.extname(req.file.filename || "").toLowerCase() || ".png";
    const fileBuffer = fs.readFileSync(tempFilePath);
    const contentHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    const finalFileName = `${contentHash}${extension}`;
    const finalFilePath = path.join(path.dirname(tempFilePath), finalFileName);

    if (path.basename(tempFilePath) !== finalFileName) {
      if (fs.existsSync(finalFilePath)) {
        fs.unlinkSync(tempFilePath);
      } else {
        fs.renameSync(tempFilePath, finalFilePath);
      }
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/domain-gallery/${finalFileName}`;
    const result = domainMediaService.replaceDomainMediaImage(req.params.id, imageUrl);

    if (result.notFound) {
      return res.status(404).json({ message: "Domain media image not found" });
    }

    if (result.errors) {
      return res.status(400).json({ message: "Validation failed", errors: result.errors });
    }

    safeDeleteFromGalleryUrl(result.previousImageUrl);
    return res.status(200).json({ data: result.data, message: "Domain media image updated successfully" });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to replace domain media image" });
  }
}

module.exports = {
  getDomainMedia,
  uploadDomainMedia,
  deleteDomainMedia,
  replaceDomainMedia,
};
