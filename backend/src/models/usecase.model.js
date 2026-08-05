// This file describes the shape of a Use Case
// It is used by the service layer to know which fields are allowed

// The list of fields a client is allowed to send
const USE_CASE_FIELDS = [
  "title",
  "description",
  "domain",
  "deployment_url",
  "resource_url",
  "client_name",
  "category",
  "business_problem",
  "proposed_solution",
  "technology_stack",
  "status",
  "priority",
];

// Allowed values for status and priority
const STATUS_OPTIONS = ["Draft", "In Review", "Approved", "In Progress", "Completed", "On Hold"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];

module.exports = {
  USE_CASE_FIELDS,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
};
