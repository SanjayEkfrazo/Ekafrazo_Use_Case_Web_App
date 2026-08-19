// Create Use Case page: shows a blank form and creates a new use case on submit
import { useNavigate } from "react-router-dom";
import PageNavCard from "../components/PageNavCard";
import UseCaseForm from "../components/UseCaseForm";
import { createUseCase } from "../services/useCaseService";
import { useToast } from "../hooks/useToast";

function UseCaseCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();

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
    <div className="usecase-auto-shell usecase-create-page">
      <PageNavCard
        compact
        className="px-3 py-1.5 md:px-4 md:py-2"
        title="Create New Use Case"
        subtitle="Add a new use case with clear business and technical details."
      />

      <div className="px-3 pb-2 pt-1 md:px-4 md:pb-3 md:pt-1.5">
        <div className="usecase-auto-stage">
          <UseCaseForm compact onSubmit={handleSubmit} onCancel={() => navigate("/use-cases")} submitLabel="Create Use Case" />
        </div>
      </div>
    </div>
  );
}

export default UseCaseCreate;
