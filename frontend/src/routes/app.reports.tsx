import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/app/page-header";
import { Download, Calendar, Filter } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export const Route = createFileRoute("/app/reports")({ component: Reports });

const util = Array.from({ length: 12 }).map((_, i) => ({
  m: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  utilization: 40 + Math.round(Math.sin(i / 2) * 15) + i * 2,
  target: 65,
}));

const category = [
  { name: "Electronics", value: 512 },
  { name: "Furniture", value: 244 },
  { name: "Tools", value: 168 },
  { name: "Peripherals", value: 220 },
  { name: "Vehicles", value: 140 },
];

const bookingLoad = [
  { d: "Mon", v: 22 }, { d: "Tue", v: 34 }, { d: "Wed", v: 41 },
  { d: "Thu", v: 30 }, { d: "Fri", v: 46 }, { d: "Sat", v: 12 }, { d: "Sun", v: 6 },
];

const mtbf = [
  { m: "Q1", mtbf: 128, mttr: 6 }, { m: "Q2", mtbf: 144, mttr: 5 },
  { m: "Q3", mtbf: 156, mttr: 4 }, { m: "Q4", mtbf: 170, mttr: 3.5 },
];

const heat = Array.from({ length: 7 }, (_, r) => Array.from({ length: 10 }, (_, c) => Math.round(Math.max(0, Math.sin((r + c) / 2) * 5 + 3 + (c === r ? 4 : 0)))));

const blues = ["#0a2540", "#025f92", "#0077b6", "#0096c7", "#4a99bd"];

function Reports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Utilization, category mix, maintenance efficiency and booking demand across the enterprise."
        actions={
          <>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm font-medium hover:border-primary/40 hover:text-primary">
              <Calendar className="h-4 w-4" /> Last 12 months
            </button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm font-medium hover:border-primary/40 hover:text-primary">
              <Filter className="h-4 w-4" /> Segments
            </button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              <Download className="h-4 w-4" /> Export report
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label="Overall utilization" value="68.2%" delta="+4.1 pts" />
        <Kpi label="Mean time to repair" value="3.5 days" delta="-0.6 vs Q3" />
        <Kpi label="Booking demand" value="1,204 hrs" delta="+12%" />
      </div>

      <Section title="Utilization vs target" description="Monthly utilization rate against the 65% enterprise target">
        <div className="h-[320px] p-5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={util}>
              <defs>
                <linearGradient id="u1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-blue-500)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-blue-500)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
              <Tooltip contentStyle={tt} />
              <Area type="monotone" dataKey="utilization" stroke="var(--color-blue-700)" strokeWidth={2.5} fill="url(#u1)" />
              <Line type="monotone" dataKey="target" stroke="var(--color-blue-300)" strokeDasharray="5 4" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Section title="Assets by category" className="lg:col-span-1">
          <div className="h-[280px] p-5">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={category} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {category.map((_, i) => <Cell key={i} fill={blues[i % blues.length]} />)}
                </Pie>
                <Tooltip contentStyle={tt} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="divide-y divide-border text-[13px]">
            {category.map((c, i) => (
              <li key={c.name} className="flex items-center gap-2.5 px-5 py-2.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: blues[i] }} />
                <span className="flex-1">{c.name}</span>
                <span className="font-semibold tabular-nums">{c.value}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Booking demand" className="lg:col-span-2" description="Booked hours per weekday · last 4 weeks">
          <div className="h-[320px] p-5">
            <ResponsiveContainer>
              <BarChart data={bookingLoad}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                <Tooltip cursor={{ fill: "rgba(0,119,182,0.06)" }} contentStyle={tt} />
                <Bar dataKey="v" fill="var(--color-blue-600)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Section title="Reliability trend" description="MTBF (hrs) & MTTR (days) by quarter" className="lg:col-span-1">
          <div className="h-[260px] p-5">
            <ResponsiveContainer>
              <LineChart data={mtbf}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                <Tooltip contentStyle={tt} />
                <Line type="monotone" dataKey="mtbf" stroke="var(--color-blue-700)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="mttr" stroke="var(--color-blue-400)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Utilization heatmap" description="Hours (rows: weekday · cols: hour of day)" className="lg:col-span-2">
          <div className="p-5">
            <div className="flex items-center gap-2 pl-10 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {["8", "9", "10", "11", "12", "13", "14", "15", "16", "17"].map((h) => (
                <div key={h} className="flex-1 text-center">{h}</div>
              ))}
            </div>
            <div className="mt-1 space-y-1">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, r) => (
                <div key={d} className="flex items-center gap-2">
                  <div className="w-8 text-[11px] font-semibold text-muted-foreground">{d}</div>
                  <div className="flex flex-1 gap-1">
                    {heat[r].map((v, c) => {
                      const alpha = Math.min(1, 0.08 + v / 10);
                      return (
                        <div key={c} className="aspect-square flex-1 rounded"
                          style={{ background: `rgba(0,119,182,${alpha})` }}
                          title={`${v} bookings`} />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
              Low
              {[0.1, 0.25, 0.45, 0.65, 0.9].map((a) => (
                <span key={a} className="h-3 w-6 rounded" style={{ background: `rgba(0,119,182,${a})` }} />
              ))}
              High
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

const tt: React.CSSProperties = {
  border: "1px solid var(--color-border)", borderRadius: 8, background: "white",
  fontSize: 12, boxShadow: "0 4px 20px -6px rgba(10,37,64,0.1)",
};

function Kpi({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-baseline gap-3">
        <div className="text-[28px] font-semibold text-blue-800">{value}</div>
        <span className="text-[12px] font-semibold text-[--color-success]">{delta}</span>
      </div>
    </div>
  );
}
