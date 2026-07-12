import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, StatusPill } from "@/components/app/page-header";
import { Check, X, HelpCircle, Play, ClipboardCheck } from "lucide-react";

export const Route = createFileRoute("/app/audit")({ component: Audit });

const rows = [
  ["AF-0012", "Dell Latitude 7440", "HQ · Floor 2", "Priya Shah", "verified"],
  ["AF-0062", "Epson Projector L850", "HQ · Floor 2", "—", "missing"],
  ["AF-0201", "Ergonomic Chair", "Warehouse — B1", "—", "verified"],
  ["AF-0114", "MacBook Pro 16 M3", "Bengaluru HQ", "Priya Shah", "verified"],
  ["AF-0308", "iPad Pro 12.9 M4", "Design Studio", "Ravi Menon", "pending"],
  ["AF-0442", "Ricoh MP C4504", "Bengaluru · Floor 4", "—", "verified"],
  ["AF-0088", "Sony A7 IV Camera", "Media Room", "Anaya D.", "damaged"],
  ["AF-0219", "Bose QC Headset", "IT Store", "Karan Patel", "verified"],
] as const;

const toneOf = (s: string) =>
  s === "verified" ? "green" : s === "missing" ? "red" : s === "damaged" ? "amber" : "muted";

function Audit() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Audit"
        description="Run scheduled audit cycles, scan assets on the floor and reconcile the physical inventory against AssetFlow."
        actions={
          <>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm font-medium hover:border-primary/40 hover:text-primary">
              Cycle settings
            </button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              <Play className="h-4 w-4" /> Start new cycle
            </button>
          </>
        }
      />

      {/* Current cycle strip */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-blue-50 to-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white shadow-sm">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11.5px] font-semibold uppercase tracking-wider text-primary">Cycle 2026-Q3</div>
              <div className="text-[17px] font-semibold text-blue-800">Bengaluru HQ · Full inventory audit</div>
              <div className="text-[12.5px] text-muted-foreground">Started 3 Jul · Due 22 Jul · Lead: Aditi Rao</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Metric v="612" l="Verified" tone="green" />
            <Metric v="18" l="Missing" tone="red" />
            <Metric v="7" l="Damaged" tone="amber" />
            <Metric v="647 / 1284" l="Progress" tone="blue" />
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-blue-100">
          <div className="h-full w-[50%] rounded-full bg-gradient-to-r from-blue-500 to-blue-700" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Section
          title="Verification queue"
          description="Scan or mark each asset. Discrepancies flow to reconciliation."
          actions={
            <div className="flex gap-2">
              {["All", "Verified", "Missing", "Damaged", "Pending"].map((t, i) => (
                <button key={t} className={`h-8 rounded-md px-3 text-[12.5px] font-medium ${i === 0 ? "bg-primary text-white" : "border border-border bg-white text-muted-foreground hover:text-primary"}`}>
                  {t}
                </button>
              ))}
            </div>
          }
        >
          <table className="w-full text-sm">
            <thead className="text-[11.5px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-5 py-2.5 text-left font-semibold">Tag</th>
                <th className="px-5 py-2.5 text-left font-semibold">Asset</th>
                <th className="px-5 py-2.5 text-left font-semibold">Expected location</th>
                <th className="px-5 py-2.5 text-left font-semibold">Assignee</th>
                <th className="px-5 py-2.5 text-left font-semibold">Result</th>
                <th className="px-5 py-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r[0]} className="hover:bg-secondary/40">
                  <td className="px-5 py-3 font-mono text-[12.5px] font-medium text-primary">{r[0]}</td>
                  <td className="px-5 py-3 font-medium">{r[1]}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r[2]}</td>
                  <td className="px-5 py-3">{r[3]}</td>
                  <td className="px-5 py-3"><StatusPill tone={toneOf(r[4]) as any}>{r[4][0].toUpperCase() + r[4].slice(1)}</StatusPill></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <IconBtn title="Verify" tone="green"><Check className="h-3.5 w-3.5" /></IconBtn>
                      <IconBtn title="Missing" tone="red"><X className="h-3.5 w-3.5" /></IconBtn>
                      <IconBtn title="Flag"><HelpCircle className="h-3.5 w-3.5" /></IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <div className="space-y-6">
          <Section title="Summary" description="Cycle 2026-Q3">
            <div className="space-y-2 p-5 text-[13px]">
              <Row l="Total assets" v="1,284" />
              <Row l="Scanned" v="647" />
              <Row l="Accuracy" v="98.4%" green />
              <Row l="Discrepancies" v="25" red />
              <Row l="Est. completion" v="18 Jul" />
            </div>
          </Section>

          <Section title="Cycle history">
            <ul className="divide-y divide-border">
              {[
                ["2026-Q2 · Bengaluru", "99.1% accuracy", "green"],
                ["2026-Q1 · All sites", "98.7% accuracy", "green"],
                ["2025-Q4 · Warehouses", "96.2% accuracy", "blue"],
              ].map(([n, r, t]) => (
                <li key={n} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-[13px] font-medium">{n}</div>
                    <div className="text-[11.5px] text-muted-foreground">{r}</div>
                  </div>
                  <StatusPill tone={t as any}>Closed</StatusPill>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Metric({ v, l, tone }: { v: string; l: string; tone: string }) {
  const c = tone === "green" ? "text-[--color-success]" : tone === "red" ? "text-[--color-destructive]" : tone === "amber" ? "text-amber-700" : "text-blue-800";
  return (
    <div>
      <div className={`text-[22px] font-semibold leading-none ${c}`}>{v}</div>
      <div className="mt-1 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">{l}</div>
    </div>
  );
}

function IconBtn({ children, tone, title }: { children: React.ReactNode; tone?: "green" | "red"; title: string }) {
  const c = tone === "green" ? "text-[--color-success] hover:bg-green-50" : tone === "red" ? "text-[--color-destructive] hover:bg-red-50" : "text-muted-foreground hover:bg-accent hover:text-primary";
  return <button title={title} className={`flex h-7 w-7 items-center justify-center rounded-md border border-border bg-white ${c}`}>{children}</button>;
}

function Row({ l, v, green, red }: { l: string; v: string; green?: boolean; red?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{l}</span>
      <span className={`font-semibold tabular-nums ${green ? "text-[--color-success]" : red ? "text-[--color-destructive]" : "text-foreground"}`}>{v}</span>
    </div>
  );
}
