// Top navigation bar shown above the page content
import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";
import FormInput from "./FormInput";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { useTheme } from "../hooks/useTheme";

function Navbar({ title, subtitle, compact = false }) {
  const { isAdmin, unlockAdmin, lockAdmin } = useAuth();
  const { showToast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnlock = async () => {
    if (!passcode.trim()) {
      showToast("Passcode is required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await unlockAdmin(passcode.trim());
      showToast("Admin mode unlocked");
      setPasscode("");
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
      showToast("Admin mode locked");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <>
      <header className={`border-b border-border bg-surface ${compact ? "px-5 py-3 md:px-6" : "px-6 py-5 md:px-8"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
              {isAdmin && <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary-text">Admin</span>}
            </div>
            {subtitle && <p className={`text-sm text-muted ${compact ? "mt-0.5" : ""}`}>{subtitle}</p>}
          </div>

          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-elevated text-muted transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-border-strong hover:text-ink motion-reduce:transition-none motion-reduce:transform-none"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {isAdmin ? (
              <Button variant="dangerSoft" onClick={handleLock} className="px-3 py-2 text-xs">
                Logout Admin
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setIsUnlockOpen(true)} className="px-3 py-2 text-xs">
                Unlock Admin
              </Button>
            )}
          </div>
        </div>
      </header>

      <Modal
        isOpen={isUnlockOpen}
        onClose={() => {
          if (isSubmitting) return;
          setIsUnlockOpen(false);
          setPasscode("");
        }}
      >
        <h2 className="font-display text-lg font-semibold text-ink">Unlock Admin Mode</h2>
        <p className="mt-2 text-sm text-muted">Enter the admin passcode to enable create, edit, and delete actions.</p>

        <div className="mt-4">
          <FormInput
            label="Admin Passcode"
            name="admin_passcode"
            type="password"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            placeholder="Enter passcode"
            className="input-terminal"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setIsUnlockOpen(false);
              setPasscode("");
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleUnlock} disabled={isSubmitting}>
            {isSubmitting ? "Unlocking..." : "Unlock"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default Navbar;
