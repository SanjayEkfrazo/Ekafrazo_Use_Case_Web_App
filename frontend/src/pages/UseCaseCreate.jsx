// Create Use Case page: shows a blank form and creates a new use case on submit
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import UseCaseForm from "../components/UseCaseForm";
import { createUseCase, uploadDomainImage } from "../services/useCaseService";
import { useToast } from "../hooks/useToast";

function UseCaseCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();

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
      await createUseCase(payload);
      showToast("Use case created successfully");
      navigate("/use-cases");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <div className="page-enter">
      <Navbar compact title="Create Use Case" subtitle="Add a new use case to the repository" />
      <div className="p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
          <UseCaseForm onSubmit={handleSubmit} onCancel={() => navigate("/use-cases")} submitLabel="Create Use Case" />
        </div>
      </div>
    </div>
  );
}

export default UseCaseCreate;
