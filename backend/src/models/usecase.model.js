// This file describes the shape of a Use Case
// It is used by the service layer to know which fields are allowed

// The list of fields a client is allowed to send
const USE_CASE_FIELDS = [
  "title",
  "description",
  "domain",
  "domain_image_url",
  "deployment_url",
  "resource_url",
  "client_name",
  "category",
  "business_problem",
  "proposed_solution",
  "technology_stack",
];

module.exports = {
  USE_CASE_FIELDS,
};
