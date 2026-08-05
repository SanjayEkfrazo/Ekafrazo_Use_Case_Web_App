// Edit Use Case page: loads existing data, prefills the form, and updates on submit
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import UseCaseForm from "../components/UseCaseForm";
import Loader from "../components/Loader";
import { fetchUseCaseById, updateUseCase } from "../services/useCaseService";
import { useToast } from "../hooks/useToast";

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
  const handleSubmit = async (values) => {
    try {
      await updateUseCase(id, values);
      showToast("Use case updated successfully");
      navigate("/use-cases");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <div>
      <Navbar compact title="Edit Use Case" />
      <div className="p-2.5 md:p-3">
        <div className="mx-auto max-w-6xl">
          {isLoading ? (
            <Loader rows={6} />
          ) : (
            <UseCaseForm initialValues={useCase} onSubmit={handleSubmit} onCancel={() => navigate("/use-cases")} submitLabel="Save Changes" />
          )}
        </div>
      </div>
    </div>
  );
}

export default UseCaseEdit;
