import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, StatusPill } from "@/components/app/page-header";
import { AlertTriangle, ChevronLeft, ChevronRight, Plus, Users, Calendar, X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/booking")({ component: Booking });

const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

function Booking() {
  const [bookableAssets, setBookableAssets] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);

  // Timeline render parameters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Booking Form State
  const [showModal, setShowModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
  });

  // Conflict and message states
  const [conflict, setConflict] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      // Query assets flagged as shared/bookable
      const res = await api.get<any[]>("/api/assets");
      const bookables = res.filter((a) => a.isBookable);
      setBookableAssets(bookables);
      if (bookables.length > 0 && !selectedAssetId) {
        setSelectedAssetId(bookables[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load bookable resources.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadBookings = async (assetId: string) => {
    if (!assetId) return;
    try {
      const res = await api.get<any[]>(`/api/bookings/asset/${assetId}`);
      // Filter for currently selected date
      const dateFiltered = res.filter((b) => {
        const bDate = new Date(b.startTime).toISOString().split("T")[0];
        return bDate === selectedDate && b.status !== "Cancelled";
      });
      setBookings(dateFiltered);
    } catch (err) {
      setBookings([]);
    }
  };

  useEffect(() => {
    loadBookings(selectedAssetId);
    setConflict(null);
  }, [selectedAssetId, selectedDate]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setConflict(null);

    const startDateTime = new Date(`${newBooking.date}T${newBooking.startTime}:00`);
    const endDateTime = new Date(`${newBooking.date}T${newBooking.endTime}:00`);

    if (startDateTime >= endDateTime) {
      setError("Start time must be earlier than end time.");
      return;
    }

    try {
      await api.post("/api/bookings", {
        assetId: selectedAssetId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      setSuccess("Booking successfully confirmed!");
      setShowModal(false);
      loadBookings(selectedAssetId);
    } catch (err: any) {
      if (err.message.includes("overlap") || err.message.includes("conflict")) {
        setConflict(true);
      } else {
        setError(err.message || "Failed to create booking.");
      }
    }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      await api.post(`/api/bookings/${id}/cancel`);
      setSuccess("Booking cancelled successfully.");
      loadBookings(selectedAssetId);
    } catch (err: any) {
      setError(err.message || "Failed to cancel booking.");
    }
  };

  // Convert time string "HH:MM" to numerical float (e.g. 9.5 for 9:30)
  const getHourOffset = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h + m / 60;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Booking"
        description="Meeting rooms, labs and shared equipment on a single timeline. Conflicts are surfaced before you commit."
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" /> Book a slot
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

      {/* Conflict banner */}
      {conflict && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/70 px-4 py-3 text-sm animate-pulse">
          <AlertTriangle className="mt-0.5 h-4.5 w-4.5 text-[--color-destructive]" />
          <div className="flex-1">
            <div className="font-semibold text-[--color-destructive]">
              Selected slot conflicts with an existing booking.
            </div>
            <div className="text-[13px] text-red-900/70">
              Please choose another timeline window on the grid below.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        {/* Resource List Picker */}
        <aside className="space-y-3">
          <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Resources</h3>
          <div className="flex flex-col gap-2">
            {bookableAssets.map((asset) => {
              const active = asset.id === selectedAssetId;
              return (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAssetId(asset.id)}
                  className={`flex flex-col items-start rounded-lg border p-3 text-left transition-colors ${
                    active ? "border-primary bg-blue-50/50" : "border-border bg-white hover:bg-secondary/40"
                  }`}
                >
                  <span className="text-[13.5px] font-semibold">{asset.name}</span>
                  <span className="mt-0.5 text-[11px] text-muted-foreground">{asset.assetTag} · {asset.location}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Timeline Grid */}
        <Section
          title={`Timeline: ${new Date(selectedDate).toLocaleDateString()}`}
          description="Drag to select or quick-book a slot. Conflicting segments are highlighted."
          actions={
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-8 rounded-md border border-border bg-white px-2 text-xs"
              />
            </div>
          }
        >
          <div className="overflow-x-auto p-5">
            <div className="min-w-[700px]">
              {/* Hour Grid Headers */}
              <div className="grid grid-cols-10 border-b border-border pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">
                {hours.map((h) => (
                  <div key={h} className="border-l border-border first:border-l-0">{h}</div>
                ))}
              </div>

              {/* Booking Blocks Render Grid */}
              <div className="relative mt-4 h-24 rounded-lg border border-dashed border-border bg-secondary/20">
                {/* Vertical lines */}
                <div className="absolute inset-0 grid grid-cols-10">
                  {hours.map((_, i) => <div key={i} className="border-l border-border first:border-l-0" />)}
                </div>

                {/* Render booking boxes */}
                {bookings.map((b) => {
                  const sTime = new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                  const eTime = new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

                  const sOffset = Math.max(8, getHourOffset(sTime));
                  const eOffset = Math.min(18, getHourOffset(eTime));
                  const span = eOffset - sOffset;

                  if (span <= 0) return null;

                  // Compute left & width as percentages of the 10-hour grid (8 AM to 6 PM)
                  const leftPercent = ((sOffset - 8) / 10) * 100;
                  const widthPercent = (span / 10) * 100;

                  return (
                    <div
                      key={b.id}
                      className="absolute top-3 bottom-3 rounded-md bg-primary text-white border-transparent px-3 py-2 text-xs font-semibold shadow-sm flex items-center justify-between"
                      style={{ left: `calc(${leftPercent}% + 4px)`, width: `calc(${widthPercent}% - 8px)` }}
                    >
                      <div className="truncate">
                        Booked: {sTime} - {eTime}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(b.id)}
                        className="text-white hover:text-red-200"
                        title="Cancel Booking"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Booking Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-elevated">
            <header className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blue-800">Book Slots</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-primary">
                <X className="h-5 w-5" />
              </button>
            </header>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Date</label>
                <input
                  type="date"
                  value={newBooking.date}
                  onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                  className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Start Time</label>
                  <select
                    value={newBooking.startTime}
                    onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                    className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">End Time</label>
                  <select
                    value={newBooking.endTime}
                    onChange={(e) => setNewBooking({ ...newBooking, endTime: e.target.value })}
                    className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00">18:00</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
