// Edit Use Case page: loads existing data, prefills the form, and updates on submit
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import UseCaseForm from "../components/UseCaseForm";
import Loader from "../components/Loader";
import { fetchUseCaseById, updateUseCase, uploadDomainImage } from "../services/useCaseService";
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
  const handleSubmit = async (values, { domainImageFile, setSubmitPhase } = {}) => {
    try {
      let payload = { ...values };

      if (domainImageFile) {
        setSubmitPhase?.("uploading");
        const uploadResponse = await uploadDomainImage(domainImageFile);
        payload = {
          ...payload,
          domain_image_url: uploadResponse?.data?.url || "",
        };
      }

      setSubmitPhase?.("saving");
      await updateUseCase(id, payload);
      showToast("Use case updated successfully");
      navigate("/use-cases");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <div className="page-enter">
      <Navbar compact title="Edit Use Case" subtitle="Update use case details and links" />
      <div className="p-4 md:p-6">
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
