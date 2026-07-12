import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, StatusPill } from "@/components/app/page-header";
import { Plus, MoreHorizontal, Clock, User, Check, X, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { getAuthSession } from "@/lib/auth";

export const Route = createFileRoute("/app/maintenance")({ component: Maintenance });

function Maintenance() {
  const session = getAuthSession();
  const isManager = ["Admin", "AssetManager"].includes(session?.role || "");

  const [requests, setRequests] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [showNewModal, setShowNewModal] = useState(false);
  const [newRequest, setNewRequest] = useState({ assetId: "", issueDescription: "", priority: "Medium" });

  // Action input states
  const [techNameInput, setTechNameInput] = useState<{ [id: string]: string }>({});
  const [resolutionInput, setResolutionInput] = useState<{ [id: string]: string }>({});

  const loadRequests = async () => {
    setLoading(true);
    try {
      const [maintData, assetsData] = await Promise.all([
        api.get<any[]>("/api/maintenance"),
        api.get<any[]>("/api/assets"),
      ]);
      setRequests(maintData);
      setAssets(assetsData);
    } catch (err: any) {
      setError(err.message || "Failed to load maintenance requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.assetId || !newRequest.issueDescription) return;
    try {
      await api.post("/api/maintenance", {
        assetId: newRequest.assetId,
        issueDescription: newRequest.issueDescription,
        priority: newRequest.priority,
      });

      setSuccess("Maintenance request raised successfully.");
      setShowNewModal(false);
      setNewRequest({ assetId: "", issueDescription: "", priority: "Medium" });
      loadRequests();
    } catch (err: any) {
      setError(err.message || "Failed to raise maintenance request.");
    }
  };

  // Operations actions
  const handleApprove = async (id: string) => {
    try {
      await api.post(`/api/maintenance/${id}/approve`);
      setSuccess("Maintenance request approved.");
      loadRequests();
    } catch (err: any) {
      setError(err.message || "Failed to approve request.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/api/maintenance/${id}/reject`, { reason: "Declined by Manager" });
      setSuccess("Maintenance request rejected.");
      loadRequests();
    } catch (err: any) {
      setError(err.message || "Failed to reject request.");
    }
  };

  const handleAssign = async (id: string) => {
    const name = techNameInput[id];
    if (!name) return;
    try {
      await api.post(`/api/maintenance/${id}/assign`, { technicianName: name });
      setSuccess("Technician assigned.");
      setTechNameInput({ ...techNameInput, [id]: "" });
      loadRequests();
    } catch (err: any) {
      setError(err.message || "Failed to assign technician.");
    }
  };

  const handleStart = async (id: string) => {
    try {
      await api.post(`/api/maintenance/${id}/start`);
      setSuccess("Maintenance repair started.");
      loadRequests();
    } catch (err: any) {
      setError(err.message || "Failed to start repair.");
    }
  };

  const handleResolve = async (id: string) => {
    const notes = resolutionInput[id] || "Resolved";
    try {
      await api.post(`/api/maintenance/${id}/resolve`, { resolutionNotes: notes });
      setSuccess("Maintenance resolved and asset marked Available.");
      setResolutionInput({ ...resolutionInput, [id]: "" });
      loadRequests();
    } catch (err: any) {
      setError(err.message || "Failed to resolve maintenance.");
    }
  };

  // Columns mapper
  const columns = [
    { id: "Pending", title: "Pending Approval", tone: "muted" as const },
    { id: "Approved", title: "Approved", tone: "blue" as const },
    { id: "TechnicianAssigned", title: "Tech Assigned", tone: "blue" as const },
    { id: "InProgress", title: "In Progress", tone: "amber" as const },
    { id: "Resolved", title: "Resolved", tone: "green" as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Management"
        description="Approval workflow board. Approving a request flips the asset to UnderMaintenance; resolving it returns the asset to Available."
        actions={
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" /> New request
          </button>
        }
      />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-4">
          {columns.map((col) => {
            const colCards = requests.filter((r) => r.status === col.id);
            return (
              <div key={col.id} className="w-[280px] shrink-0 rounded-xl border border-border bg-secondary/20 p-3 space-y-3">
                <header className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <StatusPill tone={col.tone}>{col.title}</StatusPill>
                    <span className="text-[11.5px] font-semibold text-muted-foreground">{colCards.length}</span>
                  </div>
                </header>

                <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                  {colCards.map((c) => (
                    <article key={c.id} className="rounded-lg border border-border bg-white p-3 shadow-card space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="font-mono text-[11.5px] font-medium text-primary">
                          {c.asset?.assetTag || "Asset"}
                        </span>
                        <StatusPill tone={c.priority === "High" || c.priority === "Critical" ? "red" : c.priority === "Medium" ? "blue" : "muted"}>
                          {c.priority}
                        </StatusPill>
                      </div>
                      <div className="text-[13.5px] font-semibold leading-snug">{c.asset?.name || "Asset"}</div>
                      <div className="text-[12px] text-muted-foreground">{c.issueDescription}</div>

                      {/* Display assigned technician */}
                      {c.technician && (
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <User className="h-3.5 w-3.5" /> Tech: {c.technician}
                        </div>
                      )}

                      {/* Manager action controls inside the Kanban columns */}
                      {isManager && (
                        <div className="border-t border-border pt-2 mt-2 space-y-2">
                          {c.status === "Pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(c.id)}
                                className="flex-1 inline-flex justify-center items-center h-7 rounded bg-green-700 text-white text-[11px] font-semibold hover:bg-green-800"
                              >
                                <Check className="h-3 w-3 mr-1" /> Approve
                              </button>
                              <button
                                onClick={() => handleReject(c.id)}
                                className="flex-1 inline-flex justify-center items-center h-7 rounded bg-red-700 text-white text-[11px] font-semibold hover:bg-red-800"
                              >
                                <X className="h-3 w-3 mr-1" /> Reject
                              </button>
                            </div>
                          )}

                          {c.status === "Approved" && (
                            <div className="space-y-1.5">
                              <input
                                placeholder="Tech name..."
                                value={techNameInput[c.id] || ""}
                                onChange={(e) => setTechNameInput({ ...techNameInput, [c.id]: e.target.value })}
                                className="h-7 w-full rounded border border-border bg-white px-2 text-[11px] focus:outline-none"
                              />
                              <button
                                onClick={() => handleAssign(c.id)}
                                className="w-full inline-flex justify-center items-center h-7 rounded bg-primary text-white text-[11px] font-semibold hover:bg-primary-hover"
                              >
                                Assign Tech
                              </button>
                            </div>
                          )}

                          {c.status === "TechnicianAssigned" && (
                            <button
                              onClick={() => handleStart(c.id)}
                              className="w-full inline-flex justify-center items-center h-7 rounded bg-primary text-white text-[11px] font-semibold hover:bg-primary-hover"
                            >
                              Start Repair Work
                            </button>
                          )}

                          {c.status === "InProgress" && (
                            <div className="space-y-1.5">
                              <input
                                placeholder="Resolution notes..."
                                value={resolutionInput[c.id] || ""}
                                onChange={(e) => setResolutionInput({ ...resolutionInput, [c.id]: e.target.value })}
                                className="h-7 w-full rounded border border-border bg-white px-2 text-[11px] focus:outline-none"
                              />
                              <button
                                onClick={() => handleResolve(c.id)}
                                className="w-full inline-flex justify-center items-center h-7 rounded bg-green-700 text-white text-[11px] font-semibold hover:bg-green-800"
                              >
                                Mark Resolved
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Request Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm" onClick={() => setShowNewModal(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-elevated">
            <header className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blue-800">Raise Maintenance Request</h3>
              <button onClick={() => setShowNewModal(false)} className="text-muted-foreground hover:text-primary">
                <X className="h-5 w-5" />
              </button>
            </header>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Asset</label>
                <select
                  value={newRequest.assetId}
                  onChange={(e) => setNewRequest({ ...newRequest, assetId: e.target.value })}
                  className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
                  required
                >
                  <option value="">Select Asset...</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.assetTag} — {a.name} ({a.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold">Issue Description</label>
                <textarea
                  value={newRequest.issueDescription}
                  onChange={(e) => setNewRequest({ ...newRequest, issueDescription: e.target.value })}
                  placeholder="Describe the malfunction..."
                  rows={4}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold">Priority</label>
                <select
                  value={newRequest.priority}
                  onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                  className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <button
                type="submit"
                className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
