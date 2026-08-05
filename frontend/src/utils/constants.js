// Shared constant values used across the frontend

// Options shown in the Status dropdown, each with a badge color
export const STATUS_OPTIONS = [
  { value: "Draft", color: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  { value: "In Review", color: "bg-warning-light text-warning", dot: "bg-warning" },
  { value: "Approved", color: "bg-primary-light text-primary", dot: "bg-primary" },
  { value: "In Progress", color: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  { value: "Completed", color: "bg-success-light text-success", dot: "bg-success" },
  { value: "On Hold", color: "bg-danger-light text-danger", dot: "bg-danger" },
];

// Options shown in the Priority dropdown, each with a badge color
export const PRIORITY_OPTIONS = [
  { value: "Low", color: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  { value: "Medium", color: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  { value: "High", color: "bg-warning-light text-warning", dot: "bg-warning" },
  { value: "Critical", color: "bg-danger-light text-danger", dot: "bg-danger" },
];

// Default number of rows shown per page in the table
export const DEFAULT_PAGE_SIZE = 8;
