// Shared form used by both the Create and Edit pages
// Receives initial values and a submit handler as props
import { useState } from "react";
import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
import FormSelect from "./FormSelect";
import Button from "./Button";
import { validateUseCaseForm } from "../utils/validation";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "../utils/constants";

const emptyForm = {
  title: "",
  description: "",
  domain: "",
  deployment_url: "",
  resource_url: "",
  client_name: "",
  status: "Draft",
  priority: "Medium",
  business_problem: "",
  proposed_solution: "",
  technology_stack: "",
};

function UseCaseForm({ initialValues = emptyForm, onSubmit, onCancel, submitLabel = "Save Use Case" }) {
  const [values, setValues] = useState({ ...emptyForm, ...initialValues });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update a single field as the user types
  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  // Validate and submit the form
  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateUseCaseForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <section className="rounded-lg border border-border bg-surface p-3 shadow-card md:p-3">
        <div className="space-y-2.5 md:space-y-2">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 [&_input]:py-1.5 [&_select]:py-1.5 [&_textarea]:py-1.5">
            <div className="md:col-span-3">
              <FormInput label="Title" name="title" value={values.title} onChange={handleChange} error={errors.title} placeholder="e.g. Customer Churn Prediction" />
            </div>

            <div className="md:col-span-3">
              <FormTextarea
                label="Description"
                name="description"
                value={values.description}
                onChange={handleChange}
                error={errors.description}
                placeholder="A short summary of the use case"
                rows={2}
              />
            </div>

            <FormInput label="Domain" name="domain" value={values.domain} onChange={handleChange} error={errors.domain} placeholder="e.g. Retail, Healthcare" />
            <FormInput label="Client / Company" name="client_name" value={values.client_name} onChange={handleChange} error={errors.client_name} placeholder="e.g. Acme Corp" />
            <FormInput label="Technology Stack" name="technology_stack" value={values.technology_stack} onChange={handleChange} error={errors.technology_stack} placeholder="e.g. Python, React, PostgreSQL" />

            <FormSelect label="Status" name="status" value={values.status} onChange={handleChange} options={STATUS_OPTIONS} />
            <FormSelect label="Priority" name="priority" value={values.priority} onChange={handleChange} options={PRIORITY_OPTIONS} />
            <div className="md:col-span-3">
              <FormInput
                label="Use Case Deployment URL"
                name="deployment_url"
                value={values.deployment_url}
                onChange={handleChange}
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
                error={errors.resource_url}
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-border pt-2.5">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </div>
      </section>
    </form>
  );
}

export default UseCaseForm;
