// Confirmation dialog shown before a destructive action like delete
import Modal from "./Modal";
import Button from "./Button";

function ConfirmDialog({ isOpen, title, description, onConfirm, onCancel, confirmLabel = "Delete" }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      backdropClassName="bg-[radial-gradient(circle_at_20%_20%,rgba(0,102,204,0.22),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(14,25,39,0.30),transparent_52%),rgba(15,28,43,0.52)] backdrop-blur-md"
      panelClassName="border border-white/55 bg-gradient-to-br from-white/80 via-primary-light/62 to-white/74 shadow-[0_24px_60px_rgba(15,28,43,0.34)] ring-1 ring-white/40 backdrop-blur-2xl"
    >
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
