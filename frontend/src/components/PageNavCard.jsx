import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";
import FormInput from "./FormInput";
import PageHeaderCard from "./dashboard/PageHeaderCard";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";

function PageNavCard({ title, subtitle, className = "", extraActions = null, compact = false }) {
  const { isAdmin, unlockAdmin, lockAdmin, rememberedPasscode } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isUnlockOpen) {
      setPasscode(rememberedPasscode || "");
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
      <div className={compact ? "px-2 pb-0 pt-1.5 md:px-3 md:pb-0.5 md:pt-2" : "p-2 md:p-3"}>
        <PageHeaderCard
          className={className}
          title={title}
          subtitle={subtitle}
          actions={(
            <>
              {extraActions}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-elevated text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:text-ink"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {isAdmin ? (
                <Button onClick={handleLock} className="h-9 px-3 text-xs">
                  Admin Mode On
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setIsUnlockOpen(true)} className="h-9 border border-border px-3 text-xs">
                  Enable Admin Mode
                </Button>
              )}
            </>
          )}
        />
      </div>

      <Modal
        isOpen={isUnlockOpen}
        onClose={() => {
          if (isSubmitting) {
            return;
          }
          setIsUnlockOpen(false);
          setPasscode(rememberedPasscode || "");
        }}
      >
        <h2 className="font-display text-lg font-semibold text-ink">Enable Admin Mode</h2>
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
              setPasscode(rememberedPasscode || "");
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleUnlock} disabled={isSubmitting}>
            {isSubmitting ? "Enabling..." : "Enable Admin Mode"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default PageNavCard;
