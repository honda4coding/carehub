"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LuSearch,
  LuUsers,
  LuChevronLeft,
  LuChevronRight,
  LuShieldCheck,
  LuShieldOff,
  LuRefreshCw,
  LuFilter,
  LuTriangleAlert,
  LuInbox,
} from "react-icons/lu";
import { ImSpinner2 } from "react-icons/im";

import { adminService } from "@/services/adminService";
import { AdminUser, UserRole, UserStatus, UsersPagination } from "@/types/user";

// Constants
const PAGE_SIZE = 20;
const DEBOUNCE_MS = 350; // to avoid request the api in repeated way until 350ms passed ==> for search

// used with filter
const ROLE_OPTIONS: { label: string; value: UserRole | "" }[] = [
  { label: "All Roles", value: "" },
  { label: "Doctor", value: "doctor" },
  { label: "Patient", value: "patient" },
  { label: "Admin", value: "admin" },
];

const STATUS_OPTIONS: { label: string; value: UserStatus | "" }[] = [
  { label: "All Statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Blocked", value: "blocked" },
  { label: "Rejected", value: "rejected" },
];

// Badge configs (matches admin/page.tsx patterns)
const statusConfig: Record<UserStatus, { style: string; label: string }> = {
  active: {
    style:
      "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
    label: "Active",
  },
  pending: {
    style: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
    label: "Pending",
  },
  blocked: {
    style: "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]",
    label: "Blocked",
  },
  rejected: {
    style: "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]",
    label: "Rejected",
  },
};

const roleConfig: Record<UserRole, { style: string; label: string }> = {
  doctor: {
    style:
      "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
    label: "Doctor",
  },
  patient: {
    style:
      "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]",
    label: "Patient",
  },
  admin: {
    style: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
    label: "Admin",
  },
};

// Avatar helpers
const AVATAR_STYLES = [
  "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
  "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]",
  "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
  "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
];

// get the chars of username to put it in the avatar
function getAvatarChars(name: string) {
  return name
    .split(" ")
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2); // take 2 chars only ==> hassan sherif zewain ==> HS not HSZ
}

