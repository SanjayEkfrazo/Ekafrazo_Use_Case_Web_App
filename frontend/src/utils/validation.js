// Client-side validation for the Use Case form
// Mirrors the backend rules so the user gets instant feedback

export function validateUseCaseForm(values) {
  const errors = {};

  const requiredFields = [
    ["title", "Title"],
    ["description", "Description"],
    ["domain", "Domain"],
    ["deployment_url", "Deployment URL"],
    ["resource_url", "Presentation or file URL"],
    ["client_name", "Client or company"],
    ["technology_stack", "Technology stack"],
  ];

  requiredFields.forEach(([field, label]) => {
    if (!values[field] || values[field].trim() === "") {
      errors[field] = `${label} is required`;
    }
  });

  if (values.title && values.title.length > 150) {
    errors.title = "Title must be under 150 characters";
  }

  if (values.deployment_url && !/^https?:\/\//i.test(values.deployment_url.trim())) {
    errors.deployment_url = "Deployment URL must start with http:// or https://";
  }

  if (values.resource_url && !/^https?:\/\//i.test(values.resource_url.trim())) {
    errors.resource_url = "Presentation or file URL must start with http:// or https://";
  }

  return errors;
}
