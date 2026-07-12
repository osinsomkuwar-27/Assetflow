import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, StatusPill } from "@/components/app/page-header";
import { AlertTriangle, ArrowRight, Search, User, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/app/allocation")({ component: Allocation });

function Allocation() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Allocation & Transfer"
        description="Move assets between employees safely. Direct re-allocation is blocked when an asset is already assigned — submit a transfer request instead."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Section title="New transfer request" description="AF-0114 · Dell Latitude 7440">
          <div className="space-y-5 p-6">
            <div>
              <label className="mb-1.5 block text-[12.5px] font-semibold">Asset</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input defaultValue="AF-0114 — Dell Latitude 7440" className="h-11 w-full rounded-md border border-border bg-white pl-9 pr-3 text-[13.5px] font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" />
              </div>
            </div>

            {/* Double-allocation block */}
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/70 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-[--color-destructive]" />
              <div className="flex-1 text-[13px]">
                <div className="font-semibold text-[--color-destructive]">Already allocated to Priya Shah (Engineering)</div>
                <div className="mt-0.5 text-red-900/70">
                  Direct re-allocation is blocked. Submit a transfer request below — the current owner will receive an approval notification.
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <div className="mb-3 text-[12.5px] font-semibold uppercase tracking-wider text-muted-foreground">Transfer Request</div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-muted-foreground">From</label>
                  <div className="flex h-11 items-center gap-2.5 rounded-md border border-border bg-white px-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[10.5px] font-semibold text-primary">PS</div>
                    <div>
                      <div className="text-[13px] font-medium leading-tight">Priya Shah</div>
                      <div className="text-[10.5px] leading-tight text-muted-foreground">Engineering · Bengaluru</div>
                    </div>
                  </div>
                </div>
                <ArrowRight className="mb-3 h-5 w-5 text-primary" />
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-muted-foreground">To</label>
                  <div className="flex h-11 items-center gap-2 rounded-md border border-border bg-white px-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <input placeholder="Select employee…" className="flex-1 bg-transparent text-[13px] outline-none" />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-[12px] font-semibold text-muted-foreground">Reason</label>
                <textarea rows={4} placeholder="Add context for approvers…" className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                  <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" />
                  Notify current owner immediately
                </label>
                <div className="flex gap-2">
                  <button className="inline-flex h-9 items-center rounded-md border border-border bg-white px-3 text-sm font-medium hover:border-primary/40 hover:text-primary">Cancel</button>
                  <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
                    Submit request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <div className="space-y-6">
          <Section title="Allocation history" description="AF-0114 chain of custody">
            <ol className="space-y-4 border-l border-border px-6 py-5 [margin-left:1.5rem]">
              {[
                ["Mar 12", "Allocated to Priya Shah — Engineering", "green", "Approved by A. Rao"],
                ["Jan 04", "Returned by Arjun Nair — condition: good", "blue", "Verified in warehouse"],
                ["Dec 08", "Allocated to Arjun Nair — IT", "green", "Approved by S. Iqbal"],
                ["Nov 22", "Registered in AssetFlow", "blue", "Purchase order PO-4488"],
              ].map(([d, t, tone, sub]) => (
                <li key={t} className="relative pl-4">
                  <span className={`absolute -left-[7px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${tone === "green" ? "bg-[--color-success]" : "bg-primary"}`} />
                  <div className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">{d}</div>
                  <div className="text-[13px] font-medium">{t}</div>
                  <div className="text-[11.5px] text-muted-foreground">{sub}</div>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Pending transfers" actions={<StatusPill tone="blue">3 open</StatusPill>}>
            <ul className="divide-y divide-border">
              {[
                ["AF-0308 · iPad Pro 12.9", "Ravi Menon → Kavya Nair", "blue"],
                ["AF-0088 · Sony A7 IV", "Anaya D. → Media Room", "amber"],
                ["AF-0219 · Bose QC Headset", "Karan Patel → IT Store", "green"],
              ].map(([a, flow, tone]) => (
                <li key={a} className="flex items-center gap-3 px-5 py-3">
                  <CheckCircle2 className={`h-4.5 w-4.5 ${tone === "green" ? "text-[--color-success]" : "text-primary"}`} />
                  <div className="flex-1">
                    <div className="text-[13px] font-medium">{a}</div>
                    <div className="text-[11.5px] text-muted-foreground">{flow}</div>
                  </div>
                  <StatusPill tone={tone as any}>{tone === "green" ? "Approved" : tone === "amber" ? "Awaiting" : "Pending"}</StatusPill>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}
