import { motion, useReducedMotion } from "framer-motion";

function PageHeaderCard({ title, subtitle, actions = null, className = "" }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className={`rounded-2xl border border-border bg-surface px-4 py-3 shadow-card md:px-5 ${className}`}
      initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.99 }}
      animate={reduceMotion ? {} : { opacity: 1, y: 0, scale: 1, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } }}
      whileHover={reduceMotion ? undefined : { y: -2 }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-semibold text-ink md:text-xl">{title}</h2>
          {subtitle ? <div className="mt-0.5 text-xs text-muted md:text-sm">{subtitle}</div> : null}
        </div>

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </motion.section>
  );
}

export default PageHeaderCard;
