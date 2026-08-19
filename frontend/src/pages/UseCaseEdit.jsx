// Edit Use Case page: loads existing data, prefills the form, and updates on submit
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageNavCard from "../components/PageNavCard";
import UseCaseForm from "../components/UseCaseForm";
import Loader from "../components/Loader";
import { fetchUseCaseById, updateUseCase } from "../services/useCaseService";
import { useToast } from "../hooks/useToast";

const COMPARABLE_FIELDS = [
  "title",
  "description",
  "domain",
  "deployment_url",
  "resource_url",
  "client_name",
  "business_problem",
  "proposed_solution",
  "technology_stack",
];

function normalizeComparableValue(value) {
  return String(value ?? "").trim();
}

function hasMeaningfulChanges(nextValues, currentValues) {
  return COMPARABLE_FIELDS.some(
    (field) => normalizeComparableValue(nextValues?.[field]) !== normalizeComparableValue(currentValues?.[field])
  );
}

function UseCaseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [useCase, setUseCase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the existing use case so the form can be prefilled
  useEffect(() => {
    async function loadUseCase() {
      try {
        const response = await fetchUseCaseById(id);
        setUseCase(response.data);
      } catch (error) {
        showToast(error.message, "error");
        navigate("/use-cases");
      } finally {
        setIsLoading(false);
      }
    }
    loadUseCase();
  }, [id]);

  // Handle form submission by calling the API service
  const handleSubmit = async (values, { setSubmitPhase } = {}) => {
    try {
      const payload = { ...values, domain_image_url: "" };

      if (!hasMeaningfulChanges(payload, { ...useCase, domain_image_url: "" })) {
        showToast("No fields were edited. Update at least one field before saving.", "error");
        return;
      }

      setSubmitPhase?.("saving");
      await updateUseCase(id, payload);
      navigate("/use-cases", {
        state: {
          toast: {
            message: "Use case updated successfully",
            type: "success",
          },
        },
      });
    } catch (error) {
      showToast(error.message, "error");
      throw error;
    }
  };

  return (
    <div className="usecase-auto-shell usecase-edit-page">
      <PageNavCard compact className="px-3 py-1.5 md:px-4 md:py-2" title="Edit Use Case" subtitle="Update this use case and keep the information accurate." />

      <div className="px-3 pb-1.5 pt-1 md:px-4 md:pb-2.5 md:pt-1.5">
        <div className="usecase-auto-stage">
          {isLoading ? (
            <Loader rows={6} />
          ) : (
            <UseCaseForm compact initialValues={useCase} onSubmit={handleSubmit} onCancel={() => navigate("/use-cases")} submitLabel="Save Changes" />
          )}
        </div>
      </div>
    </div>
  );
}

export default UseCaseEdit;
