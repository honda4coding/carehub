"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LuTriangleAlert } from "react-icons/lu";

import { adminService } from "@/services/adminService";
import { AdminUser, UserRole, UserStatus, UsersPagination } from "@/types/user";
import Pagination from "@/components/ui/Pagination";

import DashboardHeader from "@/components/global/DashboardHeader";
import { LuRefreshCw } from "react-icons/lu";
import UsersFilters from "@/components/admin/users/UsersFilters";
import UsersList from "@/components/admin/users/UsersList";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 350;

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<UsersPagination | null>(null);
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [page, setPage] = useState(1);

  const [actionBusy, setActionBusy] = useState<Record<string, boolean>>({});

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

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsers({
        page,
        limit: PAGE_SIZE,
        ...(roleFilter ? { role: roleFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
      if (res.data.roleCounts) setRoleCounts(res.data.roleCounts);
      if (res.data.statusCounts) setStatusCounts(res.data.statusCounts);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, roleFilter, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);



  async function handleActivate(id: string) {
    setActionBusy((p) => ({ ...p, [id]: true }));
    try {
      await adminService.activateUser(id);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, status: "active" as UserStatus } : u))
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
        prev.map((u) => (u._id === id ? { ...u, status: "blocked" as UserStatus } : u))
      );
    } catch (err: any) {
      setError(err?.message ?? "Failed to suspend user.");
    } finally {
      setActionBusy((p) => ({ ...p, [id]: false }));
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <DashboardHeader
        title="User Directory"
        subtitle="Manage all registered accounts and suspension statuses"
        showBack={true}
        rightElement={
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            title="Refresh"
            className="w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-primary))] hover:text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            <LuRefreshCw className={`text-[14px] ${isLoading ? "animate-spin" : ""}`} />
          </button>
        }
      />

      <main className="flex-1 overflow-auto min-w-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm">
          <UsersFilters
            search={search}
            setSearch={setSearch}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            roleCounts={roleCounts}
            statusCounts={statusCounts}
          />

          {error && (
            <div className="mb-4 flex items-center gap-2.5 bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.2)] rounded-xl px-3.5 py-2.5">
              <LuTriangleAlert className="text-[hsl(var(--color-danger))] text-[14px] shrink-0" />
              <p className="text-[12px] font-semibold text-[hsl(var(--color-danger))] flex-1">
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className="text-[hsl(var(--color-danger))] text-[13px] font-black hover:opacity-70 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <UsersList
            users={users}
            isLoading={isLoading}
            error={error}
            debouncedSearch={debouncedSearch}
            setSearch={setSearch}
            actionBusy={actionBusy}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
          />

          {pagination && !isLoading && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setPage(page)}
            />
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
