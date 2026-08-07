// Reusable labeled text input with inline validation error

function FormInput({ label, name, value, onChange, onBlur, error, placeholder = "", type = "text", className = "" }) {
  const isTerminal = className.includes("input-terminal");

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`${className} rounded-lg border px-3 py-2 text-sm placeholder:text-muted-dim transition-all duration-200 ease-out focus:border-primary focus:shadow-glow-primary motion-reduce:transition-none ${
          isTerminal ? "bg-transparent text-inherit" : "bg-surface text-ink"
        } ${
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

export default FormInput;
