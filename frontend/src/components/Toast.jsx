// A single toast notification bubble

function Toast({ message, type, onClose }) {
  const styles = {
    success: "bg-ink text-white",
    error: "bg-danger text-white",
  };

  return (
    <div className={`flex items-center justify-between gap-4 rounded-md px-4 py-3 shadow-card ${styles[type] || styles.success}`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-white/70 hover:text-white" aria-label="Dismiss message">
        ✕
      </button>
    </div>
  );
}

export default Toast;
