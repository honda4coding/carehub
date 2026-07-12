"use client";

import { LuHistory } from "react-icons/lu";
import { Transaction } from "@/services/walletService";
import dayjs from "dayjs";
import { Card } from "@/components/ui/Card";

interface TransactionTableProps {
  transactions: Transaction[];
  pagination: any;
  page: number;
  setPage: (page: number | ((p: number) => number)) => void;
}

export default function TransactionTable({ transactions, pagination, page, setPage }: TransactionTableProps) {
  return (
    <Card className="flex flex-col shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px overflow-hidden">
      <div className="p-5 border-b border-[hsl(var(--color-border))] flex items-center gap-2">
        <LuHistory className="text-[hsl(var(--color-primary))]" />
        <h2 className="text-base font-bold tracking-tight text-[hsl(var(--color-text))]">Recent Transactions</h2>
      </div>
      
      {transactions.length === 0 ? (
        <div className="p-8 text-center text-[hsl(var(--color-text-muted))] text-sm font-medium">No transactions found.</div>
      ) : (
        <div className="flex flex-col flex-1 h-[400px]">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[hsl(var(--color-bg-base))] shadow-sm">
                <tr className="bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] text-xs uppercase tracking-widest">
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--color-border-soft))]">
                {transactions.map(t => {
                  const isDebit = t.amount < 0 || ['debit', 'online_booking_payment', 'payout_withdrawal', 'cancellation_fee', 'platform_commission'].includes(t.type);
                  const isCredit = !isDebit;
                  const displayAmount = Math.abs(t.amount);
                  return (
                    <tr key={t._id} className="text-sm font-medium text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors">
                      <td className="p-4 whitespace-nowrap">{dayjs(t.createdAt).format('DD MMM, YYYY')}</td>
                      <td className="p-4 font-semibold opacity-90">{t.type.replace(/_/g, ' ')}</td>
                      <td className={`p-4 font-bold tracking-tight text-right ${isCredit ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]'}`}>
                        {isCredit ? '+' : '-'}{displayAmount} EGP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-[hsl(var(--color-border))] flex justify-between items-center bg-[hsl(var(--color-bg-soft))] mt-auto">
              <button 
                disabled={page === 1} 
                onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                className="px-4 py-1.5 bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-[hsl(var(--color-border-soft))] transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-bold tracking-wide text-[hsl(var(--color-text-muted))]">Page {page} of {pagination.totalPages}</span>
              <button 
                disabled={page === pagination.totalPages} 
                onClick={() => setPage((p: number) => p + 1)}
                className="px-4 py-1.5 bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-[hsl(var(--color-border-soft))] transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
