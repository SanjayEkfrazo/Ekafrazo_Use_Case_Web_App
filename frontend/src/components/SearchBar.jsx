// Search input used to filter the use cases table

function SearchBar({ value, onChange, placeholder = "Search use cases..." }) {
  return (
    <div className="relative w-full max-w-sm">
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
        className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted-dim transition-all duration-200 ease-out focus:border-primary focus:shadow-glow-primary motion-reduce:transition-none"
      />
    </div>
  );
}

export default SearchBar;
