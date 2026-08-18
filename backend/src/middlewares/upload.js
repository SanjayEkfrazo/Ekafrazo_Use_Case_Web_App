const fs = require("fs");
const path = require("path");
const multer = require("multer");

const domainGalleryUploadDir = path.join(__dirname, "..", "..", "uploads", "domain-gallery");
const browseDomainGalleryUploadDir = path.join(__dirname, "..", "..", "uploads", "domain-browse-gallery");
fs.mkdirSync(domainGalleryUploadDir, { recursive: true });
fs.mkdirSync(browseDomainGalleryUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, domainGalleryUploadDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeExtension = [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(extension) ? extension : ".png";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`);
  },
});

function imageFileFilter(_req, file, cb) {
  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed"));
    return;
  }
  cb(null, true);
}

const uploadDomainImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("domain_image");

const domainGalleryStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, domainGalleryUploadDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeExtension = [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(extension) ? extension : ".png";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`);
  },
});

const uploadDomainMediaImages = multer({
  storage: domainGalleryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 25,
  },
}).array("images", 25);

const uploadSingleDomainMediaImage = multer({
  storage: domainGalleryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("image");

const browseDomainGalleryStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, browseDomainGalleryUploadDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeExtension = [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(extension) ? extension : ".png";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`);
  },
});

const uploadBrowseDomainMediaImages = multer({
  storage: browseDomainGalleryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
}).array("images", 1);

const uploadSingleBrowseDomainMediaImage = multer({
  storage: browseDomainGalleryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("image");

module.exports = {
  uploadDomainImage,
  uploadDomainMediaImages,
  uploadSingleDomainMediaImage,
  uploadBrowseDomainMediaImages,
  uploadSingleBrowseDomainMediaImage,
};
