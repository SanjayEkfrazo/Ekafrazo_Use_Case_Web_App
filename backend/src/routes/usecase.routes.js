// Define API routes and connect them to controller functions

const express = require("express");
const router = express.Router();
const usecaseController = require("../controllers/usecase.controller");
const { requireAdmin } = require("../middlewares/auth");
const { uploadDomainImage } = require("../middlewares/upload");

// GET /api/usecases/summary -> dashboard summary
router.get("/summary", usecaseController.getDashboardSummary);

// GET /api/usecases -> list all use cases
router.get("/", usecaseController.getAllUseCases);

// GET /api/usecases/domains -> list available domain filters
router.get("/domains", usecaseController.getDomains);

// POST /api/usecases/upload-domain-image -> upload domain image and return URL
router.post("/upload-domain-image", requireAdmin, uploadDomainImage, usecaseController.uploadDomainImage);

// GET /api/usecases/:id -> get a single use case
router.get("/:id", usecaseController.getUseCase);

// POST /api/usecases -> create a new use case
router.post("/", requireAdmin, usecaseController.createUseCase);

// PUT /api/usecases/:id -> update an existing use case
router.put("/:id", requireAdmin, usecaseController.updateUseCase);

// DELETE /api/usecases/:id -> delete a use case
router.delete("/:id", requireAdmin, usecaseController.deleteUseCase);

module.exports = router;