// ensure that the user take the same avater style every time
function pickAvatar(id: string) {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_STYLES[sum % AVATAR_STYLES.length];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Skeleton row appears when requset is loading to api
function SkeletonRow() {
  return (
    <tr className="border-b border-[hsl(var(--color-border-soft))]">
      {[80, 65, 40, 40, 50, 55].map((w, i) => (
        <td key={i} className="py-3 pr-4">
          <div
            className="h-3 rounded-full bg-[hsl(var(--color-bg-soft))] animate-pulse"
            style={{ width: `${w}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// Action buttons
interface RowActionsProps {
  user: AdminUser;
  busy: boolean; // to stop any clicks on that row until the process is done
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
}

function RowActions({ user, busy, onActivate, onDeactivate }: RowActionsProps) {
  if (user.role === "admin") {
    return (
      <span className="text-[10px] font-bold italic text-[hsl(var(--color-text-muted))]">
        Protected
      </span>
    );
  }

  const canActivate = user.status === "blocked";
  const canDeactivate = user.status === "active";

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {canActivate && (
        <button
          onClick={() => onActivate(user._id)}
          disabled={busy}
          title="Activate user"
          className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-[7px]
            border border-[hsl(var(--color-primary)/0.4)]
            bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]
            hover:bg-[hsl(var(--color-success-bg))] hover:text-[hsl(--color-success)]
            hover:border-[hsl(var(--color-success)/0.3)]
            disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
        >
          {busy ? (
            <ImSpinner2 className="animate-spin text-[10px]" />
          ) : (
            <LuShieldCheck className="text-[11px]" />
          )}
          Activate
        </button>
      )}
      {canDeactivate && (
        <button
          onClick={() => onDeactivate(user._id)}
          disabled={busy}
          title="Suspend user"
          className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-[7px]
            border border-[hsl(var(--color-border))]
            text-[hsl(var(--color-text-muted))]
            hover:bg-[hsl(var(--color-danger-bg))] hover:text-[hsl(var(--color-danger))]
            hover:border-[hsl(var(--color-danger)/0.3)]
            disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
        >
          {busy ? (
            <ImSpinner2 className="animate-spin text-[10px]" />
          ) : (
            <LuShieldOff className="text-[11px]" />
          )}
          Deactivate
        </button>
      )}
      {!canActivate && !canDeactivate && (
        <span className="text-[10px] font-bold italic text-[hsl(var(--color-text-muted))]">
          ————
        </span>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminUserManagementPage() {
  // Data
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<UsersPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [page, setPage] = useState(1);

  // row action loading { userId: boolean }
  const [actionBusy, setActionBusy] = useState<Record<string, boolean>>({});

  // Debounced search ==> stored searched words after a time to avoid many fast requests on the api
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter]);

  // useCallback ==> to avoid creating a new copy of the function in every render
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsers({
        page,
        limit: PAGE_SIZE,
        ...(roleFilter ? { role: roleFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Client side search filter
  const visible = debouncedSearch
    ? users.filter(
        (u) =>
          u.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : users;

  // handle Activate and Deactivate
  async function handleActivate(id: string) {
    // [id] ==> Computed Property Name ==> to store the value of the variable not the name
    setActionBusy((p) => ({ ...p, [id]: true }));
    try {
      await adminService.activateUser(id);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, status: "active" as UserStatus } : u,
        ),
      );
    } catch (err: any) {
      setError(err?.message ?? "Failed to activate user.");
    } finally {
      setActionBusy((p) => ({ ...p, [id]: false }));
    }
  }

  async function handleDeactivate(id: string) {
    setActionBusy((p) => ({ ...p, [id]: true }));
    try {
      await adminService.deactivateUser(id);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, status: "blocked" as UserStatus } : u,
        ),
      );
    } catch (err: any) {
      setError(err?.message ?? "Failed to suspend user.");
    } finally {
      setActionBusy((p) => ({ ...p, [id]: false }));
    }
  }

  // Render 
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* ── Topbar — identical structure to admin/page.tsx ── */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="md:block">
          <h1 className="text-[15px] md:text-[17px] font-black text-[hsl(var(--color-text))] tracking-tight pl-11 md:pl-0">
            User Directory
          </h1>
          <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
            Manage all registered accounts and suspension statuses
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search — desktop */}
          <div className="relative items-center hidden sm:flex">
            <LuSearch className="absolute left-2.5 text-[13px] text-[hsl(var(--color-text-muted))]" />
            <input
              type="text"
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[12px] font-medium rounded-[10px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] w-[190px] outline-none focus:border-[hsl(var(--color-primary)/0.5)] focus:bg-[hsl(var(--color-bg-white))] transition-colors"
            />
          </div>
          {/* Refresh */}
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            title="Refresh"
            className="w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors disabled:opacity-50"
          >
            <LuRefreshCw
              className={`text-[14px] ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {/* Stat strip */}
        {pagination && !isLoading && (
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl px-3 py-2">
              <LuUsers className="text-[14px] text-primary" />
              <span className="text-[12px] font-black text-[hsl(var(--color-text))]">
                {pagination.totalCount}
              </span>
              <span className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">
                total users
              </span>
            </div>
            {roleFilter && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]">
                Filtered: {roleFilter}
              </span>
            )}
            {statusFilter && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))]">
                Status: {statusFilter}
              </span>
            )}
          </div>
        )}

        {/* Card */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4">
          {/* Card header */}
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <p className="text-[13px] font-black text-[hsl(var(--color-text))] uppercase tracking-[.04em]">
              All Users
            </p>
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto mt-2 sm:mt-0">
              {/* Mobile search */}
              <div className="relative flex items-center sm:hidden flex-1 sm:flex-none">
                <LuSearch className="absolute left-2.5 text-[12px] text-[hsl(var(--color-text-muted))]" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-7 pr-3 py-1.5 text-[11px] font-medium rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] w-full outline-none focus:border-[hsl(var(--color-primary)/0.5)] transition-colors"
                />
              </div>
              {/* Role & Status filters */}
              <div className="flex items-center gap-2 flex-1 sm:flex-none">
                <div className="relative flex items-center w-full sm:w-auto">
                  <LuFilter className="absolute left-2 text-[11px] text-[hsl(var(--color-text-muted))] pointer-events-none" />
                  <select
                    value={roleFilter}
                    onChange={(e) =>
                      setRoleFilter(e.target.value as UserRole | "")
                    }
                    className="pl-6 pr-6 py-1.5 text-[11px] font-semibold rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary)/0.5)] appearance-none cursor-pointer transition-colors w-full sm:w-auto"
                  >
                    {ROLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2 text-[10px] text-[hsl(var(--color-text-muted))] pointer-events-none">
                    ▾
                  </span>
                </div>
                
                {/* Status filter */}
                <div className="relative flex items-center w-full sm:w-auto">
                  <LuFilter className="absolute left-2 text-[11px] text-[hsl(var(--color-text-muted))] pointer-events-none" />
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as UserStatus | "")
                    }
                    className="pl-6 pr-6 py-1.5 text-[11px] font-semibold rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary)/0.5)] appearance-none cursor-pointer transition-colors w-full sm:w-auto"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2 text-[10px] text-[hsl(var(--color-text-muted))] pointer-events-none">
                    ▾
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 flex items-center gap-2.5 bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.2)] rounded-xl px-3.5 py-2.5">
              <LuTriangleAlert className="text-[hsl(var(--color-danger))] text-[14px] shrink-0" />
              <p className="text-[12px] font-semibold text-[hsl(var(--color-danger))] flex-1">
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className="text-[hsl(var(--color-danger))] text-[13px] font-black hover:opacity-70"
              >
                ✕
              </button>
            </div>
          )}

          {/* Table — scrollable on mobile */}
          <div className="overflow-x-auto -mx-4 px-4">
                {/* Desktop Table View */}
                <table className="w-full min-w-[600px] hidden lg:table">
                  <thead>
                    <tr className="border-b border-[hsl(var(--color-border))]">
                      {["User", "Email", "Role", "Status", "Joined", "Actions"].map(
                        (h, i) => (
                          <th
                            key={h}
                            className="pb-3 text-[10px] font-black text-[hsl(var(--color-text-muted))] uppercase tracking-[.07em] text-left pr-4"
                            style={{ textAlign: i === 5 ? "right" : "left" }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Loading */}
                    {isLoading &&
                      Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonRow key={i} />
                      ))}

                    {/* Empty */}
                    {!isLoading && !error && visible.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <LuInbox className="mx-auto text-[36px] text-[hsl(var(--color-text-muted))] opacity-30 mb-3" />
                          <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">
                            {debouncedSearch
                              ? "No users match your search."
                              : "No users found."}
                          </p>
                          {debouncedSearch && (
                            <button
                              onClick={() => setSearch("")}
                              className="mt-2 text-[11px] font-bold text-primary hover:underline"
                            >
                              Clear search
                            </button>
                          )}
                        </td>
                      </tr>
                    )}

                    {/* Rows */}
                    {!isLoading &&
                      visible.map((user) => {
                        const sc = statusConfig[user.status] ?? statusConfig.pending;
                        const rc = roleConfig[user.role] ?? roleConfig.patient;
                        return (
                          <tr
                            key={user._id}
                            className="border-b border-[hsl(var(--color-border-soft))] last:border-b-0 hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
                          >
                            {/* Name */}
                            <td className="py-3.5 pr-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${pickAvatar(user._id)}`}
                                >
                                  {getAvatarChars(user.fullName)}
                                </div>
                                <p className="text-[13px] font-bold text-[hsl(var(--color-text))] whitespace-nowrap">
                                  {user.fullName}
                                </p>
                              </div>
                            </td>
                            {/* Email */}
                            <td className="py-3.5 pr-4 max-w-[170px]">
                              <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] truncate">
                                {user.email}
                              </p>
                            </td>
                            {/* Role badge */}
                            <td className="py-3.5 pr-4">
                              <span
                                className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${rc.style}`}
                              >
                                {rc.label}
                              </span>
                            </td>
                            {/* Status badge */}
                            <td className="py-3.5 pr-4">
                              <span
                                className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${sc.style}`}
                              >
                                {sc.label}
                              </span>
                            </td>
                            {/* Joined */}
                            <td className="py-3.5 pr-4 text-[12px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
                              {fmtDate(user.createdAt)}
                            </td>
                            {/* Actions */}
                            <td className="py-3.5">
                              <RowActions
                                user={user}
                                busy={!!actionBusy[user._id]}
                                onActivate={handleActivate}
                                onDeactivate={handleDeactivate}
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>

                {/* Mobile Card View */}
                <div className="lg:hidden flex flex-col gap-4 py-2">
                  {/* Loading */}
                  {isLoading &&
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 border border-[hsl(var(--color-border))] h-32 animate-pulse" />
                    ))}

                  {/* Empty */}
                  {!isLoading && !error && visible.length === 0 && (
                    <div className="py-16 text-center">
                      <LuInbox className="mx-auto text-[36px] text-[hsl(var(--color-text-muted))] opacity-30 mb-3" />
                      <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">
                        {debouncedSearch ? "No users match your search." : "No users found."}
                      </p>
                    </div>
                  )}

                  {!isLoading &&
                    visible.map((user) => {
                      const sc = statusConfig[user.status] ?? statusConfig.pending;
                      const rc = roleConfig[user.role] ?? roleConfig.patient;
                      return (
                        <div key={user._id} className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 border border-[hsl(var(--color-border))]">
                          {/* Card Header: Avatar, Name, Role */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 ${pickAvatar(user._id)}`}>
                                {getAvatarChars(user.fullName)}
                              </div>
                              <div>
                                <p className="text-[14px] font-bold text-[hsl(var(--color-text))] leading-tight">{user.fullName}</p>
                                <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">{user.email}</p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${rc.style}`}>
                              {rc.label}
                            </span>
                          </div>
                          
                          {/* Card Body: Details */}
                          <div className="flex items-center justify-between mb-4 text-[12px] bg-[hsl(var(--color-bg-soft))] p-3 rounded-xl border border-[hsl(var(--color-border-soft))]">
                            <div>
                              <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-0.5">Joined</p>
                              <p className="font-semibold text-[hsl(var(--color-text))]">{fmtDate(user.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-0.5">Status</p>
                              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${sc.style}`}>
                                {sc.label}
                              </span>
                            </div>
                          </div>

                          {/* Card Footer: Actions */}
                          <div className="border-t border-[hsl(var(--color-border-soft))] pt-3 flex justify-end">
                            <RowActions
                              user={user}
                              busy={!!actionBusy[user._id]}
                              onActivate={handleActivate}
                              onDeactivate={handleDeactivate}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && !isLoading && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[hsl(var(--color-border))]">
              <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">
                Page {pagination.currentPage} of {pagination.totalPages} ·{" "}
                {pagination.totalCount} users
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isLoading}
                  className="w-[28px] h-[28px] flex items-center justify-center rounded-[7px] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <LuChevronLeft className="text-[13px]" />
                </button>

                {/* Windowed page pills */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - page) <= 1,
                  )
                  .reduce<(number | "…")[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1)
                      acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…" ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="text-[11px] text-[hsl(var(--color-text-muted))] px-0.5"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        disabled={isLoading}
                        className={`w-[28px] h-[28px] flex items-center justify-center rounded-[7px] text-[11px] font-bold border transition-colors ${
                          page === p
                            ? "bg-primary text-white border-primary"
                            : "border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))]"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page >= pagination.totalPages || isLoading}
                  className="w-[28px] h-[28px] flex items-center justify-center rounded-[7px] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <LuChevronRight className="text-[13px]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
