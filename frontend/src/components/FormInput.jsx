// Reusable labeled text input with inline validation error
import { memo } from "react";

function FormInput({ label, name, value, onChange, onBlur, error, placeholder = "", type = "text", className = "", required = false }) {
  const isTerminal = className.includes("input-terminal");

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="ui-label">
        {label}
        {required && <span className="ml-1 text-danger-text">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        aria-required={required}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`${className} ui-input ${
          isTerminal ? "bg-transparent text-inherit" : "bg-surface text-ink"
        } ${
          error ? "ui-input-error" : ""
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

export default memo(FormInput);
