// Confirmation dialog shown before a destructive action like delete
import Modal from "./Modal";
import Button from "./Button";

function ConfirmDialog({ isOpen, title, description, onConfirm, onCancel, confirmLabel = "Delete" }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
