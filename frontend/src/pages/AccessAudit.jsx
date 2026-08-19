import { useEffect, useMemo, useState } from "react";
import Loader from "../components/Loader";
import PageNavCard from "../components/PageNavCard";
import { useToast } from "../hooks/useToast";
import { fetchAccessSigninLogs, fetchAccessUsers } from "../services/accessService";

function formatDateTime(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "-";
  }

  const parsed = new Date(raw.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function AccessAudit() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [signinLogs, setSigninLogs] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [usersResponse, logsResponse] = await Promise.all([
          fetchAccessUsers(250),
          fetchAccessSigninLogs(400),
        ]);

        if (cancelled) {
          return;
        }

        setUsers(Array.isArray(usersResponse?.data) ? usersResponse.data : []);
        setSigninLogs(Array.isArray(logsResponse?.data) ? logsResponse.data : []);
      } catch (error) {
        if (!cancelled) {
          showToast(error.message || "Failed to load access audit", "error");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const summary = useMemo(() => {
    const uniqueEmails = new Set(
      users
        .map((item) => String(item?.work_email || "").trim().toLowerCase())
        .filter(Boolean)
    );

    return {
      totalUsers: users.length,
      uniqueEmails: uniqueEmails.size,
      totalSigninEvents: signinLogs.length,
    };
  }, [users, signinLogs]);

  return (
    <div className="usecase-auto-shell page-enter">
      <PageNavCard
        title="Access Audit"
        subtitle="Review signup profiles and signin activity for use case access."
      />

      <div className="p-4 md:p-6">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-card md:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <article className="rounded-xl border border-border bg-surface-elevated px-3 py-2.5">
                <p className="text-xs uppercase tracking-wide text-muted">Signed Up Users</p>
                <p className="mt-1 text-xl font-semibold text-ink">{summary.totalUsers}</p>
              </article>
              <article className="rounded-xl border border-border bg-surface-elevated px-3 py-2.5">
                <p className="text-xs uppercase tracking-wide text-muted">Unique Emails</p>
                <p className="mt-1 text-xl font-semibold text-ink">{summary.uniqueEmails}</p>
              </article>
              <article className="rounded-xl border border-border bg-surface-elevated px-3 py-2.5">
                <p className="text-xs uppercase tracking-wide text-muted">Signin Events</p>
                <p className="mt-1 text-xl font-semibold text-ink">{summary.totalSigninEvents}</p>
              </article>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-card md:p-5">
            <h3 className="text-sm font-semibold text-ink">Signup Profiles</h3>
            {isLoading ? (
              <div className="mt-3"><Loader rows={4} /></div>
            ) : users.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No signup profiles found.</p>
            ) : (
              <div className="panel-scrollbar mt-3 max-h-[300px] overflow-auto">
                <table className="min-w-full table-fixed border-collapse">
                  <thead className="border-b border-border-strong bg-surface-elevated/95">
                    <tr>
                      <th className="sticky top-0 z-10 px-3 py-2 text-left text-xs font-semibold text-muted">Name</th>
                      <th className="sticky top-0 z-10 px-3 py-2 text-left text-xs font-semibold text-muted">Email</th>
                      <th className="sticky top-0 z-10 px-3 py-2 text-left text-xs font-semibold text-muted">Organization</th>
                      <th className="sticky top-0 z-10 px-3 py-2 text-left text-xs font-semibold text-muted">Created</th>
                      <th className="sticky top-0 z-10 px-3 py-2 text-left text-xs font-semibold text-muted">Last Signin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border/70 text-sm">
                        <td className="px-3 py-2 text-ink">{user.full_name || "-"}</td>
                        <td className="px-3 py-2 text-ink">{user.work_email || "-"}</td>
                        <td className="px-3 py-2 text-ink">{user.organization || "-"}</td>
                        <td className="px-3 py-2 text-muted">{formatDateTime(user.created_at)}</td>
                        <td className="px-3 py-2 text-muted">{formatDateTime(user.last_signed_in_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-card md:p-5">
            <h3 className="text-sm font-semibold text-ink">Signin Activity</h3>
            {isLoading ? (
              <div className="mt-3"><Loader rows={5} /></div>
            ) : signinLogs.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No signin activity recorded yet.</p>
            ) : (
              <div className="panel-scrollbar mt-3 max-h-[340px] overflow-auto">
                <table className="min-w-full table-fixed border-collapse">
                  <thead className="border-b border-border-strong bg-surface-elevated/95">
                    <tr>
                      <th className="sticky top-0 z-10 px-3 py-2 text-left text-xs font-semibold text-muted">When</th>
                      <th className="sticky top-0 z-10 px-3 py-2 text-left text-xs font-semibold text-muted">Name</th>
                      <th className="sticky top-0 z-10 px-3 py-2 text-left text-xs font-semibold text-muted">Email</th>
                      <th className="sticky top-0 z-10 px-3 py-2 text-left text-xs font-semibold text-muted">Organization</th>
                      <th className="sticky top-0 z-10 px-3 py-2 text-left text-xs font-semibold text-muted">Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signinLogs.map((entry) => (
                      <tr key={entry.id} className="border-b border-border/70 text-sm">
                        <td className="px-3 py-2 text-muted">{formatDateTime(entry.created_at)}</td>
                        <td className="px-3 py-2 text-ink">{entry.full_name || "-"}</td>
                        <td className="px-3 py-2 text-ink">{entry.work_email || "-"}</td>
                        <td className="px-3 py-2 text-ink">{entry.organization || "-"}</td>
                        <td className="px-3 py-2 text-ink">{entry.department || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default AccessAudit;
