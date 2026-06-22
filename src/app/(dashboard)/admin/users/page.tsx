"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LuTriangleAlert } from "react-icons/lu";

import { adminService } from "@/services/adminService";
import { AdminUser, UserRole, UserStatus, UsersPagination } from "@/types/user";
import Pagination from "@/components/ui/Pagination";

import UsersHeader from "@/components/admin/users/UsersHeader";
import UsersFilters from "@/components/admin/users/UsersFilters";
import UsersList from "@/components/admin/users/UsersList";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 350;

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<UsersPagination | null>(null);
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
      });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const visible = debouncedSearch
    ? users.filter(
        (u) =>
          u.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : users;

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
      <UsersHeader
        pagination={pagination}
        isLoading={isLoading}
        onRefresh={fetchUsers}
      />

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm">
          <UsersFilters
            search={search}
            setSearch={setSearch}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
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
            users={visible}
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
      </main>
    </div>
  );
}
