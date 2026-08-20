import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";
import FormInput from "./FormInput";
import PageHeaderCard from "./dashboard/PageHeaderCard";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";

const breadcrumbLabelMap = {
  dashboard: "Dashboard",
  overview: "Dashboard Overview",
  "use-cases": "Use Case Library",
  new: "Create New Use Case",
  edit: "Edit Use Case",
  "domain-media": "Detail Page Media",
  "browse-domain-media": "Browse Card Media",
  "access-audit": "Access Audit",
};

function getBreadcrumbs(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [];
  let cumulativePath = "";

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const prev = segments[index - 1] || "";
    cumulativePath += `/${segment}`;

    if (prev === "use-cases" && segment !== "new") {
      crumbs.push({ label: "Use Case Profile", to: cumulativePath });
      continue;
    }

    const label = breadcrumbLabelMap[segment] || segment.replace(/-/g, " ");
    crumbs.push({ label, to: cumulativePath });
  }

  return crumbs;
}

function PageNavCard({ title, subtitle, className = "", extraActions = null, compact = false }) {
  const { isAdmin, unlockAdmin, lockAdmin, rememberedPasscode } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const location = useLocation();
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const breadcrumbs = getBreadcrumbs(location.pathname);

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
      <div className={compact ? "px-2 pb-0 pt-1.5 md:px-3 md:pb-0.5 md:pt-2" : "p-2 md:p-3"}>
        <PageHeaderCard
          className={className}
          title={title}
          subtitle={(
            <>
              {breadcrumbs.length > 1 ? (
                <p className="mb-0.5 flex flex-wrap items-center gap-1 text-[11px] text-muted-dim md:text-xs">
                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                      <span key={crumb.to} className="inline-flex items-center gap-1">
                        {isLast ? (
                          <span className="font-medium text-muted">{crumb.label}</span>
                        ) : (
                          <Link to={crumb.to} className="transition-colors hover:text-ink">
                            {crumb.label}
                          </Link>
                        )}
                        {!isLast ? <span className="text-muted-dim">/</span> : null}
                      </span>
                    );
                  })}
                </p>
              ) : null}
              <p>{subtitle}</p>
            </>
          )}
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
                  Disable Admin Mode
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
              className="text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enabling..." : "Enable Admin Mode"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default PageNavCard;
