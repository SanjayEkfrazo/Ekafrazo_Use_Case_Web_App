// Reusable button with a few style variants

function Button({ children, variant = "primary", onClick, type = "button", disabled = false, className = "" }) {
  const baseStyles = "ui-button";

  const variants = {
    primary: "ui-button-primary",
    secondary: "ui-button-secondary",
    danger: "ui-button-danger",
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
