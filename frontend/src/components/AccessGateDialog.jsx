import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
import Button from "./Button";
import { validateAccessGateFullDetails, validateAccessGateLoginDetails } from "../utils/validation";

const emptyValues = {
  fullName: "",
  workEmail: "",
  organization: "",
  purpose: "",
  phone: "",
  department: "",
  projectTimeline: "",
  notes: "",
};

function AccessGateDialog({
  isOpen,
  mode = "signup",
  allowModeSwitch = true,
  existingProfile = null,
  onClose,
  onConfirm,
}) {
  const [authMode, setAuthMode] = useState(mode === "login" ? "signin" : mode);
  const isSignInMode = authMode === "signin";
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const normalizedMode = mode === "login" ? "signin" : (mode === "full" ? "signup" : mode);
    setAuthMode(normalizedMode === "signin" ? "signin" : "signup");
    setErrors({});
    setSubmitError("");
    setShowOptionalDetails(false);
    setValues({ ...emptyValues });
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setErrors({});
    setValues((current) => ({
      ...current,
      fullName: "",
      workEmail: "",
      organization: isSignInMode ? "" : current.organization,
      purpose: isSignInMode ? "" : current.purpose,
      phone: "",
      department: "",
      projectTimeline: "",
      notes: "",
    }));
  }, [isOpen, isSignInMode]);

  const title = isSignInMode ? "Sign In To Continue" : "Sign Up To Continue";
  const subtitle = isSignInMode
    ? "Use your registered name and work email to continue."
    : "New users should complete Sign Up once to unlock access. Optional details can be added if needed.";

  const visibleOptionalFields = useMemo(() => (!isSignInMode
    ? [
      { key: "phone", label: "Phone", placeholder: "Optional phone number" },
      { key: "department", label: "Department", placeholder: "Optional department" },
      { key: "projectTimeline", label: "Project Timeline", placeholder: "Optional timeline (for example: Q4 rollout)" },
    ]
    : []), [isSignInMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
    if (submitError) {
      setSubmitError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = isSignInMode
      ? validateAccessGateLoginDetails(values)
      : validateAccessGateFullDetails(values);

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({ ...values, mode: authMode });
    } catch (error) {
      setSubmitError(String(error?.message || "Unable to continue. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (isSubmitting) {
          return;
        }
        onClose();
      }}
      panelClassName="max-w-[49rem] max-h-[86vh] overflow-y-auto"
    >
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>

      {allowModeSwitch ? (
        <div className="mt-2 inline-flex rounded-lg border border-border bg-surface-elevated p-1">
          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all duration-200 ${authMode === "signup" ? "bg-primary/12 text-primary-text" : "text-muted hover:text-ink"}`}
            aria-pressed={authMode === "signup"}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("signin")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all duration-200 ${authMode === "signin" ? "bg-primary/12 text-primary-text" : "text-muted hover:text-ink"}`}
            aria-pressed={authMode === "signin"}
          >
            Sign In
          </button>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
        {isSignInMode ? (
          <div className="rounded-lg border border-primary/35 bg-primary/8 px-3 py-2 text-xs text-ink">
            <p className="font-semibold text-ink">Registered user? Sign in.</p>
            {allowModeSwitch ? (
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <p className="text-[11px] text-muted">New here? Create your profile first.</p>
                <button
                  type="button"
                  className="inline-flex shrink-0 rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] font-semibold text-primary-text hover:border-primary"
                  onClick={() => setAuthMode("signup")}
                >
                  Go to Sign Up
                </button>
              </div>
            ) : (
              <p className="mt-1.5 text-[11px] text-muted">New here? Create your profile first.</p>
            )}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <FormInput
            label="Full Name"
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            error={errors.fullName}
            placeholder="Enter your name"
            required
          />
          <FormInput
            label="Work Email"
            name="workEmail"
            type="email"
            value={values.workEmail}
            onChange={handleChange}
            error={errors.workEmail}
            placeholder="name@company.com"
            required
          />
        </div>

        {!isSignInMode && (
          <>
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              <FormInput
                label="Organization"
                name="organization"
                value={values.organization}
                onChange={handleChange}
                error={errors.organization}
                placeholder="Enter organization"
                required
              />
              <FormInput
                label="Purpose"
                name="purpose"
                value={values.purpose}
                onChange={handleChange}
                error={errors.purpose}
                placeholder="Why are you opening this use case?"
                required
              />
            </div>

            <div className="rounded-xl border border-border bg-surface-elevated p-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Optional Details</p>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-2.5 py-1 text-[11px]"
                  onClick={() => setShowOptionalDetails((current) => !current)}
                >
                  {showOptionalDetails ? "Hide" : "Add"}
                </Button>
              </div>

              {showOptionalDetails && (
                <>
                  <div className="mt-2 grid grid-cols-1 gap-2.5 md:grid-cols-3">
                    {visibleOptionalFields.map((field) => (
                      <FormInput
                        key={field.key}
                        label={field.label}
                        name={field.key}
                        value={values[field.key]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                      />
                    ))}
                  </div>
                  <div className="mt-2.5">
                    <FormTextarea
                      label="Notes"
                      name="notes"
                      value={values.notes}
                      onChange={handleChange}
                      placeholder="Optional notes"
                      rows={2}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {submitError ? (
          <p className="rounded-lg border border-danger-text/40 bg-danger-soft px-3 py-2 text-sm text-danger-text">
            {submitError}
          </p>
        ) : null}

        <div className="mt-4 flex justify-end gap-2.5">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : isSignInMode ? "Sign In" : "Sign Up"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AccessGateDialog;
