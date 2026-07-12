import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, StatusPill } from "@/components/app/page-header";
import {
  Plus, Download, ArrowUpRight, ArrowDownRight, TrendingUp,
  Package, Users, Wrench, CalendarClock, AlertTriangle, ArrowRight,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";

export const Route = createFileRoute("/app/dashboard")({ component: Dashboard });

const utilization = [
  { name: "Engineering", allocated: 42, available: 18 },
  { name: "Facilities", allocated: 28, available: 12 },
  { name: "Field Ops", allocated: 34, available: 6 },
  { name: "Design", allocated: 18, available: 14 },
  { name: "Finance", allocated: 12, available: 20 },
  { name: "IT", allocated: 26, available: 10 },
];

const maintenance = [
  { m: "Jan", opened: 12, resolved: 10 },
  { m: "Feb", opened: 18, resolved: 15 },
  { m: "Mar", opened: 22, resolved: 20 },
  { m: "Apr", opened: 16, resolved: 18 },
  { m: "May", opened: 24, resolved: 21 },
  { m: "Jun", opened: 20, resolved: 22 },
  { m: "Jul", opened: 28, resolved: 24 },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Today's Overview"
        description="Live utilization, requests and maintenance across every department in Acme Industries."
        actions={
          <>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm font-medium hover:border-primary/40 hover:text-primary">
              <Download className="h-4 w-4" /> Export
            </button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              <Plus className="h-4 w-4" /> Register asset
            </button>
          </>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total assets" value="1,284" delta="+3.2%" up icon={Package} sub="128 added this quarter" />
        <Kpi label="Allocated" value="768" delta="+8 today" up icon={Users} sub="59.8% utilization" />
        <Kpi label="Active bookings" value="9" delta="3 pending" icon={CalendarClock} sub="Next: Room B2 · 2:00 PM" />
        <Kpi label="Open maintenance" value="14" delta="-4 vs last week" up icon={Wrench} sub="2 critical, 6 in progress" tone="warning" />
      </div>

      {/* Alert strip */}
      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/70 px-4 py-3 text-sm">
        <AlertTriangle className="mt-0.5 h-4.5 w-4.5 text-[--color-destructive]" />
        <div className="flex-1">
          <div className="font-semibold text-[--color-destructive]">3 assets overdue for return</div>
          <div className="text-[13px] text-red-900/70">
            Flagged for follow-up · Assigned to Facilities operations · Last reminder sent 4h ago
          </div>
        </div>
        <button className="text-[13px] font-semibold text-[--color-destructive] hover:underline">Review now</button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Section
          className="lg:col-span-2"
          title="Department utilization"
          description="Allocated vs available capacity by department"
          actions={
            <div className="flex items-center gap-1.5 text-xs">
              <Legend color="var(--color-blue-700)" label="Allocated" />
              <Legend color="var(--color-blue-200)" label="Available" />
            </div>
          }
        >
          <div className="h-[280px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilization} barCategoryGap={22}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                <Tooltip cursor={{ fill: "rgba(0,119,182,0.06)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="allocated" stackId="a" fill="var(--color-blue-700)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="available" stackId="a" fill="var(--color-blue-200)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Maintenance trend" description="Opened vs resolved" >
          <div className="h-[280px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={maintenance}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-blue-500)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-blue-500)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-blue-800)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--color-blue-800)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="opened" stroke="var(--color-blue-500)" strokeWidth={2} fill="url(#g1)" />
                <Area type="monotone" dataKey="resolved" stroke="var(--color-blue-800)" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Section className="lg:col-span-2" title="Recent assets" description="Latest registrations across the workspace" actions={
          <button className="text-[12.5px] font-semibold text-primary hover:text-primary-hover">View all</button>
        }>
          <table className="w-full text-sm">
            <thead className="text-[11.5px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-5 py-2.5 text-left font-semibold">Tag</th>
                <th className="px-5 py-2.5 text-left font-semibold">Name</th>
                <th className="px-5 py-2.5 text-left font-semibold">Assignee</th>
                <th className="px-5 py-2.5 text-left font-semibold">Status</th>
                <th className="px-5 py-2.5 text-right font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["AF-0114", "Dell Latitude 7440", "Priya Shah · Engineering", "green", "Allocated", "2m ago"],
                ["AF-0062", "Epson Projector L850", "HQ Floor 2 · Meeting", "amber", "Maintenance", "18m ago"],
                ["AF-0201", "Ergonomic Chair — Grey", "Warehouse", "blue", "Available", "1h ago"],
                ["AF-0308", "iPad Pro 12.9 M4", "Ravi Menon · Design", "green", "Allocated", "3h ago"],
                ["AF-0442", "Ricoh MP C4504", "Bengaluru · Floor 4", "blue", "Available", "5h ago"],
              ].map(([tag, name, who, tone, status, t]) => (
                <tr key={tag as string} className="hover:bg-secondary/40">
                  <td className="px-5 py-3 font-mono text-[12.5px] font-medium text-primary">{tag}</td>
                  <td className="px-5 py-3 font-medium">{name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{who}</td>
                  <td className="px-5 py-3"><StatusPill tone={tone as any}>{status as string}</StatusPill></td>
                  <td className="px-5 py-3 text-right text-muted-foreground">{t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <div className="space-y-6">
          <Section title="Recent activity">
            <ol className="relative space-y-4 px-5 py-4">
              {[
                { t: "Laptop AF-0114 allocated to Priya Shah", d: "IT · 2 min ago", tone: "blue" },
                { t: "Room B2 booking confirmed 2:00–3:00 PM", d: "Facilities · 18 min ago", tone: "green" },
                { t: "Projector AF-0062 maintenance resolved", d: "Field Ops · 42 min ago", tone: "green" },
                { t: "Transfer request submitted for AF-0308", d: "Design · 1h ago", tone: "blue" },
                { t: "Overdue return flagged for AF-0091", d: "Alerts · 3h ago", tone: "red" },
              ].map((a, i, arr) => (
                <li key={i} className="relative pl-6">
                  {i < arr.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-border" />}
                  <span className={`absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full ring-4 ring-white ${
                    a.tone === "green" ? "bg-[--color-success]" : a.tone === "red" ? "bg-[--color-destructive]" : "bg-primary"
                  }`} />
                  <div className="text-[13px] font-medium leading-snug text-foreground">{a.t}</div>
                  <div className="text-[11.5px] text-muted-foreground">{a.d}</div>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Upcoming returns" actions={<span className="text-[11.5px] text-muted-foreground">Next 7 days</span>}>
            <ul className="divide-y divide-border">
              {[
                ["Dell Latitude 7440", "Due Tue, 15 Jul", "AF-0114"],
                ["Sony A7 IV Camera", "Due Wed, 16 Jul", "AF-0088"],
                ["Bose QC Headset", "Due Fri, 18 Jul", "AF-0219"],
              ].map(([n, d, t]) => (
                <li key={t} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-primary">
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium">{n}</div>
                    <div className="text-[11.5px] text-muted-foreground">{t} · {d}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

const tooltipStyle: React.CSSProperties = {
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  background: "white",
  fontSize: 12,
  boxShadow: "0 4px 20px -6px rgba(10,37,64,0.1)",
};

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

function Kpi({
  label, value, delta, up, icon: Icon, sub, tone,
}: {
  label: string; value: string; delta: string; up?: boolean;
  icon: any; sub: string; tone?: "warning";
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-elevated">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 text-[28px] font-semibold leading-none tracking-tight text-blue-800">{value}</div>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${
          tone === "warning" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-primary"
        }`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">{sub}</span>
        <span className={`inline-flex items-center gap-0.5 text-[11.5px] font-semibold ${
          up ? "text-[--color-success]" : "text-muted-foreground"
        }`}>
          {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
          {delta}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
