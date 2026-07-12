import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, StatusPill } from "@/components/app/page-header";
import { Check, X, HelpCircle, Play, ClipboardCheck, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/audit")({ component: Audit });

const toneOf = (s: string) =>
  s === "Verified" ? "green" : s === "Missing" ? "red" : s === "Damaged" ? "amber" : "muted";

function Audit() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [auditItems, setAuditItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New cycle form
  const [showNewCycleModal, setShowNewCycleModal] = useState(false);
  const [newCycle, setNewCycle] = useState({ name: "", scope: "", startDate: "", endDate: "" });

  // Filter state for audit items
  const [filter, setFilter] = useState("All");

  const loadCycles = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>("/api/audits/cycles");
      setCycles(data);
      // Find the first open/in-progress cycle
      const open = data.find((c: any) => c.status === "Open" || c.status === "InProgress");
      if (open) {
        setActiveCycle(open);
        loadCycleDetails(open.id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load audit cycles.");
    } finally {
      setLoading(false);
    }
  };

  const loadCycleDetails = async (cycleId: string) => {
    try {
      const data = await api.get<any>(`/api/audits/cycles/${cycleId}`);
      setActiveCycle(data);
      setAuditItems(data.items || []);
    } catch (err: any) {
      setError(err.message || "Failed to load cycle details.");
    }
  };

  useEffect(() => {
    loadCycles();
  }, []);

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCycle.name || !newCycle.scope) return;
    try {
      await api.post("/api/audits/cycles", {
        name: newCycle.name,
        scope: newCycle.scope,
        startDate: newCycle.startDate || undefined,
        endDate: newCycle.endDate || undefined,
      });
      setSuccess("Audit cycle created.");
      setShowNewCycleModal(false);
      setNewCycle({ name: "", scope: "", startDate: "", endDate: "" });
      loadCycles();
    } catch (err: any) {
      setError(err.message || "Failed to create audit cycle.");
    }
  };

  const handleVerifyItem = async (result: string) => {
    if (!activeCycle) return;
    // For simplicity, we verify items one at a time.
    // The backend expects POST /api/audits/cycles/:cycleId/verify with { itemId, result, notes }
    // But we need to pick an item. Let's verify the first pending item.
    const pendingItem = auditItems.find((i) => i.result === "Pending");
    if (!pendingItem) {
      setError("No pending items to verify.");
      return;
    }
    try {
      await api.post(`/api/audits/cycles/${activeCycle.id}/verify`, {
        itemId: pendingItem.id,
        result,
        notes: `Marked as ${result}`,
      });
      setSuccess(`Asset marked as ${result}.`);
      loadCycleDetails(activeCycle.id);
    } catch (err: any) {
      setError(err.message || "Failed to verify item.");
    }
  };

  const handleVerifySingle = async (itemId: string, result: string) => {
    if (!activeCycle) return;
    try {
      await api.post(`/api/audits/cycles/${activeCycle.id}/verify`, {
        itemId,
        result,
        notes: `Marked as ${result}`,
      });
      setSuccess(`Asset marked as ${result}.`);
      loadCycleDetails(activeCycle.id);
    } catch (err: any) {
      setError(err.message || "Failed to verify item.");
    }
  };

  const handleCloseCycle = async () => {
    if (!activeCycle) return;
    try {
      await api.post(`/api/audits/cycles/${activeCycle.id}/close`);
      setSuccess("Audit cycle closed. Lost assets have been flagged.");
      loadCycles();
    } catch (err: any) {
      setError(err.message || "Failed to close cycle.");
    }
  };

  // Compute metrics
  const verified = auditItems.filter((i) => i.result === "Verified").length;
  const missing = auditItems.filter((i) => i.result === "Missing").length;
  const damaged = auditItems.filter((i) => i.result === "Damaged").length;
  const pending = auditItems.filter((i) => i.result === "Pending").length;
  const total = auditItems.length;
  const progress = total > 0 ? Math.round(((total - pending) / total) * 100) : 0;

  const filteredItems =
    filter === "All"
      ? auditItems
      : auditItems.filter((i) => i.result === filter);

  const closedCycles = cycles.filter((c) => c.status === "Closed");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Audit"
        description="Run scheduled audit cycles, verify assets against the database, and reconcile discrepancies."
        actions={
          <>
            {activeCycle && activeCycle.status !== "Closed" && (
              <button
                onClick={handleCloseCycle}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm font-medium hover:border-primary/40 hover:text-primary"
              >
                Close Cycle
              </button>
            )}
            <button
              onClick={() => setShowNewCycleModal(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              <Play className="h-4 w-4" /> Start new cycle
            </button>
          </>
        }
      />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{success}</div>
      )}

      {/* Current cycle strip */}
      {activeCycle && (
        <div className="rounded-xl border border-border bg-gradient-to-r from-blue-50 to-white p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white shadow-sm">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11.5px] font-semibold uppercase tracking-wider text-primary">
                  {activeCycle.status}
                </div>
                <div className="text-[17px] font-semibold text-blue-800">{activeCycle.name}</div>
                <div className="text-[12.5px] text-muted-foreground">
                  Scope: {activeCycle.scope} · {total} assets in scope
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Metric v={verified.toString()} l="Verified" tone="green" />
              <Metric v={missing.toString()} l="Missing" tone="red" />
              <Metric v={damaged.toString()} l="Damaged" tone="amber" />
              <Metric v={`${total - pending} / ${total}`} l="Progress" tone="blue" />
            </div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-blue-100">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Section
          title="Verification queue"
          description="Mark each asset as Verified, Missing, or Damaged."
          actions={
            <div className="flex gap-2">
              {["All", "Verified", "Missing", "Damaged", "Pending"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`h-8 rounded-md px-3 text-[12.5px] font-medium ${
                    filter === t ? "bg-primary text-white" : "border border-border bg-white text-muted-foreground hover:text-primary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          }
        >
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading audit items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {activeCycle ? "No items match the current filter." : "Create an audit cycle to begin verification."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-[11.5px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-5 py-2.5 text-left font-semibold">Tag</th>
                  <th className="px-5 py-2.5 text-left font-semibold">Asset</th>
                  <th className="px-5 py-2.5 text-left font-semibold">Location</th>
                  <th className="px-5 py-2.5 text-left font-semibold">Result</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/40">
                    <td className="px-5 py-3 font-mono text-[12.5px] font-medium text-primary">
                      {item.asset?.assetTag || "—"}
                    </td>
                    <td className="px-5 py-3 font-medium">{item.asset?.name || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{item.asset?.location || "—"}</td>
                    <td className="px-5 py-3">
                      <StatusPill tone={toneOf(item.result) as any}>
                        {item.result}
                      </StatusPill>
                    </td>
                    <td className="px-5 py-3">
                      {item.result === "Pending" && (
                        <div className="flex justify-end gap-1">
                          <IconBtn title="Verify" tone="green" onClick={() => handleVerifySingle(item.id, "Verified")}>
                            <Check className="h-3.5 w-3.5" />
                          </IconBtn>
                          <IconBtn title="Missing" tone="red" onClick={() => handleVerifySingle(item.id, "Missing")}>
                            <X className="h-3.5 w-3.5" />
                          </IconBtn>
                          <IconBtn title="Damaged" onClick={() => handleVerifySingle(item.id, "Damaged")}>
                            <HelpCircle className="h-3.5 w-3.5" />
                          </IconBtn>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        <div className="space-y-6">
          <Section title="Summary" description={activeCycle ? activeCycle.name : "—"}>
            <div className="space-y-2 p-5 text-[13px]">
              <Row l="Total assets" v={total.toString()} />
              <Row l="Verified" v={verified.toString()} green />
              <Row l="Missing" v={missing.toString()} red />
              <Row l="Damaged" v={damaged.toString()} />
              <Row l="Pending" v={pending.toString()} />
              <Row l="Completion" v={`${progress}%`} green={progress === 100} />
            </div>
          </Section>

          <Section title="Cycle history">
            {closedCycles.length === 0 ? (
              <div className="p-5 text-center text-sm text-muted-foreground">No completed cycles yet.</div>
            ) : (
              <ul className="divide-y divide-border">
                {closedCycles.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-secondary/40"
                    onClick={() => {
                      setActiveCycle(c);
                      loadCycleDetails(c.id);
                    }}
                  >
                    <div>
                      <div className="text-[13px] font-medium">{c.name}</div>
                      <div className="text-[11.5px] text-muted-foreground">Scope: {c.scope}</div>
                    </div>
                    <StatusPill tone="green">Closed</StatusPill>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>

      {/* New Cycle Modal */}
      {showNewCycleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm" onClick={() => setShowNewCycleModal(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-elevated">
            <header className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blue-800">Start New Audit Cycle</h3>
              <button onClick={() => setShowNewCycleModal(false)} className="text-muted-foreground hover:text-primary">
                <X className="h-5 w-5" />
              </button>
            </header>
            <form onSubmit={handleCreateCycle} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Cycle Name</label>
                <input
                  value={newCycle.name}
                  onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
                  placeholder="e.g. Q3 2026 — HQ Full Audit"
                  className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Scope (Department / Location)</label>
                <input
                  value={newCycle.scope}
                  onChange={(e) => setNewCycle({ ...newCycle, scope: e.target.value })}
                  placeholder="e.g. All departments"
                  className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Start Date</label>
                  <input
                    type="date"
                    value={newCycle.startDate}
                    onChange={(e) => setNewCycle({ ...newCycle, startDate: e.target.value })}
                    className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">End Date</label>
                  <input
                    type="date"
                    value={newCycle.endDate}
                    onChange={(e) => setNewCycle({ ...newCycle, endDate: e.target.value })}
                    className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                Create & Start Cycle
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ v, l, tone }: { v: string; l: string; tone: string }) {
  const c =
    tone === "green"
      ? "text-[--color-success]"
      : tone === "red"
      ? "text-[--color-destructive]"
      : tone === "amber"
      ? "text-amber-700"
      : "text-blue-800";
  return (
    <div>
      <div className={`text-[22px] font-semibold leading-none ${c}`}>{v}</div>
      <div className="mt-1 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">{l}</div>
    </div>
  );
}

function IconBtn({
  children,
  tone,
  title,
  onClick,
}: {
  children: React.ReactNode;
  tone?: "green" | "red";
  title: string;
  onClick?: () => void;
}) {
  const c =
    tone === "green"
      ? "text-[--color-success] hover:bg-green-50"
      : tone === "red"
      ? "text-[--color-destructive] hover:bg-red-50"
      : "text-muted-foreground hover:bg-accent hover:text-primary";
  return (
    <button
      title={title}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-md border border-border bg-white ${c}`}
    >
      {children}
    </button>
  );
}

function Row({ l, v, green, red }: { l: string; v: string; green?: boolean; red?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{l}</span>
      <span
        className={`font-semibold tabular-nums ${
          green ? "text-[--color-success]" : red ? "text-[--color-destructive]" : "text-foreground"
        }`}
      >
        {v}
      </span>
    </div>
  );
}
