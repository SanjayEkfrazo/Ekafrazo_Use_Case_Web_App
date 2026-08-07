// Reusable labeled textarea with inline validation error

function FormTextarea({ label, name, value, onChange, onBlur, error, placeholder = "", rows = 4 }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        className={`resize-none rounded-lg border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-dim transition-all duration-200 ease-out focus:border-primary focus:shadow-glow-primary motion-reduce:transition-none ${
          error ? "border-danger" : "border-border"
        }`}
      />
      {error && (
        <p className="inline-flex items-center gap-1 text-xs text-danger-text">
          <span aria-hidden="true">!</span>
          {error}
        </p>
      )}
    </div>
  );
}

export default FormTextarea;
