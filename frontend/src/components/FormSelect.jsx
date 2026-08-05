// Reusable labeled select dropdown

function FormSelect({ label, name, value, onChange, options, error }) {
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
        className={`rounded-md border bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary ${
          error ? "border-danger" : "border-border"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.value}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export default FormSelect;
