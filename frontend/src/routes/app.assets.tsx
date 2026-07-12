import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Section, StatusPill } from "@/components/app/page-header";
import {
  Plus, Search, SlidersHorizontal, Download, QrCode, X, Package,
  MapPin, Calendar, FileText, History, ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/app/assets")({ component: Assets });

const assets = [
  ["AF-0012", "Dell Latitude 7440", "Electronics", "green", "Available", "HQ · Floor 2", "Priya Shah"],
  ["AF-0062", "Epson Projector L850", "Electronics", "amber", "Maintenance", "HQ · Floor 2", "—"],
  ["AF-0201", "Ergonomic Chair", "Furniture", "green", "Available", "Warehouse — B1", "—"],
  ["AF-0114", "MacBook Pro 16 M3", "Electronics", "blue", "Allocated", "Bengaluru HQ", "Priya Shah"],
  ["AF-0308", "iPad Pro 12.9 M4", "Electronics", "blue", "Allocated", "Design Studio", "Ravi Menon"],
  ["AF-0442", "Ricoh MP C4504", "Peripherals", "green", "Available", "Bengaluru · Floor 4", "—"],
  ["AF-0088", "Sony A7 IV Camera", "Electronics", "blue", "Allocated", "Media Room", "Anaya D."],
  ["AF-0219", "Bose QC Headset", "Peripherals", "blue", "Allocated", "IT Store", "Karan Patel"],
  ["AF-0501", "Standing Desk — Oak", "Furniture", "green", "Available", "Warehouse — B1", "—"],
  ["AF-0611", "Fluke Multimeter 87V", "Tools", "amber", "Maintenance", "Field Ops Van 3", "—"],
] as const;

function Assets() {
  const [openIdx, setOpenIdx] = useState<number | null>(3);
  const selected = openIdx !== null ? assets[openIdx] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Directory"
        description="Every registered asset across the organization. Click a row to inspect history, documents and QR label."
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

      <Section
        title="1,284 assets"
        description="Filter by category, status, department, location and more."
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Search by tag, serial or QR…" className="h-9 w-[340px] rounded-md border border-border bg-white pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" />
            </div>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm font-medium hover:border-primary/40 hover:text-primary">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">
          {["Category: All", "Status: All", "Department: All", "Location: All", "Assigned to: All"].map((f) => (
            <button key={f} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-[12px] font-medium text-muted-foreground hover:border-primary/40 hover:text-primary">
              {f} <ChevronDown className="h-3 w-3" />
            </button>
          ))}
        </div>

        <table className="w-full text-sm">
          <thead className="text-[11.5px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-5 py-2.5 text-left font-semibold w-8"><input type="checkbox" /></th>
              <th className="px-5 py-2.5 text-left font-semibold">Tag</th>
              <th className="px-5 py-2.5 text-left font-semibold">Name</th>
              <th className="px-5 py-2.5 text-left font-semibold">Category</th>
              <th className="px-5 py-2.5 text-left font-semibold">Status</th>
              <th className="px-5 py-2.5 text-left font-semibold">Location</th>
              <th className="px-5 py-2.5 text-left font-semibold">Assigned to</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {assets.map((a, i) => (
              <tr key={a[0]} onClick={() => setOpenIdx(i)} className={`cursor-pointer hover:bg-secondary/40 ${openIdx === i ? "bg-blue-50/60" : ""}`}>
                <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                <td className="px-5 py-3 font-mono text-[12.5px] font-medium text-primary">{a[0]}</td>
                <td className="px-5 py-3 font-medium">{a[1]}</td>
                <td className="px-5 py-3 text-muted-foreground">{a[2]}</td>
                <td className="px-5 py-3"><StatusPill tone={a[3] as any}>{a[4]}</StatusPill></td>
                <td className="px-5 py-3 text-muted-foreground">{a[5]}</td>
                <td className="px-5 py-3">{a[6]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-[12.5px] text-muted-foreground">
          <div>Showing 1–10 of 1,284</div>
          <div className="flex items-center gap-1.5">
            <button className="h-7 rounded border border-border bg-white px-2.5">Prev</button>
            {["1", "2", "3", "…", "128"].map((n) => (
              <button key={n} className={`h-7 rounded px-2.5 ${n === "1" ? "bg-primary text-white" : "border border-border bg-white"}`}>{n}</button>
            ))}
            <button className="h-7 rounded border border-border bg-white px-2.5">Next</button>
          </div>
        </div>
      </Section>

      {/* Details drawer */}
      {selected && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setOpenIdx(null)}>
          <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm" />
          <aside onClick={(e) => e.stopPropagation()} className="relative flex h-full w-full max-w-[520px] flex-col border-l border-border bg-white shadow-elevated">
            <header className="flex items-start gap-3 border-b border-border px-6 py-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-mono text-[11.5px] font-medium text-primary">{selected[0]}</div>
                <div className="text-[16px] font-semibold">{selected[1]}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[12px] text-muted-foreground">
                  <StatusPill tone={selected[3] as any}>{selected[4]}</StatusPill>
                  <span>· {selected[2]}</span>
                </div>
              </div>
              <button className="text-muted-foreground hover:text-primary" onClick={() => setOpenIdx(null)}>
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
                <Meta label="Location" value={selected[5]} icon={MapPin} />
                <Meta label="Assigned to" value={selected[6] || "—"} icon={Package} />
                <Meta label="Purchased" value="Mar 12, 2024" icon={Calendar} />
                <Meta label="Warranty" value="Until Mar 2027" icon={FileText} />
              </div>

              <div className="mt-6 rounded-lg border border-border bg-secondary/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-md border border-border bg-white">
                    <QrCode className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-[12.5px]">
                    <div className="font-semibold">QR label · {selected[0]}</div>
                    <div className="text-muted-foreground">Print or download to attach to the physical asset.</div>
                    <div className="mt-1.5 flex gap-2">
                      <button className="text-primary hover:underline">Download</button>
                      <span className="text-border">·</span>
                      <button className="text-primary hover:underline">Print</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="mb-3 text-[12.5px] font-semibold uppercase tracking-wider text-muted-foreground">Timeline</h4>
                <ol className="space-y-4 border-l border-border pl-4">
                  {[
                    ["Mar 12", "Allocated to Priya Shah — Engineering", "green"],
                    ["Feb 04", "Returned by Arjun Nair — condition: good", "blue"],
                    ["Jan 28", "Maintenance resolved — battery replaced", "blue"],
                    ["Jan 12", "Registered in AssetFlow", "blue"],
                  ].map(([d, t, tone]) => (
                    <li key={t} className="relative">
                      <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${tone === "green" ? "bg-[--color-success]" : "bg-primary"}`} />
                      <div className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">{d}</div>
                      <div className="text-[13px] font-medium">{t}</div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-6">
                <h4 className="mb-3 text-[12.5px] font-semibold uppercase tracking-wider text-muted-foreground">Documents</h4>
                <ul className="space-y-2">
                  {[
                    ["Purchase invoice — INV-2024-0338.pdf", "212 KB"],
                    ["Warranty certificate — Dell.pdf", "89 KB"],
                    ["Asset handover form.pdf", "144 KB"],
                  ].map(([f, s]) => (
                    <li key={f} className="flex items-center gap-3 rounded-md border border-border bg-white px-3 py-2 text-[13px]">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="flex-1 font-medium">{f}</span>
                      <span className="text-[11.5px] text-muted-foreground">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <footer className="flex items-center gap-2 border-t border-border bg-secondary/40 px-6 py-3">
              <button className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-white text-[13px] font-semibold hover:border-primary/40 hover:text-primary">
                <History className="h-4 w-4" /> Full history
              </button>
              <button className="inline-flex h-9 flex-1 items-center justify-center rounded-md bg-primary text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover">
                Edit asset
              </button>
            </footer>
          </aside>
        </div>
      )}
    </div>
  );
}

function Meta({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 text-[13px] font-medium">{value}</div>
    </div>
  );
}
