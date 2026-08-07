// Controllers handle HTTP requests and responses
// They call the service layer to do the actual work

const usecaseService = require("../services/usecase.service");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Fetch all use cases (supports search, sort, pagination)
function getAllUseCases(req, res) {
  try {
    const { search, domain, sortBy, sortOrder, page, limit } = req.query;
    const result = usecaseService.getUseCases({ search, domain, sortBy, sortOrder, page, limit });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch use cases" });
  }
}

// Fetch distinct domains for filter dropdowns
function getDomains(req, res) {
  try {
    const domains = usecaseService.getDomains();
    res.status(200).json({ data: domains });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch domains" });
  }
}

// Fetch a single use case by id
function getUseCase(req, res) {
  try {
    const useCase = usecaseService.getUseCaseById(req.params.id);
    if (!useCase) {
      return res.status(404).json({ message: "Use case not found" });
    }
    res.status(200).json({ data: useCase });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch use case" });
  }
}

// Create a new use case
function createUseCase(req, res) {
  try {
    const result = usecaseService.createUseCase(req.body);
    if (result.errors) {
      return res.status(400).json({ message: "Validation failed", errors: result.errors });
    }
    res.status(201).json({ data: result.data, message: "Use case created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create use case" });
  }
}

// Update an existing use case
function updateUseCase(req, res) {
  try {
    const result = usecaseService.updateUseCase(req.params.id, req.body);
    if (result.notFound) {
      return res.status(404).json({ message: "Use case not found" });
    }
    if (result.errors) {
      return res.status(400).json({ message: "Validation failed", errors: result.errors });
    }
    res.status(200).json({ data: result.data, message: "Use case updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update use case" });
  }
}

// Delete a use case
function deleteUseCase(req, res) {
  try {
    const result = usecaseService.deleteUseCase(req.params.id);
    if (result.notFound) {
      return res.status(404).json({ message: "Use case not found" });
    }
    res.status(200).json({ message: "Use case deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete use case" });
  }
}

// Fetch dashboard summary data
function getDashboardSummary(req, res) {
  try {
    const summary = usecaseService.getDashboardSummary();
    res.status(200).json({ data: summary });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
}

// Upload a domain image and return a URL that can be saved on a use case
function uploadDomainImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Domain image is required" });
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

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/domain-images/${finalFileName}`;
    return res.status(201).json({ data: { url: imageUrl }, message: "Domain image uploaded successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to upload domain image" });
  }
}

module.exports = {
  getAllUseCases,
  getDomains,
  getUseCase,
  createUseCase,
  updateUseCase,
  deleteUseCase,
  getDashboardSummary,
  uploadDomainImage,
};
