// Reusable labeled select dropdown

function FormSelect({ label, name, value, onChange, onBlur, options, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`rounded-lg border bg-surface px-3 py-2 text-sm text-ink transition-all duration-200 ease-out focus:border-primary focus:shadow-glow-primary motion-reduce:transition-none ${
          error ? "border-danger" : "border-border"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label || option.value}
          </option>
        ))}
      </select>
      {error && (
        <p className="inline-flex items-center gap-1 text-xs text-danger-text">
          <span aria-hidden="true">!</span>
          {error}
        </p>
      )}
    </div>
  );
}

export default FormSelect;
