import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import FormInput from "../components/FormInput";
import FormTextarea from "../components/FormTextarea";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import PageNavCard from "../components/PageNavCard";
import { useToast } from "../hooks/useToast";
import {
  deleteAccessUser,
  fetchAccessSigninLogs,
  fetchAccessUsers,
  updateAccessUser,
} from "../services/accessService";

const emptyEditForm = {
  fullName: "",
  workEmail: "",
  organization: "",
  purpose: "",
  phone: "",
  department: "",
  projectTimeline: "",
  notes: "",
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function toEditForm(user) {
  return {
    fullName: String(user?.full_name || "").trim(),
    workEmail: String(user?.work_email || "").trim(),
    organization: String(user?.organization || "").trim(),
    purpose: String(user?.purpose || "").trim(),
    phone: String(user?.phone || "").trim(),
    department: String(user?.department || "").trim(),
    projectTimeline: String(user?.project_timeline || "").trim(),
    notes: String(user?.notes || "").trim(),
  };
}

function validateEditForm(values) {
  const errors = {};

  if (!String(values?.fullName || "").trim()) {
    errors.fullName = "Full name is required";
  }

  const workEmail = String(values?.workEmail || "").trim();
  if (!workEmail) {
    errors.workEmail = "Work email is required";
  } else if (!isValidEmail(workEmail)) {
    errors.workEmail = "Enter a valid work email";
  }

  if (!String(values?.organization || "").trim()) {
    errors.organization = "Organization is required";
  }

  if (!String(values?.purpose || "").trim()) {
    errors.purpose = "Purpose is required";
  }

  return errors;
}

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
  const [editingUser, setEditingUser] = useState(null);
  const [editValues, setEditValues] = useState(emptyEditForm);
  const [editErrors, setEditErrors] = useState({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

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

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditValues(toEditForm(user));
    setEditErrors({});
  };

  const closeEditModal = (force = false) => {
    if (isSavingEdit && !force) {
      return;
    }
    setEditingUser(null);
    setEditValues(emptyEditForm);
    setEditErrors({});
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditValues((current) => ({ ...current, [name]: value }));
    setEditErrors((current) => {
      if (!current[name]) {
        return current;
      }
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingUser?.id) {
      return;
    }

    const validationErrors = validateEditForm(editValues);
    setEditErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSavingEdit(true);
    try {
      const response = await updateAccessUser(editingUser.id, editValues);
      const updatedUser = response?.data;

      if (updatedUser) {
        setUsers((current) => current.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
        setSigninLogs((current) => current.map((entry) => (
          Number(entry?.access_user_id) === Number(updatedUser.id)
            ? {
              ...entry,
              organization: updatedUser.organization,
              department: updatedUser.department,
            }
            : entry
        )));
      }

      showToast("User profile updated successfully");
      closeEditModal(true);
    } catch (error) {
      showToast(error.message || "Failed to update user profile", "error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteUser = async () => {
    const userId = Number(pendingDeleteUser?.id);
    if (!Number.isFinite(userId) || userId <= 0) {
      return;
    }

    setDeletingUserId(userId);
    try {
      await deleteAccessUser(userId);
      setUsers((current) => current.filter((user) => Number(user.id) !== userId));
      setSigninLogs((current) => current.filter((entry) => Number(entry?.access_user_id) !== userId));
      setPendingDeleteUser(null);
      showToast("User deleted permanently");
    } catch (error) {
      showToast(error.message || "Failed to delete user", "error");
    } finally {
      setDeletingUserId(null);
    }
  };

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
                      <th className="sticky top-0 z-10 px-3 py-2 text-left text-xs font-semibold text-muted">Actions</th>
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
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="secondary"
                              className="px-2.5 py-1.5 text-xs"
                              onClick={() => openEditModal(user)}
                              disabled={deletingUserId === user.id}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="dangerSoft"
                              className="px-2.5 py-1.5 text-xs"
                              onClick={() => setPendingDeleteUser(user)}
                              disabled={deletingUserId === user.id}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
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

      <Modal
        isOpen={Boolean(editingUser)}
        onClose={closeEditModal}
        panelClassName="max-w-2xl rounded-2xl border border-border bg-surface-elevated p-6 shadow-elevation-3"
      >
        <h3 className="font-display text-lg font-semibold text-ink">Edit User Profile</h3>
        <p className="mt-1 text-sm text-muted">Update details and save changes.</p>

        <form className="mt-5 space-y-4" onSubmit={handleEditSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="Full Name"
              name="fullName"
              value={editValues.fullName}
              onChange={handleEditChange}
              error={editErrors.fullName}
              required
            />
            <FormInput
              label="Work Email"
              name="workEmail"
              type="email"
              value={editValues.workEmail}
              onChange={handleEditChange}
              error={editErrors.workEmail}
              required
            />
            <FormInput
              label="Organization"
              name="organization"
              value={editValues.organization}
              onChange={handleEditChange}
              error={editErrors.organization}
              required
            />
            <FormInput
              label="Purpose"
              name="purpose"
              value={editValues.purpose}
              onChange={handleEditChange}
              error={editErrors.purpose}
              required
            />
            <FormInput
              label="Phone"
              name="phone"
              value={editValues.phone}
              onChange={handleEditChange}
              error={editErrors.phone}
            />
            <FormInput
              label="Department"
              name="department"
              value={editValues.department}
              onChange={handleEditChange}
              error={editErrors.department}
            />
            <FormInput
              label="Project Timeline"
              name="projectTimeline"
              value={editValues.projectTimeline}
              onChange={handleEditChange}
              error={editErrors.projectTimeline}
            />
          </div>

          <FormTextarea
            label="Notes"
            name="notes"
            value={editValues.notes}
            onChange={handleEditChange}
            error={editErrors.notes}
            rows={3}
          />

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeEditModal} disabled={isSavingEdit}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSavingEdit}>
              {isSavingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteUser)}
        title="Permanent Delete User"
        description={`Delete ${pendingDeleteUser?.full_name || "this user"} permanently? This cannot be undone.`}
        onCancel={() => {
          if (!deletingUserId) {
            setPendingDeleteUser(null);
          }
        }}
        onConfirm={handleDeleteUser}
        confirmLabel={deletingUserId ? "Deleting..." : "Permanent Delete"}
        confirmClassName="min-w-[150px] justify-center"
      />
    </div>
  );
}

export default AccessAudit;
