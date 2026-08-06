// Define API routes and connect them to controller functions

const express = require("express");
const router = express.Router();
const usecaseController = require("../controllers/usecase.controller");
const { requireAdmin } = require("../middlewares/auth");

// GET /api/usecases/summary -> dashboard summary
router.get("/summary", usecaseController.getDashboardSummary);

// GET /api/usecases -> list all use cases
router.get("/", usecaseController.getAllUseCases);

// GET /api/usecases/:id -> get a single use case
router.get("/:id", usecaseController.getUseCase);

// POST /api/usecases -> create a new use case
router.post("/", requireAdmin, usecaseController.createUseCase);

// PUT /api/usecases/:id -> update an existing use case
router.put("/:id", requireAdmin, usecaseController.updateUseCase);

// DELETE /api/usecases/:id -> delete a use case
router.delete("/:id", requireAdmin, usecaseController.deleteUseCase);

module.exports = router;
