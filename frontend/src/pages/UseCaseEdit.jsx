// Edit Use Case page: loads existing data, prefills the form, and updates on submit
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Navbar from "../components/Navbar";
import UseCaseForm from "../components/UseCaseForm";
import Loader from "../components/Loader";
import { fetchUseCaseById, updateUseCase } from "../services/useCaseService";
import { useToast } from "../hooks/useToast";
import useAutoMotionState from "../hooks/useAutoMotionState";

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
  const reduceMotion = useReducedMotion();
  const { isIdle } = useAutoMotionState({ enabled: !reduceMotion, idleMs: 3300, tickMs: 2500 });

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
    <div className="usecase-auto-shell">
      <Navbar compact title="Edit Use Case" subtitle="Update use case details and links" />
      <motion.div
        className="p-4 md:p-6"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={reduceMotion ? {} : { opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } }}
      >
        <div className={`mx-auto max-w-6xl usecase-auto-stage ${isIdle ? "usecase-auto-idle" : ""}`}>
          <div className="usecase-stage-scan" aria-hidden />
          {isLoading ? (
            <Loader rows={6} />
          ) : (
            <UseCaseForm initialValues={useCase} onSubmit={handleSubmit} onCancel={() => navigate("/use-cases")} submitLabel="Save Changes" />
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default UseCaseEdit;
