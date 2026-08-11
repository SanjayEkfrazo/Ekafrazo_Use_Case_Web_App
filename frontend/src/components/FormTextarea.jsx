// Reusable labeled textarea with inline validation error
import { memo } from "react";

function FormTextarea({ label, name, value, onChange, onBlur, error, placeholder = "", rows = 4, required = false }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="ui-label">
        {label}
        {required && <span className="ml-1 text-danger-text">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        aria-required={required}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        className={`ui-textarea resize-none ${
          error ? "ui-textarea-error" : ""
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

export default memo(FormTextarea);
