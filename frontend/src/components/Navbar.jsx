// Top navigation bar shown above the page content
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "./Button";
import Modal from "./Modal";
import FormInput from "./FormInput";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { useTheme } from "../hooks/useTheme";

function Navbar({ title, subtitle, compact = false }) {
  const { isAdmin, unlockAdmin, lockAdmin, rememberedPasscode } = useAuth();
  const { showToast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (isUnlockOpen) {
      setPasscode(rememberedPasscode || "");
      setShowPasscode(false);
    }
  }, [isUnlockOpen, rememberedPasscode]);

  const handleUnlock = async () => {
    if (!passcode.trim()) {
      showToast("Passcode is required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await unlockAdmin(passcode.trim());
      showToast("Admin mode enabled");
      setIsUnlockOpen(false);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLock = async () => {
    try {
      await lockAdmin();
      showToast("Admin mode disabled");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <>
      <motion.header
        className={`app-navbar ${compact ? "px-5 py-3 md:px-6" : "px-6 py-5 md:px-8"}`}
        initial={reduceMotion ? false : { opacity: 0, y: -14 }}
        animate={reduceMotion ? {} : { opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
              {isAdmin && <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary-text">Admin</span>}
            </div>
            {subtitle && <p className={`text-sm text-muted ${compact ? "mt-0.5" : ""}`}>{subtitle}</p>}
          </div>

          <div className="flex items-start gap-3">
            <motion.button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              className="btn-tone-theme-icon inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none"
              whileHover={reduceMotion ? undefined : { y: -2, scale: 1.04, rotate: isDark ? -8 : 8 }}
              whileTap={reduceMotion ? undefined : { scale: 0.94, rotate: 0 }}
              transition={reduceMotion ? undefined : { type: "spring", stiffness: 320, damping: 18 }}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>
            {isAdmin ? (
              <Button onClick={handleLock} className="btn-tone-admin-on px-3 py-2 text-xs">
                Disable Admin Mode
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setIsUnlockOpen(true)} className="btn-tone-admin-enable px-3 py-2 text-xs">
                Enable Admin Mode
              </Button>
            )}
          </div>
        </div>
      </motion.header>

      <Modal
        isOpen={isUnlockOpen}
        onClose={() => {
          if (isSubmitting) return;
          setIsUnlockOpen(false);
          setPasscode(rememberedPasscode || "");
        }}
        panelClassName="max-w-[49rem]"
      >
        <h2 className="font-display text-lg font-semibold text-ink">Enable Admin Mode</h2>
        <p className="mt-2 text-sm text-muted">Enter the admin passcode to enable create, edit, and delete actions.</p>

        <form
          className="mt-4"
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            handleUnlock();
          }}
        >
          <FormInput
            label="Admin Passcode"
            name="admin_passcode"
            type={showPasscode ? "text" : "password"}
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            placeholder="Enter passcode"
            className="input-terminal"
            autoComplete="new-password"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="none"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              className="btn-link-inline text-xs font-semibold"
              onClick={() => setShowPasscode((current) => !current)}
            >
              {showPasscode ? "Hide" : "Show"} passcode
            </button>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsUnlockOpen(false);
                setPasscode(rememberedPasscode || "");
              }}
              className="btn-tone-modal-cancel"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="btn-tone-save" disabled={isSubmitting}>
              {isSubmitting ? "Enabling..." : "Enable Admin Mode"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Navbar;
