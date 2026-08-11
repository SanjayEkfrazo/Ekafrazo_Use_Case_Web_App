// Renders active toast messages in a centered spotlight stack
import { useToast } from "../hooks/useToast";
import Toast from "./Toast";

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] flex items-end justify-end p-4 sm:p-6">
      <div className="flex w-full max-w-[420px] flex-col gap-3 motion-reduce:transition-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
}

export default ToastContainer;
