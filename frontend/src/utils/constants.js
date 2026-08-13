// Shared constant values used across the frontend

// Options shown in the Status dropdown, each with a badge color
export const STATUS_OPTIONS = [
  { value: "Draft", color: "bg-surface-elevated text-muted", dot: "bg-muted" },
  { value: "In Review", color: "border-warning/45 bg-warning/15 text-warning-text", dot: "bg-warning" },
  { value: "Approved", color: "border-primary/45 bg-primary/15 text-primary-text", dot: "bg-primary" },
  { value: "In Progress", color: "border-primary/45 bg-primary/15 text-primary-text", dot: "bg-primary" },
  { value: "Completed", color: "border-success/45 bg-success/15 text-success-text", dot: "bg-success" },
  { value: "On Hold", color: "border-danger/45 bg-danger/15 text-danger-text", dot: "bg-danger" },
];

// Options shown in the Priority dropdown, each with a badge color
export const PRIORITY_OPTIONS = [
  { value: "Low", color: "bg-surface-elevated text-muted", dot: "bg-muted" },
  { value: "Medium", color: "border-primary/45 bg-primary/15 text-primary-text", dot: "bg-primary" },
  { value: "High", color: "border-warning/45 bg-warning/15 text-warning-text", dot: "bg-warning" },
  { value: "Critical", color: "border-danger/45 bg-danger/15 text-danger-text", dot: "bg-danger" },
];

// Options shown in the Domain dropdown on create/edit forms
export const DOMAIN_OPTIONS = [
  { value: "", label: "Select Domain" },
  { value: "Healthcare & Life Sciences" },
  { value: "Pharmaceuticals" },
  { value: "Manufacturing" },
  { value: "Construction & Real Estate" },
  { value: "Logistics" },
  { value: "Supply Chain Management" },
  { value: "Financial Services" },
  { value: "Insurance" },
  { value: "Retail & E-commerce" },
  { value: "Energy & Utilities" },
  { value: "Telecommunications" },
  { value: "Transportation & Mobility" },
  { value: "Education" },
  { value: "Public Sector & Government" },
  { value: "Media & Entertainment" },
  { value: "Hospitality & Travel" },
  { value: "Agriculture" },
  { value: "Technology & Software" },
  { value: "Legal & Compliance" },
  { value: "Human Resources" },
  { value: "Other" },
];

// Default number of rows shown per page in the table
export const DEFAULT_PAGE_SIZE = 8;
