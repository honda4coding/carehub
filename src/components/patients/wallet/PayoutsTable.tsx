"use client";

import { LuArrowDownToLine, LuClock, LuCircleCheck, LuCircleX } from "react-icons/lu";
import { PayoutRequest } from "@/services/walletService";
import dayjs from "dayjs";
import { Card } from "@/components/ui/Card";

interface PayoutsTableProps {
  payouts: PayoutRequest[];
  pagination: any;
  page: number;
  setPage: (page: number | ((p: number) => number)) => void;
}

export default function PayoutsTable({ payouts, pagination, page, setPage }: PayoutsTableProps) {
  return (
    <Card className="flex flex-col shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px overflow-hidden">
      <div className="p-5 border-b border-[hsl(var(--color-border))] flex items-center gap-2">
        <LuArrowDownToLine className="text-[hsl(var(--color-primary))]" />
        <h2 className="text-base font-bold tracking-tight text-[hsl(var(--color-text))]">Withdrawal Requests</h2>
      </div>
      
      {payouts.length === 0 ? (
        <div className="p-8 text-center text-[hsl(var(--color-text-muted))] text-sm font-medium flex-1 flex items-center justify-center">
          No withdrawal requests found.
        </div>
      ) : (
        <div className="flex flex-col flex-1 h-[400px]">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[hsl(var(--color-bg-base))] shadow-sm">
                <tr className="bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] text-xs uppercase tracking-widest">
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--color-border-soft))]">
                {payouts.map(p => (
                  <tr key={p._id} className="text-sm font-medium text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors">
                    <td className="p-4 whitespace-nowrap">{dayjs(p.createdAt).format('DD MMM, YYYY')}</td>
                    <td className="p-4 font-bold tracking-tight">{p.amount} EGP</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        {p.status === "pending" && (
                          <span className="flex items-center gap-1 text-[hsl(var(--color-warning))] bg-[hsl(var(--color-warning)/0.1)] px-2.5 py-1 rounded-md text-xs w-fit font-bold tracking-wide">
                            <LuClock/> Pending
                          </span>
                        )}
                        {p.status === "paid" && (
                          <>
                            <span className="flex items-center gap-1 text-[hsl(var(--color-success))] bg-[hsl(var(--color-success)/0.1)] px-2.5 py-1 rounded-md text-xs w-fit font-bold tracking-wide">
                              <LuCircleCheck/> Paid
                            </span>
                            {p.receiptPhoto?.secure_url && (
                              <button 
                                onClick={() => window.open(p.receiptPhoto!.secure_url, '_blank')}
                                className="text-xs font-bold text-[hsl(var(--color-success))] hover:underline text-left w-fit opacity-90"
                              >
                                View Receipt
                              </button>
                            )}
                          </>
                        )}
                        {p.status === "rejected" && (
                          <>
                            <span className="flex items-center gap-1 text-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger)/0.1)] px-2.5 py-1 rounded-md text-xs w-fit font-bold tracking-wide">
                              <LuCircleX/> Rejected
                            </span>
                            {p.adminNotes && (
                              <span className="text-xs text-[hsl(var(--color-danger))] font-medium max-w-[150px] leading-tight opacity-90">
                                {p.adminNotes}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
