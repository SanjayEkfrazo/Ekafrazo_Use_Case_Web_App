// Reusable labeled select dropdown
import { memo } from "react";

function FormSelect({ label, name, value, onChange, onBlur, options, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="ui-label">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`ui-select ${
          error ? "ui-select-error" : ""
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

export default memo(FormSelect);
