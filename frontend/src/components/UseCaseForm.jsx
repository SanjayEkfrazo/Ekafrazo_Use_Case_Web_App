import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import CreatableSelect from "react-select/creatable";
import { motion, useReducedMotion } from "framer-motion";
import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
import Button from "./Button";
import { validateUseCaseForm, validateCustomDomain, validateUseCaseField } from "../utils/validation";
import { DOMAIN_OPTIONS } from "../utils/constants";
import { fetchUseCaseDomains } from "../services/useCaseService";
import useAutoMotionState from "../hooks/useAutoMotionState";

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
  { key: "client_name", label: "Client" },
  { key: "technology_stack", label: "Technology" },
  { key: "deployment_url", label: "Deployment" },
  { key: "resource_url", label: "Presentation" },
];

function UseCaseForm({ initialValues = emptyForm, onSubmit, onCancel, submitLabel = "Save Use Case", compact = false }) {
  const [values, setValues] = useState({ ...emptyForm, ...initialValues, domain_image_url: "" });
  const [existingDomains, setExistingDomains] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState("idle");
  const [submitError, setSubmitError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const reduceMotion = useReducedMotion();
  const { isIdle, tick } = useAutoMotionState({ enabled: !reduceMotion, idleMs: 3000, tickMs: 2100 });

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

  const setFieldTouched = (field) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const validateField = (field, nextValues) => {
    if (field === "domain") {
      const domainError = validateDomainValue(nextValues.domain);
      setErrors((current) => ({ ...current, domain: domainError || undefined }));
      return;
    }

    const fieldValue = nextValues[field];
    const fieldError = validateUseCaseField(field, fieldValue);
    setErrors((current) => ({ ...current, [field]: fieldError || undefined }));
  };

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

  const focusFirstErrorField = (validationErrors) => {
    const firstErrorField = requiredFields.find((field) => validationErrors[field.key])?.key;
    if (!firstErrorField) {
      return;
    }

    const element = document.getElementById(firstErrorField);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setHasSubmitted(true);
    const payload = {
      ...values,
      domain: (values.domain || "").trim(),
      domain_image_url: "",
    };

    const validationErrors = validateUseCaseForm(payload);
    const domainError = validateDomainValue(payload.domain);
    if (domainError) {
      validationErrors.domain = domainError;
    }

    setErrors(validationErrors);
    setTouched({
      title: true,
      description: true,
      domain: true,
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
      setSubmitPhase("saving");
      await onSubmit(payload, { setSubmitPhase });
    } catch (error) {
      const message = String(error?.message || "Failed to save use case");
      setSubmitError(message);
    } finally {
      setSubmitPhase("idle");
      setIsSubmitting(false);
    }
  };

  const completedRequiredCount = requiredFields.reduce((count, field) => {
    return String(values[field.key] || "").trim() ? count + 1 : count;
  }, 0);
  const autoPanelIndex = isIdle ? tick % 5 : -1;

  return (
    <form onSubmit={handleSubmit}>
      <motion.section
        className={`rounded-xl border border-border bg-surface shadow-card ${compact ? "p-1.5 md:p-2" : "p-3 md:p-4"}`}
        initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.99 }}
        animate={reduceMotion ? {} : { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } }}
      >
        <motion.div
          className={`${compact ? "mb-1.5 px-2 py-1.5" : "mb-3 px-3 py-2.5"} rounded-xl border border-border bg-surface-elevated ${autoPanelIndex === 0 ? "auto-panel-pulse" : ""}`}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={reduceMotion ? {} : { opacity: 1, y: 0, transition: { duration: 0.28, delay: 0.06 } }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink">Form Status</p>
              <p className="mt-0.5 text-xs text-muted">{completedRequiredCount} of {requiredFields.length} required fields completed.</p>
            </div>
            <p className="text-xs text-muted"><span className="text-danger-text">*</span> Required fields</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-border/60">
            <motion.div
              className="h-full rounded-full bg-primary transition-all duration-300 motion-reduce:transition-none"
              style={{ width: `${Math.round((completedRequiredCount / requiredFields.length) * 100)}%` }}
              animate={
                reduceMotion
                  ? {}
                  : {
                    boxShadow:
                      completedRequiredCount === requiredFields.length
                        ? ["0 0 0 rgba(139,92,246,0)", "0 0 22px rgba(139,92,246,0.42)", "0 0 0 rgba(139,92,246,0)"]
                        : isIdle
                          ? ["0 0 0 rgba(139,92,246,0)", "0 0 10px rgba(139,92,246,0.24)", "0 0 0 rgba(139,92,246,0)"]
                          : "0 0 0 rgba(139,92,246,0)",
                  }
              }
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        <div className={`grid grid-cols-1 xl:grid-cols-2 ${compact ? "gap-2" : "gap-3"}`}>
          <motion.div
            className={`rounded-xl border border-border bg-surface-elevated ${compact ? "p-2" : "p-3"} xl:col-span-2 ${autoPanelIndex === 1 ? "auto-panel-pulse" : ""}`}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.1 } }}
          >
            <h3 className="font-display text-base font-semibold text-ink">General Information</h3>
            <div className={`grid grid-cols-1 md:grid-cols-2 ${compact ? "mt-1.5 gap-1.5 [&_input]:py-1" : "mt-2.5 gap-2 [&_input]:py-1.5"}`}>
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
                          ? "rgb(var(--color-primary-rgb))"
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
                        ? "rgb(var(--color-primary-rgb) / 0.14)"
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
                      `cursor-pointer px-3 py-2 text-sm ${state.isFocused ? "bg-primary/15 text-primary-text" : "text-ink"}`,
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
          </motion.div>

          <motion.div
            className={`rounded-xl border border-border bg-surface-elevated ${compact ? "p-2" : "p-3"} xl:col-span-2 ${autoPanelIndex === 2 ? "auto-panel-pulse" : ""}`}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.16 } }}
          >
            <h3 className="font-display text-base font-semibold text-ink">Business Overview</h3>
            <div className={`${compact ? "mt-1.5 [&_textarea]:py-1" : "mt-2.5 [&_textarea]:py-1.5"}`}>
              <FormTextarea
                label="Description"
                name="description"
                required
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.description}
                placeholder="Add a short business summary"
                rows={compact ? 2 : 3}
              />
            </div>
          </motion.div>

          <motion.div
            className={`rounded-xl border border-border bg-surface-elevated ${compact ? "p-2" : "p-3"} ${autoPanelIndex === 3 ? "auto-panel-pulse" : ""}`}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.22 } }}
          >
            <h3 className="font-display text-base font-semibold text-ink">Technology</h3>
            <div className={`${compact ? "mt-1.5 [&_input]:py-1" : "mt-2.5 [&_input]:py-1.5"}`}>
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
          </motion.div>

          <motion.div
            className={`rounded-xl border border-border bg-surface-elevated ${compact ? "p-2" : "p-3"} ${autoPanelIndex === 4 ? "auto-panel-pulse" : ""}`}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.28 } }}
          >
            <h3 className="font-display text-base font-semibold text-ink">Resources</h3>
            <div className={`grid grid-cols-1 ${compact ? "mt-1.5 gap-1.5 [&_input]:py-1" : "mt-2.5 gap-2 [&_input]:py-1.5"}`}>
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
          </motion.div>
        </div>

        <div className={`flex flex-wrap items-center justify-end border-t border-border ${compact ? "mt-1.5 gap-2 pt-1.5" : "mt-3 gap-2.5 pt-3"}`}>
          {submitError && (
            <p className="mr-auto inline-flex items-center gap-1 text-xs text-danger-text">
              <AlertTriangle size={12} /> {submitError}
            </p>
          )}
          <Button type="button" variant="ghost" onClick={onCancel}>
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
      </motion.section>
    </form>
  );
}

export default UseCaseForm;
