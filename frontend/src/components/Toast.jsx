import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "../utils/motion";

// A single toast notification bubble

function Toast({ message, type, onClose }) {
  const reduceMotion = useReducedMotion();

  const styles = {
    success: "border border-success/35 bg-surface/95 text-ink",
    error: "border border-danger/40 bg-surface/95 text-ink",
  };

  const iconStyles = {
    success: "bg-success-light text-success-text",
    error: "bg-danger-light text-danger-text",
  };

  const label = type === "error" ? "Error" : "Success";

  const Icon = type === "error" ? AlertCircle : CheckCircle2;

  return (
    <motion.div
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.95 }}
      animate={reduceMotion ? {} : { opacity: 1, y: 0, scale: 1, transition: { duration: motionTokens.standard, ease: motionTokens.ease } }}
      exit={reduceMotion ? {} : { opacity: 0, y: 16, scale: 0.96, transition: { duration: motionTokens.fast, ease: motionTokens.ease } }}
      className={`toast-enter pointer-events-auto relative overflow-hidden rounded-2xl px-4 py-3.5 shadow-card-hover backdrop-blur-sm ${styles[type] || styles.success}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${iconStyles[type] || iconStyles.success}`}>
            <Icon className="h-4 w-4" strokeWidth={2.1} />
          </span>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{label}</p>
            <p className="mt-0.5 line-clamp-3 text-sm font-semibold leading-snug text-ink">{message}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-surface-elevated text-muted transition-colors duration-200 hover:text-ink"
          aria-label="Dismiss message"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className={`toast-progress absolute bottom-0 left-0 h-0.5 w-full ${type === "error" ? "bg-danger/55" : "bg-success/55"}`} />
    </motion.div>
  );
}

export default Toast;
