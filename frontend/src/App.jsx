// Root component of the application
// Wraps everything with the layout and the toast notification provider
import { ToastProvider } from "./hooks/useToast";
import { AuthProvider } from "./hooks/useAuth";
import ToastContainer from "./components/ToastContainer";
import MainLayout from "./layouts/MainLayout";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainLayout>
          <AppRoutes />
        </MainLayout>
        <ToastContainer />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
