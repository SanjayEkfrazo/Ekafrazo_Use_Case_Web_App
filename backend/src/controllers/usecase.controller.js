// Controllers handle HTTP requests and responses
// They call the service layer to do the actual work

const usecaseService = require("../services/usecase.service");

// Fetch all use cases (supports search, sort, pagination)
function getAllUseCases(req, res) {
  try {
    const { search, sortBy, sortOrder, page, limit } = req.query;
    const result = usecaseService.getUseCases({ search, sortBy, sortOrder, page, limit });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch use cases" });
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

module.exports = {
  getAllUseCases,
  getUseCase,
  createUseCase,
  updateUseCase,
  deleteUseCase,
  getDashboardSummary,
};
