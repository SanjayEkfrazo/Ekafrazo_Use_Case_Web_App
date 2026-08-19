// Empty state shown when a list has no items to display
import Button from "./Button";

function EmptyState({ title, description, actionLabel, onAction, actionClassName = "" }) {
  return (
    <div className="empty-enter flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
          <path d="M9 13h6m-6 4h6M9 9h1M5 21h14a2 2 0 0 0 2-2V7l-6-6H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
        </svg>
      </div>
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {actionLabel && (
        <Button className={`mt-5 ${actionClassName}`} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
