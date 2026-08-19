// Validation helper for use case input coming from the client
// Returns a list of error messages, empty array means valid

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

  return errors;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function validateAccessSignup(data) {
  const errors = [];
  const fullName = String(data?.full_name || "").trim();
  const workEmail = String(data?.work_email || "").trim();
  const organization = String(data?.organization || "").trim();
  const purpose = String(data?.purpose || "").trim();

  if (!fullName) {
    errors.push("full name is required");
  }

  if (!workEmail) {
    errors.push("work email is required");
  } else if (!isValidEmail(workEmail)) {
    errors.push("work email must be valid");
  }

  if (!organization) {
    errors.push("organization is required");
  }

  if (!purpose) {
    errors.push("purpose is required");
  }

  return errors;
}

function validateAccessSignin(data) {
  const errors = [];
  const fullName = String(data?.full_name || "").trim();
  const workEmail = String(data?.work_email || "").trim();

  if (!fullName) {
    errors.push("full name is required");
  }

  if (!workEmail) {
    errors.push("work email is required");
  } else if (!isValidEmail(workEmail)) {
    errors.push("work email must be valid");
  }

  return errors;
}

module.exports = {
  validateUseCase,
  validateAccessSignup,
  validateAccessSignin,
};
