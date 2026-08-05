// Reusable labeled textarea with inline validation error

function FormTextarea({ label, name, value, onChange, error, placeholder = "", rows = 4 }) {
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
        placeholder={placeholder}
        rows={rows}
        className={`resize-none rounded-md border px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary ${
          error ? "border-danger" : "border-border"
        }`}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export default FormTextarea;
