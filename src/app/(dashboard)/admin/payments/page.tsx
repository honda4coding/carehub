"use client";

import { useEffect, useState } from "react";
import { 
  LuCreditCard as LuCreditCardIcon, 
  LuTrendingUp as LuTrendingUpIcon, 
  LuChartPie as LuChartPieIcon, 
  LuActivity as LuActivityIcon, 
  LuCircleAlert as LuCircleAlertIcon 
} from "react-icons/lu";

import DashboardHeader from "@/components/global/DashboardHeader";
import { adminService } from "@/services/adminService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await adminService.getPaymentAnalytics();
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load payment analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <DashboardHeader
          title="Payment Analytics"
          subtitle="Revenue and transaction statistics"
        />
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-32 rounded-2xl bg-[hsl(var(--color-border-soft))]" />
          <div className="h-64 rounded-2xl bg-[hsl(var(--color-border-soft))]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
        <DashboardHeader
          title="Payment Analytics"
          subtitle="Revenue and transaction statistics"
        />
        <div className="p-6">
          <div className="flex flex-col items-center justify-center p-12 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl">
            <LuCircleAlertIcon className="text-4xl text-[hsl(var(--color-danger))] mb-4" />
            <p className="text-[14px] font-bold text-[hsl(var(--color-text))]">{error || "No data available"}</p>
          </div>
        </div>
      </div>
    );
  }

  const { totalRevenue, revenueByPurpose, monthlyRevenue, recentTransactions } = data;

  const lineChartData = {
    labels: monthlyRevenue.map((item: any) => item.month),
    datasets: [
      {
        label: "Revenue",
        data: monthlyRevenue.map((item: any) => item.total),
        borderColor: "hsl(var(--color-primary))",
        backgroundColor: "hsla(var(--color-primary), 0.1)",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const pieChartData = {
    labels: revenueByPurpose.map((item: any) => item.purpose.toUpperCase()),
    datasets: [
      {
        data: revenueByPurpose.map((item: any) => item.total),
        backgroundColor: [
          "hsl(var(--color-primary))",
          "hsl(var(--color-success))",
          "hsl(var(--color-warning))",
          "hsl(var(--color-danger))",
          "#8b5cf6",
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
      <DashboardHeader
        title="Payment Analytics"
        subtitle="Revenue and transaction statistics"
      />

      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[14px] font-bold text-[hsl(var(--color-text-muted))]">Total Revenue</span>
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-success-bg))] flex items-center justify-center text-[hsl(var(--color-success))]">
                <LuCreditCardIcon className="text-xl" />
              </div>
            </div>
            <div>
              <p className="text-[32px] font-black text-[hsl(var(--color-text))]">${totalRevenue.toLocaleString()}</p>
              <p className="text-[12px] font-semibold text-[hsl(var(--color-success))] mt-1 flex items-center gap-1">
                <LuTrendingUpIcon /> All time earnings
              </p>
            </div>
          </div>

          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[14px] font-bold text-[hsl(var(--color-text-muted))]">Recent Transactions</span>
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-warning-bg))] flex items-center justify-center text-[hsl(var(--color-warning))]">
                <LuActivityIcon className="text-xl" />
              </div>
            </div>
            <div>
              <p className="text-[32px] font-black text-[hsl(var(--color-text))]">{recentTransactions.length}</p>
              <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-1">
                Most recent logs
              </p>
            </div>
          </div>
          
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[14px] font-bold text-[hsl(var(--color-text-muted))]">Revenue Streams</span>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <LuChartPieIcon className="text-xl" />
              </div>
            </div>
            <div>
              <p className="text-[32px] font-black text-[hsl(var(--color-text))]">{revenueByPurpose.length}</p>
              <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-1">
                Distinct categories
              </p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6">
            <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-6">Revenue Overview (Last 6 Months)</h3>
            <div className="h-64">
              <Line 
                data={lineChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }} 
              />
            </div>
          </div>

          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 flex flex-col items-center">
            <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-6 self-start">Revenue by Purpose</h3>
            <div className="h-64 w-full flex justify-center">
              <Pie 
                data={pieChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'right' } }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[hsl(var(--color-border))]">
            <h3 className="text-[16px] font-black text-[hsl(var(--color-text))]">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[hsl(var(--color-bg-base))] border-b border-[hsl(var(--color-border))]">
                <tr>
                  <th className="p-4 text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase">Date</th>
                  <th className="p-4 text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase">User</th>
                  <th className="p-4 text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase">Purpose</th>
                  <th className="p-4 text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase">Amount</th>
                  <th className="p-4 text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--color-border))]">
                {recentTransactions.map((tx: any) => (
                  <tr key={tx._id} className="hover:bg-[hsl(var(--color-bg-base))] transition-colors">
                    <td className="p-4 text-[13px] font-semibold text-[hsl(var(--color-text))]">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-[13px] font-semibold text-[hsl(var(--color-text))]">
                      {tx.userId?.fullName || "Unknown"}
                      <div className="text-[11px] text-[hsl(var(--color-text-muted))] font-medium">{tx.userId?.email}</div>
                    </td>
                    <td className="p-4 text-[13px] font-bold text-[hsl(var(--color-text))] capitalize">
                      {tx.purpose}
                    </td>
                    <td className="p-4 text-[13px] font-black text-[hsl(var(--color-text))]">
                      ${tx.amount}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[11px] font-black uppercase ${
                        tx.paymentStatus === 'completed' 
                          ? 'bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]' 
                          : 'bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]'
                      }`}>
                        {tx.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[13px] font-semibold text-[hsl(var(--color-text-muted))]">
                      No recent transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

