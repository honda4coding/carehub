import React, { useState, useEffect, useRef } from "react";
import { LuArrowUpToLine, LuSearch, LuX } from "react-icons/lu";
import { walletService } from "@/services/walletService";
import { adminService } from "@/services/adminService";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { AdminUser } from "@/types/user";

interface ManualWalletAdjustmentFormProps {
  onSuccess: () => void;
}

export default function ManualWalletAdjustmentForm({ onSuccess }: ManualWalletAdjustmentFormProps) {
  const [targetUserId, setTargetUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [balanceType, setBalanceType] = useState("available");
  const [submitting, setSubmitting] = useState(false);

  // User search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AdminUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedUserBalances, setSelectedUserBalances] = useState<{ availableBalance: number, pendingBalance: number } | null>(null);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 400);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!debouncedSearch) {
      setSearchResults([]);
      return;
    }

    const fetchUsers = async () => {
      setIsSearching(true);
      try {
        const res = await adminService.getUsers({ search: debouncedSearch, limit: 10 });
        const filteredUsers = res.data.users.filter((u: AdminUser) => u.role !== 'assistant').slice(0, 5);
        setSearchResults(filteredUsers);
      } catch (err) {
        console.error("Failed to search users:", err);
      } finally {
        setIsSearching(false);
      }
    };

    fetchUsers();
  }, [debouncedSearch]);

  const handleSelectUser = async (user: AdminUser) => {
    setSelectedUser(user);
    setTargetUserId(user._id);
    setSearchQuery("");
    setShowDropdown(false);
    
    setLoadingBalances(true);
    try {
      const balances = await walletService.getUserWalletBalances(user._id);
      setSelectedUserBalances(balances);
    } catch (err: any) {
      toast.error("Failed to fetch user balances");
    } finally {
      setLoadingBalances(false);
    }
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setTargetUserId("");
    setSelectedUserBalances(null);
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || !amount || !reason) return;

    setSubmitting(true);
    try {
      await walletService.manualWalletAdjust({
        targetUserId,
        amount: Number(amount),
        reason,
        balanceType
      });
      toast.success("Wallet adjusted successfully");
      handleClearUser();
      setAmount("");
      setReason("");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl shadow-sm">
      <div className="p-5 border-b border-[hsl(var(--color-border))] flex items-center gap-2">
        <LuArrowUpToLine className="text-[hsl(var(--color-text-muted))]" />
        <h2 className="text-[16px] font-bold text-[hsl(var(--color-text))]">Manual Wallet Adjustment</h2>
      </div>
      <div className="p-6">
        {selectedUser && (loadingBalances || selectedUserBalances) && (
          <div className="mb-4 bg-[hsl(var(--color-primary)/0.05)] border border-[hsl(var(--color-primary)/0.2)] rounded-xl p-3 flex items-center gap-4 text-sm">
            <span className="font-bold text-[hsl(var(--color-primary-strong))]">User Balances:</span>
            {loadingBalances ? (
              <span className="text-[hsl(var(--color-text-muted))] animate-pulse">Loading...</span>
            ) : (
              <div className="flex gap-4">
                <span className="text-[hsl(var(--color-text))]"><span className="text-[hsl(var(--color-text-muted))]">Available:</span> {selectedUserBalances?.availableBalance || 0} EGP</span>
                <span className="text-[hsl(var(--color-text))]"><span className="text-[hsl(var(--color-text-muted))]">Pending:</span> {selectedUserBalances?.pendingBalance || 0} EGP</span>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleAdjust} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1 relative" ref={dropdownRef}>
            <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2">Target User</label>
            
            {selectedUser ? (
              <div className="w-full bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl px-3 py-1.5 h-[42px] text-[13px] font-medium flex items-center justify-between">
                <div className="flex flex-col overflow-hidden leading-tight">
                  <span className="text-[hsl(var(--color-text))] truncate font-bold">{selectedUser.fullName}</span>
                  <span className="text-[hsl(var(--color-text-muted))] text-[10px] truncate capitalize">{selectedUser.role} • ID: {selectedUser._id.slice(-6)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearUser}
                  className="p-1 hover:bg-[hsl(var(--color-bg-surface))] rounded-lg text-[hsl(var(--color-text-muted))] hover:text-red-500 transition-colors shrink-0 ml-1"
                >
                  <LuX className="text-[14px]" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[hsl(var(--color-text-muted))]" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search by name..."
                  className="w-full bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] rounded-xl pl-8 pr-4 py-2.5 text-[14px] font-medium focus:border-[hsl(var(--color-primary))] outline-none text-[hsl(var(--color-text))]"
                />
                
                {showDropdown && searchQuery && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-full md:w-[250px] lg:w-[300px] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl shadow-xl overflow-hidden z-50">
                    {isSearching ? (
                      <div className="p-4 text-center text-[13px] font-medium text-[hsl(var(--color-text-muted))]">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-[250px] overflow-y-auto">
                        {searchResults.map((user) => (
                          <div
                            key={user._id}
                            onClick={() => handleSelectUser(user)}
                            className="p-3 hover:bg-[hsl(var(--color-bg-soft))] cursor-pointer border-b border-[hsl(var(--color-border))] last:border-0 transition-colors flex items-center justify-between"
                          >
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-[hsl(var(--color-text))]">{user.fullName}</span>
                              <span className="text-[11px] font-medium text-[hsl(var(--color-text-muted))] capitalize">{user.role} • ID: {user._id.slice(-6)}</span>
                            </div>
                            <span className="text-[10px] font-bold bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text-muted))] px-2 py-1 rounded capitalize">
                              {user.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-[13px] font-medium text-[hsl(var(--color-text-muted))]">No users found</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2">Amount (EGP)</label>
            <input 
              type="number"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="-50 for debit"
              className="w-full bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] rounded-xl px-4 py-2.5 text-[14px] font-medium focus:border-[hsl(var(--color-primary))] outline-none text-[hsl(var(--color-text))]"
            />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2">Balance</label>
            <select
              value={balanceType}
              onChange={e => setBalanceType(e.target.value)}
              className="w-full bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] rounded-xl px-4 py-2.5 text-[14px] font-medium focus:border-[hsl(var(--color-primary))] outline-none text-[hsl(var(--color-text))]"
            >
              <option value="available">Available (Patient/Doc)</option>
              <option value="pending">Pending (Doc only)</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2">Reason</label>
            <input 
              type="text"
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Refund"
              className="w-full bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] rounded-xl px-4 py-2.5 text-[14px] font-medium focus:border-[hsl(var(--color-primary))] outline-none text-[hsl(var(--color-text))]"
            />
          </div>
          <div className="lg:col-span-1">
            <button 
              type="submit" 
              disabled={submitting || !targetUserId}
              className="w-full bg-[hsl(var(--color-primary))] text-[hsl(var(--color-text-inverse))] rounded-xl px-4 py-2.5 text-[14px] font-bold hover:bg-[hsl(var(--color-primary-strong))] disabled:opacity-50 h-[42px]"
            >
              {submitting ? "Processing..." : "Apply Adjust"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
