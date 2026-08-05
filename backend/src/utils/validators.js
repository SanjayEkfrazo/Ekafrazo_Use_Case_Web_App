// Validation helper for use case input coming from the client
// Returns a list of error messages, empty array means valid

const { STATUS_OPTIONS, PRIORITY_OPTIONS } = require("../models/usecase.model");

function validateUseCase(data) {
  const errors = [];

  // Check required text fields are present and not empty
  const requiredFields = [
    "title",
    "description",
    "domain",
    "deployment_url",
    "resource_url",
    "client_name",
    "technology_stack",
  ];

  requiredFields.forEach((field) => {
    if (!data[field] || String(data[field]).trim() === "") {
      errors.push(`${field.replace(/_/g, " ")} is required`);
    }
  });

  // Check title length stays within a reasonable limit
  if (data.title && data.title.length > 150) {
    errors.push("title must be under 150 characters");
  }

  if (data.deployment_url && !/^https?:\/\//i.test(String(data.deployment_url).trim())) {
    errors.push("deployment url must start with http:// or https://");
  }

  if (data.resource_url && !/^https?:\/\//i.test(String(data.resource_url).trim())) {
    errors.push("resource url must start with http:// or https://");
  }

  // Check status is one of the allowed options
  if (data.status && !STATUS_OPTIONS.includes(data.status)) {
    errors.push(`status must be one of: ${STATUS_OPTIONS.join(", ")}`);
  }

  // Check priority is one of the allowed options
  if (data.priority && !PRIORITY_OPTIONS.includes(data.priority)) {
    errors.push(`priority must be one of: ${PRIORITY_OPTIONS.join(", ")}`);
  }

  return errors;
}

module.exports = { validateUseCase };
