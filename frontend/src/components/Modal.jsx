// Reusable modal dialog wrapper
// Renders its children inside a centered card with a backdrop
import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { motionTokens, softScaleIn } from "../utils/motion";

function Modal({ isOpen, onClose, children, panelClassName = "", backdropClassName = "" }) {
  const panelRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousFocused = document.activeElement;
    const focusables = panelRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusables?.[0];
    firstFocusable?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !focusables?.length) {
        return;
      }

      const activeIndex = Array.from(focusables).indexOf(document.activeElement);
      if (event.shiftKey && activeIndex <= 0) {
        event.preventDefault();
        focusables[focusables.length - 1].focus();
      } else if (!event.shiftKey && activeIndex === focusables.length - 1) {
        event.preventDefault();
        focusables[0].focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocused && typeof previousFocused.focus === "function") {
        previousFocused.focus();
      }
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-40 flex items-center justify-center px-4 ${backdropClassName || "bg-overlay/75 backdrop-blur-md"}`}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={reduceMotion ? {} : { opacity: 1, transition: { duration: motionTokens.standard } }}
          exit={reduceMotion ? {} : { opacity: 0, transition: { duration: motionTokens.fast } }}
        >
          {/* Clicking the backdrop closes the modal */}
          <div className="absolute inset-0" onClick={onClose} />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            className={`ui-modal-panel relative z-10 w-full max-w-md p-6 motion-reduce:transition-none ${panelClassName || ""}`}
            initial={reduceMotion ? false : softScaleIn.initial}
            animate={reduceMotion ? {} : softScaleIn.animate}
            exit={reduceMotion ? {} : softScaleIn.exit}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
