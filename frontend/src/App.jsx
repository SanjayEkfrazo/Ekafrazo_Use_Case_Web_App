// Root component of the application
// Wraps everything with the layout and the toast notification provider
import { ToastProvider } from "./hooks/useToast";
import ToastContainer from "./components/ToastContainer";
import MainLayout from "./layouts/MainLayout";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ToastProvider>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
      <ToastContainer />
    </ToastProvider>
  );
}

export default App;
