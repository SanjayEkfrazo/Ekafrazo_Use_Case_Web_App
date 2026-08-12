// Reusable button with a few style variants
import { motion, useReducedMotion } from "framer-motion";

function Button({ children, variant = "primary", onClick, type = "button", disabled = false, className = "", disableMotion = false }) {
  const reduceMotion = useReducedMotion();
  const baseStyles = "ui-button";

  const variants = {
    primary: "ui-button-primary",
    secondary: "ui-button-secondary",
    danger: "ui-button-danger",
    dangerSoft: "border border-danger/35 bg-danger-light text-danger-text hover:border-danger/50 hover:bg-danger-light/80 disabled:opacity-60",
    ghost: "bg-transparent text-primary-text hover:bg-primary-light disabled:opacity-50",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      whileHover={reduceMotion || disabled || disableMotion ? undefined : { y: -2, scale: 1.015 }}
      whileTap={reduceMotion || disabled || disableMotion ? undefined : { scale: 0.97, y: 0 }}
      transition={reduceMotion || disableMotion ? undefined : { type: "spring", stiffness: 320, damping: 20 }}
    >
      {children}
    </motion.button>
  );
}

export default Button;
