// Shared form used by both the Create and Edit pages
// Receives initial values and a submit handler as props
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import CreatableSelect from "react-select/creatable";
import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
import Button from "./Button";
import { validateUseCaseForm, validateCustomDomain, validateUseCaseField } from "../utils/validation";
import { DOMAIN_OPTIONS } from "../utils/constants";
import { fetchUseCaseDomains } from "../services/useCaseService";

const emptyForm = {
  title: "",
  description: "",
  domain: "",
  domain_image_url: "",
  deployment_url: "",
  resource_url: "",
  client_name: "",
  business_problem: "",
  proposed_solution: "",
  technology_stack: "",
};

const requiredFields = [
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "domain", label: "Domain" },
  { key: "domain_image_url", label: "Domain image" },
  { key: "client_name", label: "Client" },
  { key: "technology_stack", label: "Technology" },
  { key: "deployment_url", label: "Deployment" },
  { key: "resource_url", label: "Presentation" },
];

function UseCaseForm({ initialValues = emptyForm, onSubmit, onCancel, submitLabel = "Save Use Case" }) {
  const [values, setValues] = useState({ ...emptyForm, ...initialValues });
  const [existingDomains, setExistingDomains] = useState([]);
  const normalizeDomain = (value) => String(value || "").trim().toLowerCase();

  const domainOptions = useMemo(() => {
    const baseDomains = DOMAIN_OPTIONS.filter((option) => option.value && option.value !== "Other");

    const knownLower = new Set(baseDomains.map((option) => option.value.toLowerCase()));
    const merged = baseDomains.map((option) => ({ value: option.value, label: option.label || option.value }));

    existingDomains.forEach((domain) => {
      const trimmed = (domain || "").trim();
      if (!trimmed) {
        return;
      }
      const lowered = trimmed.toLowerCase();
      if (!knownLower.has(lowered)) {
        knownLower.add(lowered);
        merged.push({ value: trimmed, label: trimmed });
      }
    });

    merged.sort((a, b) => a.label.localeCompare(b.label));

    return merged;
  }, [existingDomains]);

  const knownDomainValues = domainOptions.map((option) => option.value);
  const findDomainMatch = (domainValue) => {
    const normalized = normalizeDomain(domainValue);
    if (!normalized) {
      return "";
    }
    return knownDomainValues.find((domain) => normalizeDomain(domain) === normalized) || "";
  };
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState("idle");
  const [submitError, setSubmitError] = useState("");
  const [selectedDomainImageFile, setSelectedDomainImageFile] = useState(null);
  const [selectedDomainImagePreviewUrl, setSelectedDomainImagePreviewUrl] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      if (selectedDomainImagePreviewUrl) {
        URL.revokeObjectURL(selectedDomainImagePreviewUrl);
      }
    };
  }, [selectedDomainImagePreviewUrl]);

  useEffect(() => {
    async function loadDomains() {
      try {
        const response = await fetchUseCaseDomains();
        setExistingDomains(response.data || []);
      } catch (_error) {
        // Keep static domain options when domain list request fails.
      }
    }
    loadDomains();
  }, []);

  const selectedDomainOption = useMemo(() => {
    const currentDomain = (values.domain || "").trim();
    if (!currentDomain) {
      return null;
    }

    const matched = domainOptions.find((option) => normalizeDomain(option.value) === normalizeDomain(currentDomain));
    if (matched) {
      return matched;
    }

    return { value: currentDomain, label: currentDomain };
  }, [domainOptions, values.domain]);

  const validateDomainValue = (domainRawValue = values.domain) => {
    const resolvedDomain = (domainRawValue || "").trim();
    const baseError = validateUseCaseField("domain", resolvedDomain);
    if (baseError) {
      return baseError;
    }

    const enteredDomain = normalizeDomain(resolvedDomain);
    const initialDomainLower = normalizeDomain(initialValues.domain);
    const alreadyExists = knownDomainValues.some((domain) => normalizeDomain(domain) === enteredDomain);
    if (alreadyExists && enteredDomain !== initialDomainLower) {
      return "";
    }

    const customError = validateCustomDomain(resolvedDomain);
    if (customError) {
      return customError;
    }

    return "";
  };

  const validateDomainImageValue = (nextValues = values, nextFile = selectedDomainImageFile) => {
    const imageUrl = String(nextValues.domain_image_url || "").trim();

    if (!imageUrl && !nextFile) {
      return "Domain image is required";
    }

    if (imageUrl) {
      const urlError = validateUseCaseField("domain_image_url", imageUrl);
      if (urlError) {
        return urlError;
      }
    }

    if (nextFile && (!nextFile.type || !nextFile.type.startsWith("image/"))) {
      return "Only image files are allowed";
    }

    if (nextFile && nextFile.size > 5 * 1024 * 1024) {
      return "Image must be 5MB or smaller";
    }

    return "";
  };

  const setFieldTouched = (field) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const validateField = (field, nextValues) => {
    if (field === "domain") {
      const domainError = validateDomainValue(nextValues.domain);
      setErrors((current) => ({ ...current, domain: domainError || undefined }));
      return;
    }

    if (field === "domain_image_url") {
      const imageError = validateDomainImageValue(nextValues);
      setErrors((current) => ({ ...current, domain_image_url: imageError || undefined }));
      return;
    }

    const fieldValue = nextValues[field];
    const fieldError = validateUseCaseField(field, fieldValue);
    setErrors((current) => ({ ...current, [field]: fieldError || undefined }));
  };

  // Update a single field as the user types
  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => {
      const nextValues = { ...current, [name]: value };
      if (hasSubmitted && touched[name]) {
        validateField(name, nextValues);
      }
      return nextValues;
    });
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setFieldTouched(name);
    if (hasSubmitted) {
      validateField(name, values);
    }
  };

  // Keep domain canonical when users create or type values with different case.
  const handleDomainChange = (selectedOption) => {
    const nextRawValue = selectedOption?.value || "";
    const canonicalDomain = findDomainMatch(nextRawValue);
    const nextDomain = canonicalDomain || String(nextRawValue).trim();

    setValues((current) => ({ ...current, domain: nextDomain }));

    setFieldTouched("domain");
    if (hasSubmitted) {
      const domainError = validateDomainValue(nextDomain);
      setErrors((current) => ({ ...current, domain: domainError || undefined }));
    }
  };

  const handleDomainBlur = () => {
    setFieldTouched("domain");
    if (hasSubmitted) {
      const domainError = validateDomainValue(values.domain);
      setErrors((current) => ({ ...current, domain: domainError || undefined }));
    }
  };

  const handleDomainImageUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setFieldTouched("domain_image_url");
    setSelectedDomainImageFile(file);
    setSubmitError("");

    if (selectedDomainImagePreviewUrl) {
      URL.revokeObjectURL(selectedDomainImagePreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedDomainImagePreviewUrl(previewUrl);

    if (hasSubmitted) {
      const imageError = validateDomainImageValue(values, file);
      setErrors((current) => ({ ...current, domain_image_url: imageError || undefined }));
    } else {
      setErrors((current) => ({ ...current, domain_image_url: undefined }));
    }
  };

  const handleRemoveDomainImage = () => {
    if (selectedDomainImagePreviewUrl) {
      URL.revokeObjectURL(selectedDomainImagePreviewUrl);
    }
    setSelectedDomainImagePreviewUrl("");
    setSelectedDomainImageFile(null);
    setSubmitError("");
    setFieldTouched("domain_image_url");
    setValues((current) => ({ ...current, domain_image_url: "" }));
    if (hasSubmitted) {
      const imageError = validateDomainImageValue({ ...values, domain_image_url: "" }, null);
      setErrors((current) => ({ ...current, domain_image_url: imageError || undefined }));
      return;
    }
    setErrors((current) => ({ ...current, domain_image_url: undefined }));
  };

  // Validate and submit the form
  const handleSubmit = async (event) => {
    event.preventDefault();
    setHasSubmitted(true);
    const payload = {
      ...values,
      domain: (values.domain || "").trim(),
      domain_image_url: (values.domain_image_url || "").trim(),
    };

    const validationErrors = validateUseCaseForm(payload);
    const domainError = validateDomainValue();
    if (domainError) {
      validationErrors.domain = domainError;
    }

    const domainImageError = validateDomainImageValue(payload, selectedDomainImageFile);
    if (domainImageError) {
      validationErrors.domain_image_url = domainImageError;
    } else {
      delete validationErrors.domain_image_url;
    }

    setErrors(validationErrors);
    setTouched({
      title: true,
      description: true,
      domain: true,
      domain_image_url: true,
      client_name: true,
      technology_stack: true,
      deployment_url: true,
      resource_url: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      focusFirstErrorField(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      setSubmitPhase(selectedDomainImageFile ? "uploading" : "saving");
      await onSubmit(payload, { domainImageFile: selectedDomainImageFile, setSubmitPhase });
    } catch (error) {
      const message = String(error?.message || "Failed to save use case");
      setSubmitError(message);

      if (selectedDomainImageFile) {
        setErrors((current) => ({
          ...current,
          domain_image_url: `Image upload failed: ${message}`,
        }));
      }
    } finally {
      setSubmitPhase("idle");
      setIsSubmitting(false);
    }
  };

  const effectiveDomainImagePreviewUrl = selectedDomainImagePreviewUrl || String(values.domain_image_url || "").trim();
  const completedRequiredCount = requiredFields.reduce((count, field) => {
    if (field.key === "domain_image_url") {
      return effectiveDomainImagePreviewUrl ? count + 1 : count;
    }
    return String(values[field.key] || "").trim() ? count + 1 : count;
  }, 0);

  const focusFirstErrorField = (validationErrors) => {
    const firstErrorField = requiredFields.find((field) => validationErrors[field.key])?.key;
    if (!firstErrorField) {
      return;
    }

    const targetId = firstErrorField === "domain_image_url" ? "domain_image" : firstErrorField;
    const element = document.getElementById(targetId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <section className="rounded-xl border border-border bg-surface p-3 shadow-card md:p-4">
        <div className="mb-3 rounded-xl border border-border bg-surface-elevated px-3 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink">Form Status</p>
              <p className="mt-0.5 text-xs text-muted">{completedRequiredCount} of {requiredFields.length} required fields completed.</p>
            </div>
            <p className="text-xs text-muted"><span className="text-danger-text">*</span> Required fields</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-border/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-brand-via transition-all duration-300 motion-reduce:transition-none"
              style={{ width: `${Math.round((completedRequiredCount / requiredFields.length) * 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface-elevated p-3 xl:col-span-2">
            <h3 className="font-display text-base font-semibold text-ink">General Information</h3>
            <div className="mt-2.5 grid grid-cols-1 gap-2 md:grid-cols-2 [&_input]:py-1.5">
              <div className="md:col-span-2">
                <FormInput
                  label="Title"
                  name="title"
                  required
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.title}
                  placeholder="e.g. Customer Churn Prediction"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="domain" className="text-xs font-medium uppercase tracking-wide text-muted">
                  Business Domain
                  <span className="ml-1 text-danger-text">*</span>
                </label>
                <CreatableSelect
                  inputId="domain"
                  name="domain"
                  value={selectedDomainOption}
                  onChange={handleDomainChange}
                  onBlur={handleDomainBlur}
                  options={domainOptions}
                  isClearable
                  placeholder="Select or type a domain"
                  noOptionsMessage={({ inputValue }) =>
                    inputValue ? "Press Enter to create this domain" : "No matching domains"
                  }
                  formatCreateLabel={(inputValue) => `Create domain: "${inputValue.trim()}"`}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      backgroundColor: "rgb(var(--color-surface))",
                      borderColor: errors.domain
                        ? "rgb(var(--color-danger))"
                        : state.isFocused
                          ? "rgb(var(--color-primary))"
                          : "rgb(var(--color-border))",
                      boxShadow: state.isFocused ? "var(--shadow-glow-primary)" : "none",
                      minHeight: 38,
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "rgb(var(--color-ink))",
                    }),
                    input: (base) => ({
                      ...base,
                      color: "rgb(var(--color-ink))",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "rgb(var(--color-muted-dim))",
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "rgb(var(--color-surface))",
                      border: "1px solid rgb(var(--color-border))",
                      boxShadow: "var(--shadow-card)",
                    }),
                    menuList: (base) => ({
                      ...base,
                      backgroundColor: "rgb(var(--color-surface))",
                      paddingTop: 4,
                      paddingBottom: 4,
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused
                        ? "rgb(var(--color-primary-subtle))"
                        : "rgb(var(--color-surface))",
                      color: state.isFocused
                        ? "rgb(var(--color-primary-text))"
                        : "rgb(var(--color-ink))",
                      cursor: "pointer",
                    }),
                  }}
                  classNames={{
                    control: (state) =>
                      `min-h-[38px] rounded-lg border bg-surface px-1 text-sm text-ink transition-all duration-200 ${
                        errors.domain ? "border-danger" : "border-border"
                      } ${state.isFocused ? "border-primary shadow-glow-primary" : ""}`,
                    valueContainer: () => "py-0",
                    input: () => "!m-0 !p-0",
                    placeholder: () => "text-muted-dim",
                    menu: () => "z-20 mt-1 overflow-hidden rounded-lg border border-border bg-surface shadow-card",
                    option: (state) =>
                      `cursor-pointer px-3 py-2 text-sm ${state.isFocused ? "bg-primary-light text-primary-text" : "text-ink"}`,
                  }}
                />
                <p className="text-xs text-muted">
                  Select an existing domain or create one. Custom domain must start with a letter, be 2-50 characters,
                  and use only letters, numbers, spaces, &, /, +, and -.
                </p>
                {errors.domain && (
                  <p className="inline-flex items-center gap-1 text-xs text-danger-text">
                    <AlertTriangle size={12} /> {errors.domain}
                  </p>
                )}
              </div>

              <FormInput
                label="Client"
                name="client_name"
                required
                value={values.client_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.client_name}
                placeholder="e.g. Acme Corp"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-elevated p-3 xl:col-span-2">
            <h3 className="font-display text-base font-semibold text-ink">Business Overview</h3>
            <div className="mt-2.5 [&_textarea]:py-1.5">
              <FormTextarea
                label="Description"
                name="description"
                required
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.description}
                placeholder="Add a short business summary"
                rows={3}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-elevated p-3">
            <h3 className="font-display text-base font-semibold text-ink">Technology</h3>
            <div className="mt-2.5 [&_input]:py-1.5">
              <FormInput
                label="Technology Stack"
                name="technology_stack"
                required
                value={values.technology_stack}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.technology_stack}
                placeholder="e.g. Python, React, PostgreSQL"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-elevated p-3">
            <h3 className="font-display text-base font-semibold text-ink">Media</h3>
            <p className="mt-1 text-xs text-muted">Upload a domain image and verify preview before saving.</p>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              <li>Accepted: image files only (JPG, PNG, WEBP, GIF)</li>
              <li>Maximum size: 5MB</li>
              <li>If upload fails, a clear error will appear below this field</li>
            </ul>
            <div className="mt-2.5 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div className="rounded-xl border-2 border-dashed border-border bg-surface px-3 py-3 transition-all duration-200 hover:border-primary hover:bg-primary-light motion-reduce:transition-none">
                <input
                  id="domain_image"
                  name="domain_image"
                  type="file"
                  accept="image/*"
                  onChange={handleDomainImageUpload}
                  disabled={isSubmitting}
                  className="block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-on-solid hover:file:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
                />
                {selectedDomainImageFile && <p className="mt-2 text-xs text-muted">Selected image will upload on save.</p>}
                {selectedDomainImageFile && !errors.domain_image_url && (
                  <p className="mt-1 text-xs text-success-text">
                    Ready to upload: {selectedDomainImageFile.name} ({(selectedDomainImageFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
                {errors.domain_image_url && (
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-danger-text">
                    <AlertTriangle size={12} /> {errors.domain_image_url}
                  </p>
                )}
              </div>

              {effectiveDomainImagePreviewUrl && !errors.domain_image_url && (
                <div className="relative inline-flex w-fit">
                  <img
                    src={effectiveDomainImagePreviewUrl}
                    alt="Domain"
                    className="h-28 w-28 rounded-lg border border-border object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveDomainImage}
                    aria-label="Remove selected image"
                    className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface-elevated text-danger-text transition-colors duration-200 hover:bg-danger-light"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-elevated p-3 xl:col-span-2">
            <h3 className="font-display text-base font-semibold text-ink">Resources</h3>
            <div className="mt-2.5 grid grid-cols-1 gap-2 md:grid-cols-2 [&_input]:py-1.5">
              <FormInput
                label="Live Demo URL"
                name="deployment_url"
                required
                value={values.deployment_url}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.deployment_url}
                placeholder="https://example.com/demo"
              />
              <FormInput
                label="Presentation URL"
                name="resource_url"
                required
                value={values.resource_url}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.resource_url}
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-end gap-2.5 border-t border-border pt-3">
          {submitError && !errors.domain_image_url && (
            <p className="mr-auto inline-flex items-center gap-1 text-xs text-danger-text">
              <AlertTriangle size={12} /> {submitError}
            </p>
          )}
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {submitPhase === "uploading" ? "Uploading image..." : "Saving..."}
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </section>
    </form>
  );
}

export default UseCaseForm;
