import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Section, StatusPill } from "@/components/app/page-header";
import { Check, Filter, Package, AlertTriangle, CalendarClock, Wrench, ArrowLeftRight, Bell } from "lucide-react";

export const Route = createFileRoute("/app/notifications")({ component: Notifications });

type N = { id: string; icon: any; tone: "blue" | "green" | "red" | "amber"; title: string; sub: string; time: string; group: string; unread?: boolean; };

const items: N[] = [
  { id: "1", icon: AlertTriangle, tone: "red", title: "Overdue return — AF-0091 iPad Air", sub: "Assigned to Karan Patel · 4 days overdue", time: "3h ago", group: "Today", unread: true },
  { id: "2", icon: ArrowLeftRight, tone: "blue", title: "Transfer request submitted", sub: "AF-0308 · Ravi Menon → Kavya Nair", time: "4h ago", group: "Today", unread: true },
  { id: "3", icon: Wrench, tone: "green", title: "Maintenance resolved — AF-0062", sub: "Projector bulb replaced by L. Fernandes", time: "6h ago", group: "Today", unread: true },
  { id: "4", icon: CalendarClock, tone: "amber", title: "Booking conflict — Room B2", sub: "Requested 9:30–10:30 overlaps existing slot", time: "Yesterday", group: "Yesterday" },
  { id: "5", icon: Package, tone: "blue", title: "12 new assets registered", sub: "CSV import by Aditi Rao · IT category", time: "Yesterday", group: "Yesterday" },
  { id: "6", icon: Check, tone: "green", title: "Audit cycle 2026-Q2 closed", sub: "99.1% accuracy · 4 discrepancies resolved", time: "3 days ago", group: "Earlier" },
];

function Notifications() {
  const [openId, setOpenId] = useState<string>("1");
  const active = items.find((i) => i.id === openId)!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications & Activity"
        description="Every workflow event, alert and system message across your workspace."
        actions={
          <>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm font-medium hover:border-primary/40 hover:text-primary">
              <Filter className="h-4 w-4" /> Filters
            </button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              <Check className="h-4 w-4" /> Mark all read
            </button>
          </>
        }
      />

      <div className="flex items-center gap-2">
        {["All (24)", "Alerts (3)", "Requests (6)", "Bookings (5)", "Maintenance (4)", "System (6)"].map((t, i) => (
          <button key={t} className={`h-8 rounded-full px-3.5 text-[12.5px] font-medium ${i === 0 ? "bg-primary text-white" : "border border-border bg-white text-muted-foreground hover:text-primary"}`}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        <Section title="Inbox" description="24 notifications · 3 unread">
          <ul className="divide-y divide-border">
            {["Today", "Yesterday", "Earlier"].map((g) => (
              <li key={g}>
                <div className="bg-secondary/40 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g}</div>
                <ul>
                  {items.filter((i) => i.group === g).map((n) => {
                    const on = n.id === openId;
                    const Icon = n.icon;
                    return (
                      <li key={n.id}>
                        <button
                          onClick={() => setOpenId(n.id)}
                          className={`flex w-full items-start gap-3 border-b border-border px-5 py-3.5 text-left transition-colors ${on ? "bg-blue-50/70" : "hover:bg-secondary/40"}`}
                        >
                          <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                            n.tone === "green" ? "bg-green-50 text-[--color-success]" :
                            n.tone === "red" ? "bg-red-50 text-[--color-destructive]" :
                            n.tone === "amber" ? "bg-amber-50 text-amber-700" :
                            "bg-blue-50 text-primary"
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-[13.5px] font-semibold">{n.title}</span>
                              {n.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                            </div>
                            <div className="mt-0.5 truncate text-[12px] text-muted-foreground">{n.sub}</div>
                          </div>
                          <span className="shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Details" description={active.title}>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                active.tone === "green" ? "bg-green-50 text-[--color-success]" :
                active.tone === "red" ? "bg-red-50 text-[--color-destructive]" :
                active.tone === "amber" ? "bg-amber-50 text-amber-700" :
                "bg-blue-50 text-primary"
              }`}>
                <active.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <StatusPill tone={active.tone}>{active.tone === "red" ? "Alert" : active.tone === "green" ? "Resolved" : active.tone === "amber" ? "Conflict" : "Update"}</StatusPill>
                <h3 className="mt-2 text-[18px] font-semibold text-blue-800">{active.title}</h3>
                <p className="mt-1 text-[13.5px] text-muted-foreground">{active.sub}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Meta l="Category" v="Allocation" />
              <Meta l="Priority" v="High" />
              <Meta l="Assignee" v="Aditi Rao" />
              <Meta l="Related asset" v="AF-0091" />
            </div>

            <div className="mt-6">
              <h4 className="mb-3 text-[12.5px] font-semibold uppercase tracking-wider text-muted-foreground">Event timeline</h4>
              <ol className="space-y-4 border-l border-border pl-4">
                {[
                  ["11:04", "Overdue alert raised by system", "red"],
                  ["09:00", "Return reminder sent to Karan Patel", "blue"],
                  ["Yesterday", "Allocation extended by 2 days", "blue"],
                  ["07 Jul", "Original allocation approved", "green"],
                ].map(([t, txt, tone]) => (
                  <li key={t + txt} className="relative">
                    <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${tone === "green" ? "bg-[--color-success]" : tone === "red" ? "bg-[--color-destructive]" : "bg-primary"}`} />
                    <div className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">{t}</div>
                    <div className="text-[13px] font-medium">{txt}</div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 flex gap-2 border-t border-border pt-5">
              <button className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-white text-[13px] font-semibold hover:border-primary/40 hover:text-primary">
                <Bell className="h-4 w-4" /> Snooze 24h
              </button>
              <button className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-primary text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover">
                Take action
              </button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Meta({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{l}</div>
      <div className="mt-1 text-[13px] font-medium">{v}</div>
    </div>
  );
}
