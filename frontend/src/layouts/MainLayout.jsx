// Main layout shared across all pages
// Renders the sidebar on the left and the page content on the right
import { motion, useReducedMotion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import useAutoMotionState from "../hooks/useAutoMotionState";

function MainLayout({ children }) {
  const reduceMotion = useReducedMotion();
  const { isIdle } = useAutoMotionState({ enabled: !reduceMotion, idleMs: 4200, tickMs: 3000 });

  return (
    <motion.div
      className={`app-shell ${isIdle ? "auto-motion-idle" : "auto-motion-active"}`}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.992 }}
      animate={reduceMotion ? {} : { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
    >
      <Sidebar />
      <motion.div
        className="app-shell-main"
        initial={reduceMotion ? false : { opacity: 0, x: 20 }}
        animate={reduceMotion ? {} : { opacity: 1, x: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.08 } }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default MainLayout;
