import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, StatusPill } from "@/components/app/page-header";
import { Plus, MoreHorizontal, Clock, User } from "lucide-react";

export const Route = createFileRoute("/app/maintenance")({ component: Maintenance });

type Card = { tag: string; title: string; note: string; tech?: string; priority?: "high" | "med" | "low"; };

const columns: { id: string; title: string; tone: "muted" | "blue" | "amber" | "green"; cards: Card[] }[] = [
  {
    id: "pending", title: "Pending", tone: "muted",
    cards: [
      { tag: "AF-0062", title: "Projector bulb", note: "Not turning on", priority: "high" },
      { tag: "AF-0511", title: "AC unit — Floor 4", note: "Water leak reported", priority: "high" },
      { tag: "AF-0733", title: "Coffee machine", note: "Grinder stuck", priority: "low" },
    ],
  },
  {
    id: "approved", title: "Approved", tone: "blue",
    cards: [
      { tag: "AF-0031", title: "AC unit — Server room", note: "Noisy compressor", priority: "med" },
      { tag: "AF-0812", title: "UPS battery bank", note: "Cell 3 low voltage", priority: "high" },
    ],
  },
  {
    id: "assigned", title: "Technician assigned", tone: "blue",
    cards: [
      { tag: "AF-0078", title: "Forklift", note: "Brake service", tech: "R. Varma", priority: "med" },
      { tag: "AF-0904", title: "Router MX-450", note: "Firmware upgrade", tech: "K. Patel" },
    ],
  },
  {
    id: "progress", title: "In progress", tone: "amber",
    cards: [
      { tag: "AF-0897", title: "Printer jam", note: "Parts ordered", tech: "L. Fernandes", priority: "low" },
      { tag: "AF-0102", title: "Standing desk motor", note: "Bench-tested, awaiting part", tech: "R. Varma" },
    ],
  },
  {
    id: "resolved", title: "Resolved", tone: "green",
    cards: [
      { tag: "AF-0873", title: "Chair repair", note: "Resolved 7 Jul", tech: "L. Fernandes" },
      { tag: "AF-0664", title: "Projector lamp", note: "Replaced 5 Jul", tech: "R. Varma" },
    ],
  },
];

function Maintenance() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Management"
        description="Approval workflow as a Kanban board. Approving a card moves the asset to Under Maintenance; resolving it returns the asset to Available."
        actions={
          <>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm font-medium hover:border-primary/40 hover:text-primary">
              Board settings
            </button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              <Plus className="h-4 w-4" /> New request
            </button>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-4 lg:grid-cols-5">
        {[
          ["Pending", "3"], ["Approved", "2"], ["Assigned", "2"], ["In progress", "2"], ["Resolved this week", "6"],
        ].map(([l, v]) => (
          <div key={l as string} className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">{l}</div>
            <div className="mt-1 text-[22px] font-semibold text-blue-800">{v}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-4">
          {columns.map((col) => (
            <div key={col.id} className="w-[280px] shrink-0 rounded-xl border border-border bg-surface-muted/70 p-3">
              <header className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <StatusPill tone={col.tone}>{col.title}</StatusPill>
                  <span className="text-[11.5px] font-semibold text-muted-foreground">{col.cards.length}</span>
                </div>
                <button className="text-muted-foreground hover:text-primary"><Plus className="h-4 w-4" /></button>
              </header>

              <div className="space-y-2.5">
                {col.cards.map((c) => (
                  <article key={c.tag} className="rounded-lg border border-border bg-white p-3 shadow-card hover:shadow-elevated transition-shadow">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-[11.5px] font-medium text-primary">{c.tag}</span>
                      <button className="text-muted-foreground hover:text-primary"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="mt-1 text-[13.5px] font-semibold leading-snug">{c.title}</div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground">{c.note}</div>
                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        {c.tech ? (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" /> {c.tech}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" /> Unassigned
                          </span>
                        )}
                      </div>
                      {c.priority && (
                        <StatusPill tone={c.priority === "high" ? "red" : c.priority === "med" ? "blue" : "muted"}>
                          {c.priority === "high" ? "High" : c.priority === "med" ? "Med" : "Low"}
                        </StatusPill>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
