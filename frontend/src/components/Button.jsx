// Reusable button with a few style variants

function Button({ children, variant = "primary", onClick, type = "button", disabled = false, className = "" }) {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover",
    secondary: "bg-white text-ink border border-border hover:bg-slate-50",
    danger: "bg-danger text-white hover:bg-red-700",
    ghost: "text-muted hover:bg-slate-100",
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
