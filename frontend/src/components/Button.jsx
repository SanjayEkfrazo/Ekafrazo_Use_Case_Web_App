// Reusable button with a few style variants

function Button({ children, variant = "primary", onClick, type = "button", disabled = false, className = "" }) {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors transition-shadow disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-white shadow-sm hover:bg-primary-hover hover:shadow",
    secondary: "border border-[#B8D3F5] bg-[#F3F8FF] text-[#0A4F9A] shadow-sm hover:border-[#8FBCEB] hover:bg-[#E2F0FF] hover:shadow",
    danger: "bg-danger text-white hover:bg-danger/90",
    ghost: "text-primary bg-primary-light/40 hover:bg-primary-light/75",
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
