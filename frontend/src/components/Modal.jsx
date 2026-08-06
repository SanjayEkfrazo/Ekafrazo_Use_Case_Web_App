// Reusable modal dialog wrapper
// Renders its children inside a centered card with a backdrop

function Modal({ isOpen, onClose, children, panelClassName = "", backdropClassName = "" }) {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-40 flex items-center justify-center px-4 ${backdropClassName || "bg-ink/40"}`}>
      {/* Clicking the backdrop closes the modal */}
      <div className="absolute inset-0" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-md rounded-lg p-6 ${panelClassName || "bg-surface shadow-card"}`}>{children}</div>
    </div>
  );
}

export default Modal;
