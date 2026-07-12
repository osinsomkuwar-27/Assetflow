import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/app/page-header";
import { Download, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/reports")({ component: Reports });

function Reports() {
  const [stats, setStats] = useState<any>({});
  const [utilization, setUtilization] = useState<any[]>([]);
  const [deptSummary, setDeptSummary] = useState<any[]>([]);
  const [maintFreq, setMaintFreq] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [dueMaint, setDueMaint] = useState<any[]>([]);
  const [nearRetirement, setNearRetirement] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, utilRes, deptRes, maintRes, heatRes, dueRes, retireRes] = await Promise.all([
          api.get<any>("/api/reports/stats").catch(() => ({})),
          api.get<any>("/api/reports/utilization").catch(() => ({ byStatus: {} })),
          api.get<any[]>("/api/reports/department-summary").catch(() => []),
          api.get<any>("/api/reports/maintenance-frequency").catch(() => ({ byAsset: [] })),
          api.get<any[]>("/api/reports/booking-heatmap").catch(() => []),
          api.get<any[]>("/api/reports/assets-due-maintenance").catch(() => []),
          api.get<any[]>("/api/reports/assets-nearing-retirement").catch(() => []),
        ]);

        setStats(statsRes);

        // Build utilization chart data from stats
        const byStatus = utilRes.byStatus || {};
        setUtilization([
          { name: "Available", value: byStatus.Available || 0 },
          { name: "Allocated", value: byStatus.Allocated || 0 },
          { name: "Maintenance", value: byStatus.UnderMaintenance || 0 },
          { name: "Reserved", value: byStatus.Reserved || 0 },
          { name: "Lost", value: byStatus.Lost || 0 },
          { name: "Retired", value: byStatus.Retired || 0 },
        ]);

        setDeptSummary(deptRes);

        // Maintenance frequency
        const byAsset = maintRes.byAsset || [];
        setMaintFreq(byAsset.slice(0, 10));

        setHeatmap(heatRes);
        setDueMaint(dueRes);
        setNearRetirement(retireRes);
      } catch (err) {
        console.error("Reports fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Utilization, department summary, maintenance efficiency and booking demand across the enterprise."
        actions={
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
            <Download className="h-4 w-4" /> Export report
          </button>
        }
      />

      {/* Top-line KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Kpi label="Total Assets" value={stats.totalAssets?.toString() || "0"} />
        <Kpi label="Active Allocations" value={stats.activeAllocations?.toString() || "0"} />
        <Kpi label="Open Maintenance" value={stats.openMaintenance?.toString() || "0"} />
        <Kpi label="Active Bookings" value={stats.activeBookings?.toString() || "0"} />
      </div>

      {/* Utilization by Status */}
      <Section title="Asset Utilization by Status" description="Current distribution of asset lifecycle states">
        <div className="h-[300px] p-5">
          {utilization.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No utilization data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilization} barCategoryGap={22}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                <Tooltip cursor={{ fill: "rgba(0,119,182,0.06)" }} contentStyle={tt} />
                <Bar dataKey="value" fill="var(--color-blue-600)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Department Summary */}
        <Section title="Department-wise Summary" description="Asset count breakdown by department and status">
          {deptSummary.length === 0 ? (
            <div className="p-5 text-center text-sm text-muted-foreground">No department data available.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-[11.5px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-5 py-2.5 text-left font-semibold">Department</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Available</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Allocated</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Maintenance</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deptSummary.map((d: any) => (
                  <tr key={d.departmentName} className="hover:bg-secondary/40">
                    <td className="px-5 py-3 font-medium">{d.departmentName}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{d.Available || 0}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{d.Allocated || 0}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{d.UnderMaintenance || 0}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{d.total || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        {/* Maintenance Frequency */}
        <Section title="Maintenance Frequency" description="Top assets by maintenance request count">
          {maintFreq.length === 0 ? (
            <div className="p-5 text-center text-sm text-muted-foreground">No maintenance frequency data.</div>
          ) : (
            <div className="h-[280px] p-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintFreq} layout="vertical" barCategoryGap={8}>
                  <CartesianGrid horizontal={false} stroke="var(--color-border)" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                  <YAxis
                    type="category"
                    dataKey="assetTag"
                    tickLine={false}
                    axisLine={false}
                    width={90}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  />
                  <Tooltip contentStyle={tt} />
                  <Bar dataKey="count" fill="var(--color-blue-500)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Assets Due Maintenance */}
        <Section title="Assets Due for Maintenance" description="Based on last servicing schedule">
          {dueMaint.length === 0 ? (
            <div className="p-5 text-center text-sm text-muted-foreground">No assets are flagged for upcoming maintenance.</div>
          ) : (
            <ul className="divide-y divide-border">
              {dueMaint.map((a: any) => (
                <li key={a.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-[13px] font-medium">{a.name}</div>
                    <div className="text-[11.5px] text-muted-foreground">{a.assetTag}</div>
                  </div>
                  <span className="text-[12px] text-amber-700 font-semibold">Due</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Assets Nearing Retirement */}
        <Section title="Assets Nearing Retirement" description="Based on age and lifecycle parameters">
          {nearRetirement.length === 0 ? (
            <div className="p-5 text-center text-sm text-muted-foreground">No assets nearing end-of-life.</div>
          ) : (
            <ul className="divide-y divide-border">
              {nearRetirement.map((a: any) => (
                <li key={a.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-[13px] font-medium">{a.name}</div>
                    <div className="text-[11.5px] text-muted-foreground">{a.assetTag}</div>
                  </div>
                  <span className="text-[12px] text-muted-foreground font-semibold">Retiring</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

const tt: React.CSSProperties = {
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  background: "white",
  fontSize: 12,
  boxShadow: "0 4px 20px -6px rgba(10,37,64,0.1)",
};

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-[28px] font-semibold text-blue-800">{value}</div>
    </div>
  );
}
