import React from "react";
import { LuInbox, LuShieldCheck, LuShieldOff } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { AdminUser, UserRole, UserStatus } from "@/types/user";
import { useTranslations } from "next-intl";

// --- Helpers & Configs ---
export const statusConfig: Record<UserStatus, { style: string; label: string }> = {
  active: {
    style: "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
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
    style: "bg-[hsl(var(--color-border))] text-[hsl(var(--color-text))]",
    label: "Rejected",
  },
};

export const roleConfig: Record<UserRole, { style: string; label: string }> = {
  doctor: {
    style: "text-[hsl(var(--color-primary))]",
    label: "Doctor",
  },
  patient: {
    style: "text-[hsl(var(--color-secondary-strong))]",
    label: "Patient",
  },
  admin: {
    style: "text-[hsl(var(--color-warning))]",
    label: "Admin",
  },
};

const AVATAR_STYLES = [
  "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
  "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]",
  "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
  "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
];

export function getAvatarChars(name: string) {
  return name
    .split(" ")
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function pickAvatar(id: string) {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_STYLES[sum % AVATAR_STYLES.length];
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SkeletonRow() {
    const t = useTranslations("auto");
  return (
    <tr className="border-b border-[hsl(var(--color-border-soft))]">
      {[80, 65, 40, 40, 50, 55].map((w, i) => (
        <td key={i} className="py-3 pe-4">
          <div
            className="h-3 rounded-full bg-[hsl(var(--color-bg-soft))] animate-pulse"
            style={{ width: `${w}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

interface RowActionsProps {
  user: AdminUser;
  busy: boolean;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
}

function RowActions({ user, busy, onActivate, onDeactivate }: RowActionsProps) {
    const t = useTranslations("auto");
  if (user.role === "admin") {
    return null;
  }

  const canActivate = user.status === "blocked";
  const canDeactivate = user.status === "active";

  return (
    <div className="flex items-center gap-1.5 justify-start">
      {canActivate && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onActivate(user._id)}
          disabled={busy}
          title={t('activateUser')}
          isLoading={busy}
          icon={LuShieldCheck}
          className="!text-[11px] !px-3 !py-1.5 !h-auto !rounded-[8px] text-[hsl(var(--color-success))] border-[hsl(var(--color-success)/0.3)] hover:bg-[hsl(var(--color-success-bg))] hover:text-[hsl(var(--color-success))] hover:border-[hsl(var(--color-success)/0.5)]"
        >
          {t('activate')}</Button>
      )}
      {canDeactivate && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDeactivate(user._id)}
          disabled={busy}
          title={t('suspendUser')}
          isLoading={busy}
          icon={LuShieldOff}
          className="!text-[11px] !px-3 !py-1.5 !h-auto !rounded-[8px] text-[hsl(var(--color-danger))] border-[hsl(var(--color-danger)/0.3)] hover:bg-[hsl(var(--color-danger-bg))] hover:text-[hsl(var(--color-danger))] hover:border-[hsl(var(--color-danger)/0.5)]"
        >
          {t('deactivate')}</Button>
      )}
    </div>
  );
}

interface UsersListProps {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
  debouncedSearch: string;
  setSearch: (val: string) => void;
  actionBusy: Record<string, boolean>;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
}

export default function UsersList({
  users,
  isLoading,
  error,
  debouncedSearch,
  setSearch,
  actionBusy,
  onActivate,
  onDeactivate,
}: UsersListProps) {
    const t = useTranslations("auto");
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      {/* Desktop Table View */}
      <table className="w-full min-w-[600px] hidden lg:table">
        <thead>
          <tr className="border-b border-[hsl(var(--color-border))]">
            {["User", "Email", "Role", "Joined", "Status", "Actions"].map((h) => (
              <th
                key={h}
                className="pb-3 text-[12px] font-black text-[hsl(var(--color-text))] uppercase tracking-[.07em] text-start pe-4"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Loading */}
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

          {/* Empty */}
          {!isLoading && !error && users.length === 0 && (
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
                    className="mt-2 text-[11px] font-bold text-[hsl(var(--color-primary))] hover:underline cursor-pointer"
                  >
                    {t('clearSearch')}</button>
                )}
              </td>
            </tr>
          )}

          {/* Rows */}
          {!isLoading &&
            users.map((user) => {
              const sc = statusConfig[user.status] ?? statusConfig.pending;
              const rc = roleConfig[user.role] ?? roleConfig.patient;
              return (
                <tr
                  key={user._id}
                  className="border-b border-[hsl(var(--color-border-soft))] last:border-b-0 hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
                >
                  <td className="py-3.5 pe-4 text-start">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 ${pickAvatar(
                          user._id
                        )}`}
                      >
                        {getAvatarChars(user.fullName)}
                      </div>
                      <div className="text-start">
                        <p className="text-[14px] font-bold text-[hsl(var(--color-text))] whitespace-nowrap leading-tight">
                          {user.fullName}
                        </p>
                        {user.role === "admin" && (
                          <p className="text-[11px] font-bold italic text-[hsl(var(--color-text-muted))] mt-0.5">
                            {t('protectedAccount')}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pe-4 max-w-[170px] text-start">
                    <p className="text-[13px] font-semibold text-[hsl(var(--color-text-muted))] truncate">
                      {user.email}
                    </p>
                  </td>
                  <td className="py-3.5 pe-4 text-start">
                    <span className={`text-[13px] font-bold whitespace-nowrap ${rc.style}`}>
                      {rc.label}
                    </span>
                  </td>
                  <td className="py-3.5 pe-4 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap text-start">
                    {fmtDate(user.createdAt)}
                  </td>
                  <td className="py-3.5 pe-4 text-start">
                    <span
                      className={`inline-flex items-center text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${sc.style}`}
                    >
                      {sc.label}
                    </span>
                  </td>
                  <td className="py-3.5 pe-4">
                    <div className="flex justify-start">
                      <RowActions
                        user={user}
                        busy={!!actionBusy[user._id]}
                        onActivate={onActivate}
                        onDeactivate={onDeactivate}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="lg:hidden flex flex-col gap-4 py-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 border border-[hsl(var(--color-border))] h-32 animate-pulse"
            />
          ))}

        {!isLoading && !error && users.length === 0 && (
          <div className="py-16 text-center">
            <LuInbox className="mx-auto text-[36px] text-[hsl(var(--color-text-muted))] opacity-30 mb-3" />
            <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">
              {debouncedSearch ? "No users match your search." : "No users found."}
            </p>
          </div>
        )}

        {!isLoading &&
          users.map((user) => {
            const sc = statusConfig[user.status] ?? statusConfig.pending;
            const rc = roleConfig[user.role] ?? roleConfig.patient;
            return (
              <div
                key={user._id}
                className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 border border-[hsl(var(--color-border))]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 ${pickAvatar(
                        user._id
                      )}`}
                    >
                      {getAvatarChars(user.fullName)}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[hsl(var(--color-text))] leading-tight">
                        {user.fullName}
                      </p>
                      <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${rc.style}`}
                  >
                    {rc.label}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4 text-[12px] bg-[hsl(var(--color-bg-soft))] p-3 rounded-xl border border-[hsl(var(--color-border-soft))]">
                  <div>
                    <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-0.5">
                      {t('joined')}</p>
                    <p className="font-semibold text-[hsl(var(--color-text))]">
                      {fmtDate(user.createdAt)}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-0.5">
                      {t('status')}</p>
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${sc.style}`}
                    >
                      {sc.label}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[hsl(var(--color-border-soft))] pt-3 flex justify-end">
                  <RowActions
                    user={user}
                    busy={!!actionBusy[user._id]}
                    onActivate={onActivate}
                    onDeactivate={onDeactivate}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
