// Create Use Case page: shows a blank form and creates a new use case on submit
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import PageNavCard from "../components/PageNavCard";
import UseCaseForm from "../components/UseCaseForm";
import { createUseCase } from "../services/useCaseService";
import { useToast } from "../hooks/useToast";
import useAutoMotionState from "../hooks/useAutoMotionState";

function UseCaseCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const reduceMotion = useReducedMotion();
  const { isIdle } = useAutoMotionState({ enabled: !reduceMotion, idleMs: 3300, tickMs: 2500 });

  // Handle form submission by calling the API service
  const handleSubmit = async (values, { setSubmitPhase } = {}) => {
    try {
      setSubmitPhase?.("saving");
      await createUseCase({ ...values, domain_image_url: "" });
      navigate("/use-cases", {
        state: {
          toast: {
            message: "Use case created successfully",
            type: "success",
          },
        },
      });
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <div className="usecase-auto-shell">
      <PageNavCard title="Create Use Case" subtitle="Add a new use case to the repository" />

      <motion.div
        className="p-4 md:p-6"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={reduceMotion ? {} : { opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } }}
      >
        <div className={`mx-auto max-w-6xl usecase-auto-stage ${isIdle ? "usecase-auto-idle" : ""}`}>
          <div className="usecase-stage-scan" aria-hidden />
          <UseCaseForm onSubmit={handleSubmit} onCancel={() => navigate("/use-cases")} submitLabel="Create Use Case" />
        </div>
      </motion.div>
    </div>
  );
}

export default UseCaseCreate;
