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
      return;
    }

    setIsSubmitting(true);
    try {
      setSubmitPhase(selectedDomainImageFile ? "uploading" : "saving");
      await onSubmit(payload, { domainImageFile: selectedDomainImageFile, setSubmitPhase });
    } finally {
      setSubmitPhase("idle");
      setIsSubmitting(false);
    }
  };

  const effectiveDomainImagePreviewUrl = selectedDomainImagePreviewUrl || String(values.domain_image_url || "").trim();

  return (
    <form onSubmit={handleSubmit}>
      <section className="rounded-xl border border-border bg-surface p-3 shadow-card md:p-4">
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-surface-elevated p-3">
            <h3 className="font-display text-lg font-semibold text-ink">Basic Info</h3>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3 [&_input]:py-1.5 [&_select]:py-1.5 [&_textarea]:py-1.5">
            <div className="md:col-span-3">
              <FormInput
                label="Title"
                name="title"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.title}
                placeholder="e.g. Customer Churn Prediction"
              />
            </div>

            <div className="md:col-span-3">
              <FormTextarea
                label="Description"
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.description}
                placeholder="A short summary of the use case"
                rows={2}
              />
            </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-elevated p-3">
            <h3 className="font-display text-lg font-semibold text-ink">Domain and Client</h3>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3 [&_input]:py-1.5 [&_select]:py-1.5 [&_textarea]:py-1.5">
            <div className="flex flex-col gap-1">
              <label htmlFor="domain" className="text-xs font-medium uppercase tracking-wide text-muted">
                Domain
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
                  inputValue ? "Press Enter to use this domain" : "No matching domains"
                }
                formatCreateLabel={(inputValue) => `Use "${inputValue.trim()}"`}
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
              {errors.domain && (
                <div className="flex flex-col gap-1">
                  <p className="inline-flex items-center gap-1 text-xs text-danger-text">
                    <AlertTriangle size={12} /> {errors.domain}
                  </p>
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex flex-col gap-1">
              <label htmlFor="domain_image" className="text-xs font-medium uppercase tracking-wide text-muted">
                Domain Image
              </label>
              <div className="rounded-xl border-2 border-dashed border-border bg-surface px-3 py-3 transition-all duration-200 hover:border-primary hover:bg-primary-light motion-reduce:transition-none">
                <div className="flex flex-wrap items-center gap-2">
                <input
                  id="domain_image"
                  name="domain_image"
                  type="file"
                  accept="image/*"
                  onChange={handleDomainImageUpload}
                  disabled={isSubmitting}
                  className="block w-full max-w-sm rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-on-solid hover:file:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
                />
                {selectedDomainImageFile && <span className="text-xs text-muted">Image will upload on save</span>}
                </div>
              </div>
              {(errors.domain_image_url || effectiveDomainImagePreviewUrl) && (
                <div className="flex flex-col gap-1">
                  {errors.domain_image_url && (
                    <p className="inline-flex items-center gap-1 text-xs text-danger-text">
                      <AlertTriangle size={12} /> {errors.domain_image_url}
                    </p>
                  )}
                  {effectiveDomainImagePreviewUrl && !errors.domain_image_url && (
                    <div className="relative mt-1 inline-flex w-fit">
                      <img
                        src={effectiveDomainImagePreviewUrl}
                        alt="Domain"
                        className="h-20 w-20 rounded-lg border border-border object-cover"
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
              )}
            </div>

            <FormInput
              label="Client / Company"
              name="client_name"
              value={values.client_name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.client_name}
              placeholder="e.g. Acme Corp"
            />
            <FormInput
              label="Technology Stack"
              name="technology_stack"
              value={values.technology_stack}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.technology_stack}
              placeholder="e.g. Python, React, PostgreSQL"
            />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-elevated p-3">
            <h3 className="font-display text-lg font-semibold text-ink">Links</h3>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3 [&_input]:py-1.5 [&_select]:py-1.5 [&_textarea]:py-1.5">
            <div className="md:col-span-3">
              <FormInput
                label="Use Case Deployment URL"
                name="deployment_url"
                value={values.deployment_url}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.deployment_url}
                placeholder="https://example.com/use-case"
              />
            </div>

            <div className="md:col-span-2">
              <FormInput
                label="Presentation / File URL"
                name="resource_url"
                value={values.resource_url}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.resource_url}
                placeholder="https://drive.google.com/..."
              />
            </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-border pt-2.5">
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
        </div>
      </section>
    </form>
  );
}

export default UseCaseForm;
