// Shared constant values used across the frontend

// Options shown in the Status dropdown, each with a badge color
export const STATUS_OPTIONS = [
  { value: "Draft", color: "bg-surface-elevated text-muted", dot: "bg-muted" },
  { value: "In Review", color: "bg-warning-light text-warning-text", dot: "bg-warning" },
  { value: "Approved", color: "bg-primary-light text-primary-text", dot: "bg-primary" },
  { value: "In Progress", color: "bg-primary-light text-primary-text", dot: "bg-primary" },
  { value: "Completed", color: "bg-success-light text-success-text", dot: "bg-success" },
  { value: "On Hold", color: "bg-danger-light text-danger-text", dot: "bg-danger" },
];

// Options shown in the Priority dropdown, each with a badge color
export const PRIORITY_OPTIONS = [
  { value: "Low", color: "bg-surface-elevated text-muted", dot: "bg-muted" },
  { value: "Medium", color: "bg-primary-light text-primary-text", dot: "bg-primary" },
  { value: "High", color: "bg-warning-light text-warning-text", dot: "bg-warning" },
  { value: "Critical", color: "bg-danger-light text-danger-text", dot: "bg-danger" },
];

// Options shown in the Domain dropdown on create/edit forms
export const DOMAIN_OPTIONS = [
  { value: "", label: "Select Domain" },
  { value: "Banking" },
  { value: "Financial Services" },
  { value: "Insurance" },
  { value: "Healthcare" },
  { value: "Retail" },
  { value: "Manufacturing" },
  { value: "Logistics" },
  { value: "Education" },
  { value: "Energy" },
  { value: "SaaS" },
  { value: "Enterprise Software" },
  { value: "Telecommunications" },
  { value: "Legal" },
  { value: "Hospitality" },
  { value: "Pharmaceuticals" },
  { value: "Human Resources" },
  { value: "FMCG" },
  { value: "Other" },
];

// Default number of rows shown per page in the table
export const DEFAULT_PAGE_SIZE = 8;
