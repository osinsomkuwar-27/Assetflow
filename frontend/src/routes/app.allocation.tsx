import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, StatusPill } from "@/components/app/page-header";
import { AlertTriangle, ArrowRight, Search, User, CheckCircle2, Check, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/allocation")({ component: Allocation });

function Allocation() {
  const [assets, setAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // Allocation Form
  const [holderType, setHolderType] = useState<"Employee" | "Department">("Employee");
  const [holderId, setHolderId] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");

  // Conflict state
  const [conflict, setConflict] = useState<any | null>(null);

  // Transfer Request Form
  const [requestedHolderType, setRequestedHolderType] = useState<"Employee" | "Department">("Employee");
  const [requestedHolderId, setRequestedHolderId] = useState("");
  const [transferNotes, setTransferNotes] = useState("");

  // History & Lists
  const [history, setHistory] = useState<any[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [assetsData, employeesData] = await Promise.all([
        api.get<any[]>("/api/assets"),
        api.get<any[]>("/api/org/employees"),
      ]);
      setAssets(assetsData);
      setEmployees(employeesData);

      // Load pending transfers from the database
      // Since transfer requests are linked to allocations/assets, let's query transfer requests
      // Kshitij's schema: model TransferRequest { id, assetId, asset, fromAllocationId... status }
      // Let's create an endpoint in allocations for pending or just fetch via Prisma if no endpoint.
      // Wait, does he have an endpoint to list transfer requests?
      // Kshitij's allocations.routes.js:
      // router.post('/', controller.allocate);
      // router.post('/transfer-request', controller.transferRequest);
      // router.post('/transfer/:id/approve', controller.transferApprove);
      // router.post('/return', controller.returnAsset);
      // router.get('/history/:assetId', controller.history);
      // He doesn't have an endpoint to list transfer requests! Let's build a quick one or fetch it.
      // Wait! We can check if there are transfer requests we need to display. If there is no endpoint, we can make one!
      // Let's see if we should create a routes/endpoint for fetching transfer requests. Yes, that is very easy and clean!
      // But first, let's write the Allocation page integration.
    } catch (err: any) {
      setError(err.message || "Failed to load directory.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadAssetHistory = async (assetId: string) => {
    try {
      const historyData = await api.get<any[]>(`/api/allocations/history/${assetId}`);
      setHistory(historyData);
    } catch (err: any) {
      setHistory([]);
    }
  };

  useEffect(() => {
    if (selectedAssetId) {
      const asset = assets.find((a) => a.id === selectedAssetId);
      setSelectedAsset(asset || null);
      loadAssetHistory(selectedAssetId);
      setConflict(null);
    } else {
      setSelectedAsset(null);
      setHistory([]);
      setConflict(null);
    }
  }, [selectedAssetId, assets]);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!selectedAssetId || !holderId) return;

    try {
      // POST to /api/allocations
      await api.post("/api/allocations", {
        assetId: selectedAssetId,
        holderType,
        holderId,
        expectedReturnDate: expectedReturnDate || undefined,
      });

      setSuccess("Asset successfully allocated!");
      setConflict(null);
      setSelectedAssetId("");
      loadData();
    } catch (err: any) {
      // Check if 409 conflict was thrown
      if (err.message.includes("allocated") || err.message.includes("holder")) {
        // Find existing allocation details to render in banner
        // Kshitij's controller returns conflict details directly in the status 409 response
        // But our api client throws the error message. Let's make sure we handle it.
        // We can check the asset status instead as a fallback!
        if (selectedAsset) {
          setConflict({
            currentHolderType: selectedAsset.currentHolderType,
            currentHolderId: selectedAsset.currentHolderId,
          });
        }
      } else {
        setError(err.message || "Allocation failed.");
      }
    }
  };

  const handleTransferRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!selectedAssetId || !requestedHolderId) return;

    try {
      await api.post("/api/allocations/transfer-request", {
        assetId: selectedAssetId,
        requestedHolderType,
        requestedHolderId,
        notes: transferNotes || undefined,
      });

      setSuccess("Transfer request submitted successfully!");
      setConflict(null);
      setSelectedAssetId("");
      setTransferNotes("");
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to submit transfer request.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Allocation & Transfer"
        description="Move assets between employees safely. Direct re-allocation is blocked when an asset is already assigned — submit a transfer request instead."
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Section title="Asset Assignment" description="Choose an asset to allocate or transfer">
          <div className="space-y-5 p-6">
            <div>
              <label className="mb-1.5 block text-[12.5px] font-semibold">Select Asset</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="h-11 w-full rounded-md border border-border bg-white px-3 text-[13.5px] font-medium focus:border-primary focus:outline-none"
              >
                <option value="">Select an asset...</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.assetTag} — {a.name} ({a.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Double-allocation block */}
            {conflict && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/70 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-[--color-destructive]" />
                <div className="flex-1 text-[13px]">
                  <div className="font-semibold text-[--color-destructive]">
                    Already allocated to {conflict.currentHolderType} ({conflict.currentHolderId})
                  </div>
                  <div className="mt-0.5 text-red-900/70">
                    Direct re-allocation is blocked. Submit a transfer request below — the request will route for approval.
                  </div>
                </div>
              </div>
            )}

            {selectedAsset && !conflict && (
              <form onSubmit={handleAllocate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Holder Type</label>
                    <select
                      value={holderType}
                      onChange={(e: any) => setHolderType(e.target.value)}
                      className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Department">Department</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Holder</label>
                    <select
                      value={holderId}
                      onChange={(e) => setHolderId(e.target.value)}
                      className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
                      required
                    >
                      <option value="">Select Assignee...</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Expected Return Date</label>
                  <input
                    type="date"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
                >
                  Allocate Asset
                </button>
              </form>
            )}

            {/* Transfer request section if conflict is active */}
            {conflict && (
              <form onSubmit={handleTransferRequest} className="rounded-lg border border-border bg-secondary/50 p-4 space-y-4">
                <div className="text-[12.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  New Transfer Request
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-muted-foreground">From</label>
                    <div className="flex h-11 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm text-muted-foreground">
                      {conflict.currentHolderId.substring(0, 8)}
                    </div>
                  </div>
                  <ArrowRight className="mb-3 h-5 w-5 text-primary" />
                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-muted-foreground">To (Target Holder)</label>
                    <select
                      value={requestedHolderId}
                      onChange={(e) => setRequestedHolderId(e.target.value)}
                      className="h-11 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
                      required
                    >
                      <option value="">Select employee...</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-muted-foreground">Reason</label>
                  <textarea
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    rows={3}
                    placeholder="Add context for approvers..."
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConflict(null)}
                    className="inline-flex h-9 items-center rounded-md border border-border bg-white px-3 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
                  >
                    Submit Transfer Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </Section>

        <div className="space-y-6">
          <Section title="Allocation History" description={selectedAsset ? `${selectedAsset.assetTag} chain of custody` : "Select an asset to view history"}>
            {history.length === 0 ? (
              <div className="p-5 text-center text-sm text-muted-foreground">No allocation log history available.</div>
            ) : (
              <ol className="space-y-4 border-l border-border px-6 py-5 [margin-left:1.5rem]">
                {history.map((h) => (
                  <li key={h.id} className="relative pl-4">
                    <span className={`absolute -left-[7px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${h.status === "Active" ? "bg-[--color-success]" : "bg-primary"}`} />
                    <div className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-[13px] font-medium">
                      {h.status === "Active" ? "Allocated" : "Returned"} to {h.holderType}
                    </div>
                    <div className="text-[11.5px] text-muted-foreground">
                      Holder ID: {h.holderId.substring(0, 8)}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
