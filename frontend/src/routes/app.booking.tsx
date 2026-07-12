import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, StatusPill } from "@/components/app/page-header";
import { AlertTriangle, ChevronLeft, ChevronRight, Plus, Users } from "lucide-react";

export const Route = createFileRoute("/app/booking")({ component: Booking });

const hours = ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const resources = [
  { name: "Conference Room B2", cap: "12 pax", floor: "HQ · Floor 2" },
  { name: "Training Room T1", cap: "24 pax", floor: "HQ · Floor 3" },
  { name: "Focus Pod P4", cap: "4 pax", floor: "HQ · Floor 1" },
  { name: "Design Lab", cap: "8 pax", floor: "Studio · Wing A" },
];

type Booking = { row: number; start: number; span: number; label: string; tone: "blue" | "green" | "amber"; };
const bookings: Booking[] = [
  { row: 0, start: 1, span: 1, label: "Procurement team", tone: "blue" },
  { row: 0, start: 3, span: 2, label: "Leadership review", tone: "blue" },
  { row: 0, start: 7, span: 2, label: "Vendor demo", tone: "green" },
  { row: 1, start: 0, span: 3, label: "Training — Onboarding cohort", tone: "blue" },
  { row: 1, start: 5, span: 2, label: "Requested — awaiting approval", tone: "amber" },
  { row: 2, start: 2, span: 1, label: "1:1 — R. Menon", tone: "blue" },
  { row: 2, start: 4, span: 1, label: "1:1 — S. Iqbal", tone: "green" },
  { row: 3, start: 6, span: 3, label: "Design sprint · Q3", tone: "blue" },
];

function Booking() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Booking"
        description="Meeting rooms, labs and shared equipment on a single timeline. Conflicts are surfaced before you commit."
        actions={
          <>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm font-medium hover:border-primary/40 hover:text-primary">
              Today
            </button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              <Plus className="h-4 w-4" /> Book a slot
            </button>
          </>
        }
      />

      {/* Conflict banner */}
      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/70 px-4 py-3 text-sm">
        <AlertTriangle className="mt-0.5 h-4.5 w-4.5 text-[--color-destructive]" />
        <div className="flex-1">
          <div className="font-semibold text-[--color-destructive]">Requested 9:30 – 10:30 conflicts with an existing booking</div>
          <div className="text-[13px] text-red-900/70">Conference Room B2 · Procurement Team already booked 9:00 – 10:00.</div>
        </div>
        <button className="text-[13px] font-semibold text-[--color-destructive] hover:underline">Suggest another slot</button>
      </div>

      <Section
        title="Tuesday, 7 July 2026"
        description="Bengaluru HQ — 4 resources"
        actions={
          <div className="flex items-center gap-1.5">
            <button className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white hover:border-primary/40 hover:text-primary"><ChevronLeft className="h-4 w-4" /></button>
            <button className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white hover:border-primary/40 hover:text-primary"><ChevronRight className="h-4 w-4" /></button>
          </div>
        }
      >
        <div className="overflow-x-auto p-5">
          <div className="min-w-[900px]">
            {/* Time header */}
            <div className="grid" style={{ gridTemplateColumns: `220px repeat(${hours.length}, minmax(0,1fr))` }}>
              <div />
              {hours.map((h) => (
                <div key={h} className="border-l border-border pl-2 text-[11px] font-medium text-muted-foreground">{h}</div>
              ))}
            </div>

            {/* Rows */}
            <div className="mt-2 space-y-1.5">
              {resources.map((r, ri) => (
                <div key={r.name} className="grid items-stretch" style={{ gridTemplateColumns: `220px repeat(${hours.length}, minmax(0,1fr))` }}>
                  <div className="flex items-center gap-2.5 pr-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-primary">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium">{r.name}</div>
                      <div className="text-[11px] text-muted-foreground">{r.cap} · {r.floor}</div>
                    </div>
                  </div>
                  <div className="relative col-span-[10] h-14 rounded-md border border-dashed border-border bg-secondary/40" style={{ gridColumn: `2 / span ${hours.length}` }}>
                    {/* Hour grid lines */}
                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${hours.length}, minmax(0,1fr))` }}>
                      {hours.map((_, i) => <div key={i} className="border-l border-border first:border-l-0" />)}
                    </div>
                    {bookings.filter((b) => b.row === ri).map((b, i) => {
                      const left = (b.start / hours.length) * 100;
                      const width = (b.span / hours.length) * 100;
                      const bg =
                        b.tone === "green" ? "bg-[--color-success] text-white border-transparent"
                        : b.tone === "amber" ? "bg-white text-[--color-destructive] border-2 border-dashed border-[--color-destructive]"
                        : "bg-primary text-white border-transparent";
                      return (
                        <div key={i}
                          className={`absolute top-1.5 bottom-1.5 truncate rounded-md px-2.5 py-1.5 text-[11.5px] font-semibold shadow-sm ${bg}`}
                          style={{ left: `calc(${left}% + 4px)`, width: `calc(${width}% - 8px)` }}>
                          {b.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Section className="lg:col-span-2" title="Upcoming bookings">
          <table className="w-full text-sm">
            <thead className="text-[11.5px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-5 py-2.5 text-left font-semibold">When</th>
                <th className="px-5 py-2.5 text-left font-semibold">Resource</th>
                <th className="px-5 py-2.5 text-left font-semibold">Organiser</th>
                <th className="px-5 py-2.5 text-left font-semibold">Purpose</th>
                <th className="px-5 py-2.5 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Today · 09:00–10:00", "Room B2", "Procurement", "Vendor sync", "green", "Confirmed"],
                ["Today · 11:00–13:00", "Training T1", "People Ops", "Onboarding cohort", "blue", "Scheduled"],
                ["Today · 14:00–15:00", "Room B2", "IT", "Change advisory", "amber", "Awaiting"],
                ["Wed · 10:00–11:00", "Focus Pod P4", "R. Menon", "1:1 review", "blue", "Scheduled"],
              ].map((r) => (
                <tr key={r.join()} className="hover:bg-secondary/40">
                  <td className="px-5 py-3 font-medium">{r[0]}</td>
                  <td className="px-5 py-3">{r[1]}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r[2]}</td>
                  <td className="px-5 py-3">{r[3]}</td>
                  <td className="px-5 py-3"><StatusPill tone={r[4] as any}>{r[5]}</StatusPill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Booking details" description="Room B2 · 9:30–10:30 (requested)">
          <div className="space-y-4 p-5 text-[13px]">
            <div><div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Requested by</div><div>Aditi Rao — Facilities</div></div>
            <div><div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Attendees</div><div>6 confirmed, 2 tentative</div></div>
            <div><div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recurrence</div><div>None</div></div>
            <div className="rounded-md border border-red-200 bg-red-50/70 p-3 text-[12.5px] text-red-900">
              Conflicts with Procurement Team booking (9:00–10:00). Choose another slot or coordinate with the owner.
            </div>
            <div className="flex gap-2 pt-1">
              <button className="h-9 flex-1 rounded-md border border-border bg-white text-[13px] font-medium hover:border-primary/40">Suggest 10:30</button>
              <button className="h-9 flex-1 rounded-md bg-primary text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover">Reschedule</button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
