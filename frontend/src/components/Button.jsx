// Reusable button with a few style variants

function Button({ children, variant = "primary", onClick, type = "button", disabled = false, className = "" }) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out disabled:cursor-not-allowed focus-visible:outline-none motion-reduce:transition-none motion-reduce:transform-none";

  const variants = {
    primary: "bg-primary text-on-solid shadow-card hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-glow-primary disabled:opacity-70",
    secondary: "border border-border bg-surface-elevated text-ink hover:border-border-strong disabled:opacity-50",
    danger: "bg-danger text-on-solid hover:-translate-y-0.5 hover:bg-danger/90 disabled:opacity-70",
    dangerSoft: "border border-danger/35 bg-danger-light text-danger-text hover:border-danger/50 hover:bg-danger-light/80 disabled:opacity-60",
    ghost: "bg-transparent text-primary-text hover:bg-primary-light disabled:opacity-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
