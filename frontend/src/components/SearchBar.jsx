// Search input used to filter the use cases table
import { memo } from "react";

function SearchBar({ value, onChange, placeholder = "Search use cases..." }) {
  return (
    <div className="relative w-full">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="ui-search-input w-full pl-9 pr-3"
      />
    </div>
  );
}

export default memo(SearchBar);
