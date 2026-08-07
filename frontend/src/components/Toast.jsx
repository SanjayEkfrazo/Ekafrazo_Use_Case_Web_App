// A single toast notification bubble

function Toast({ message, type, onClose }) {
  const styles = {
    success: "bg-ink text-on-solid",
    error: "bg-danger text-on-solid",
  };

  return (
    <div className={`toast-enter relative overflow-hidden rounded-xl px-4 py-3 shadow-card-hover ${styles[type] || styles.success}`}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="text-on-solid/70 transition-colors duration-200 hover:text-on-solid" aria-label="Dismiss message">
          x
        </button>
      </div>
      <div className="toast-progress absolute bottom-0 left-0 h-0.5 w-full bg-on-solid/60" />
    </div>
  );
}

export default Toast;
