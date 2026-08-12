import { motion, useReducedMotion } from "framer-motion";
import { pageMotion } from "../utils/motion";

function PageTransition({ children, className = "" }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={pageMotion.initial}
      animate={pageMotion.animate}
      exit={pageMotion.exit}
      style={{ willChange: "transform, opacity, filter" }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;