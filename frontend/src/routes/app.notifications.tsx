import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, Section, StatusPill } from "@/components/app/page-header";
import { Check, Package, AlertTriangle, CalendarClock, Wrench, ArrowLeftRight, Bell } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/notifications")({ component: Notifications });

const iconMap: Record<string, any> = {
  maintenance_created: Wrench,
  maintenance_approved: Check,
  maintenance_rejected: AlertTriangle,
  maintenance_assigned: Wrench,
  maintenance_started: Wrench,
  maintenance_resolved: Check,
  allocation_created: Package,
  allocation_returned: ArrowLeftRight,
  audit_missing: AlertTriangle,
  audit_closed: Check,
  booking_confirmed: CalendarClock,
  booking_cancelled: AlertTriangle,
  default: Bell,
};

const toneMap: Record<string, "blue" | "green" | "red" | "amber"> = {
  maintenance_created: "blue",
  maintenance_approved: "green",
  maintenance_rejected: "red",
  maintenance_assigned: "blue",
  maintenance_started: "amber",
  maintenance_resolved: "green",
  allocation_created: "blue",
  allocation_returned: "green",
  audit_missing: "red",
  audit_closed: "green",
  booking_confirmed: "green",
  booking_cancelled: "red",
  default: "blue",
};

function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>("/api/notifications");
      // The backend returns { notifications, total }
      const list = Array.isArray(res) ? res : (res?.notifications || []);
      setNotifications(list);
      if (list.length > 0 && !selected) {
        setSelected(list[0]);
      }
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch (err: any) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      // Backend expects POST /api/notifications/:id/read
      await api.post(`/api/notifications/${id}/read`);
      loadNotifications();
    } catch (err: any) {
      setError(err.message || "Failed to mark as read.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      // Backend expects POST /api/notifications/read-all
      await api.post("/api/notifications/read-all");
      loadNotifications();
    } catch (err: any) {
      setError(err.message || "Failed to mark all as read.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Group notifications by date bucket
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const grouped: { label: string; items: any[] }[] = [];
  const todayItems = notifications.filter((n) => new Date(n.createdAt).toDateString() === today);
  const yesterdayItems = notifications.filter((n) => new Date(n.createdAt).toDateString() === yesterday);
  const earlierItems = notifications.filter(
    (n) => new Date(n.createdAt).toDateString() !== today && new Date(n.createdAt).toDateString() !== yesterday
  );

  if (todayItems.length > 0) grouped.push({ label: "Today", items: todayItems });
  if (yesterdayItems.length > 0) grouped.push({ label: "Yesterday", items: yesterdayItems });
  if (earlierItems.length > 0) grouped.push({ label: "Earlier", items: earlierItems });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications & Activity"
        description="Every workflow event, alert and system message across your workspace."
        actions={
          <button
            onClick={handleMarkAllRead}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <Check className="h-4 w-4" /> Mark all read
          </button>
        }
      />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        <Section title="Inbox" description={`${notifications.length} notifications · ${unreadCount} unread`}>
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading notifications...</div>
          ) : grouped.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No notifications yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {grouped.map((g) => (
                <li key={g.label}>
                  <div className="bg-secondary/40 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {g.label}
                  </div>
                  <ul>
                    {g.items.map((n) => {
                      const on = selected?.id === n.id;
                      const Icon = iconMap[n.type] || iconMap.default;
                      const tone = toneMap[n.type] || toneMap.default;
                      return (
                        <li key={n.id}>
                          <button
                            onClick={() => setSelected(n)}
                            className={`flex w-full items-start gap-3 border-b border-border px-5 py-3.5 text-left transition-colors ${
                              on ? "bg-blue-50/70" : "hover:bg-secondary/40"
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                                tone === "green"
                                  ? "bg-green-50 text-[--color-success]"
                                  : tone === "red"
                                  ? "bg-red-50 text-[--color-destructive]"
                                  : tone === "amber"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-blue-50 text-primary"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-[13.5px] font-semibold">{n.message}</span>
                                {!n.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                              </div>
                              <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                                {n.type?.replace(/_/g, " ")}
                              </div>
                            </div>
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Detail Pane */}
        <Section title="Details" description={selected?.message || "Select a notification"}>
          {selected ? (
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    (toneMap[selected.type] || "blue") === "green"
                      ? "bg-green-50 text-[--color-success]"
                      : (toneMap[selected.type] || "blue") === "red"
                      ? "bg-red-50 text-[--color-destructive]"
                      : (toneMap[selected.type] || "blue") === "amber"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-blue-50 text-primary"
                  }`}
                >
                  {(() => {
                    const Icon = iconMap[selected.type] || iconMap.default;
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
                <div className="flex-1">
                  <StatusPill
                    tone={toneMap[selected.type] || "blue"}
                  >
                    {selected.type?.replace(/_/g, " ") || "Update"}
                  </StatusPill>
                  <h3 className="mt-2 text-[18px] font-semibold text-blue-800">{selected.message}</h3>
                  <p className="mt-1 text-[13.5px] text-muted-foreground">
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Meta l="Type" v={selected.type?.replace(/_/g, " ") || "—"} />
                <Meta l="Read" v={selected.isRead ? "Yes" : "No"} />
                <Meta l="Created" v={new Date(selected.createdAt).toLocaleDateString()} />
                <Meta l="Notification ID" v={selected.id.substring(0, 8)} />
              </div>

              <div className="mt-6 flex gap-2 border-t border-border pt-5">
                {!selected.isRead && (
                  <button
                    onClick={() => handleMarkRead(selected.id)}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-white text-[13px] font-semibold hover:border-primary/40 hover:text-primary"
                  >
                    <Check className="h-4 w-4" /> Mark as read
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Select a notification from the inbox to view details.
            </div>
          )}
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
