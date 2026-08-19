// Client-side validation for the Use Case form
// Mirrors the backend rules so the user gets instant feedback

export function validateUseCaseField(field, rawValue) {
  const value = typeof rawValue === "string" ? rawValue.trim() : rawValue;

  if (["title", "description", "domain", "deployment_url", "resource_url", "client_name", "technology_stack"].includes(field)) {
    if (!value) {
      const labels = {
        title: "Title",
        description: "Description",
        domain: "Domain",
        deployment_url: "Demo URL",
        resource_url: "Presentation or file URL",
        client_name: "Client or company",
        technology_stack: "Technology stack",
      };
      return `${labels[field]} is required`;
    }
  }

  if (field === "title" && value && value.length > 150) {
    return "Title must be under 150 characters";
  }

  if (field === "deployment_url" && value && !/^https?:\/\//i.test(value)) {
    return "Demo URL must start with http:// or https://";
  }

  if (field === "resource_url" && value && !/^https?:\/\//i.test(value)) {
    return "Presentation or file URL must start with http:// or https://";
  }

  return "";
}

export function validateUseCaseForm(values) {
  const errors = {};

  const requiredFields = [
    ["title", "Title"],
    ["description", "Description"],
    ["domain", "Domain"],
    ["deployment_url", "Demo URL"],
    ["resource_url", "Presentation or file URL"],
    ["client_name", "Client or company"],
    ["technology_stack", "Technology stack"],
  ];

  requiredFields.forEach(([field]) => {
    const fieldError = validateUseCaseField(field, values[field]);
    if (fieldError) {
      errors[field] = fieldError;
    }
  });

  return errors;
}

// Validate a custom domain value when Domain is set to "Other"
export function validateCustomDomain(value) {
  const domain = (value || "").trim();

  if (!domain) {
    return "Custom Domain is required";
  }

  if (domain.length < 2) {
    return "Custom Domain must be at least 2 characters";
  }

  if (domain.length > 50) {
    return "Custom Domain must be under 50 characters";
  }

  if (!/^[A-Za-z][A-Za-z0-9 &/+\-]*$/.test(domain)) {
    return "Custom Domain can contain letters, numbers, spaces, &, /, +, and - only";
  }

  return "";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function validateAccessGateFullDetails(values) {
  const errors = {};
  const fullName = String(values?.fullName || "").trim();
  const workEmail = String(values?.workEmail || "").trim();
  const organization = String(values?.organization || "").trim();
  const purpose = String(values?.purpose || "").trim();

  if (!fullName) {
    errors.fullName = "Full name is required";
  }

  if (!workEmail) {
    errors.workEmail = "Work email is required";
  } else if (!isValidEmail(workEmail)) {
    errors.workEmail = "Enter a valid email address";
  }

  if (!organization) {
    errors.organization = "Organization is required";
  }

  if (!purpose) {
    errors.purpose = "Purpose is required";
  }

  return errors;
}

export function validateAccessGateLoginDetails(values) {
  const errors = {};
  const fullName = String(values?.fullName || "").trim();
  const workEmail = String(values?.workEmail || "").trim();

  if (!fullName) {
    errors.fullName = "Full name is required";
  }

  if (!workEmail) {
    errors.workEmail = "Work email is required";
  } else if (!isValidEmail(workEmail)) {
    errors.workEmail = "Enter a valid email address";
  }

  return errors;
}
