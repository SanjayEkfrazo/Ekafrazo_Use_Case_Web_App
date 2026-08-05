// Create Use Case page: shows a blank form and creates a new use case on submit
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import UseCaseForm from "../components/UseCaseForm";
import { createUseCase } from "../services/useCaseService";
import { useToast } from "../hooks/useToast";

function UseCaseCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Handle form submission by calling the API service
  const handleSubmit = async (values) => {
    try {
      await createUseCase(values);
      showToast("Use case created successfully");
      navigate("/use-cases");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <div>
      <Navbar compact title="Create Use Case" />
      <div className="p-2.5 md:p-3">
        <div className="mx-auto max-w-6xl">
          <UseCaseForm onSubmit={handleSubmit} onCancel={() => navigate("/use-cases")} submitLabel="Create Use Case" />
        </div>
      </div>
    </div>
  );
}

export default UseCaseCreate;
