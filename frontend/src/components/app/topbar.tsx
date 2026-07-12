import { Search, Bell, Settings, Plus, HelpCircle, ChevronDown } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const titles: Record<string, string> = {
  "/app/dashboard": "Dashboard",
  "/app/organization": "Organization",
  "/app/assets": "Assets",
  "/app/allocation": "Allocation",
  "/app/booking": "Resource Booking",
  "/app/maintenance": "Maintenance",
  "/app/audit": "Audit",
  "/app/reports": "Reports",
  "/app/notifications": "Notifications",
};

export function AppTopbar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const title = titles[pathname] ?? "Workspace";

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get<{ count: number }>("/api/notifications/unread-count");
      setUnreadCount(res.count || 0);
    } catch (err) {
      console.error("Error fetching notifications count:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    window.addEventListener("notifications-updated", fetchUnreadCount);
    return () => window.removeEventListener("notifications-updated", fetchUnreadCount);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-white/85 px-6 backdrop-blur">
      <nav className="hidden items-center gap-1.5 text-[13px] text-muted-foreground md:flex">
        <span>Acme Industries</span>
        <span className="text-border">/</span>
        <span className="font-medium text-foreground">{title}</span>
      </nav>

      <div className="ml-auto flex flex-1 items-center justify-end gap-2.5 md:flex-none">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search assets, employees, requests…"
            className="h-9 w-[340px] rounded-md border border-border bg-surface pl-9 pr-16 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        <button className="hidden h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary md:inline-flex">
          <Plus className="h-4 w-4" />
          Quick action
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>

        <IconButton>
          <HelpCircle className="h-4.5 w-4.5" />
        </IconButton>
        <IconButton>
          <Settings className="h-4.5 w-4.5" />
        </IconButton>
        <IconButton badge={unreadCount > 0 ? String(unreadCount) : undefined}>
          <Bell className="h-4.5 w-4.5" />
        </IconButton>

        <div className="ml-1 flex items-center gap-2.5 rounded-md border border-border bg-white pl-1 pr-2.5 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-700 text-[11px] font-semibold text-white">
            AR
          </div>
          <div className="hidden text-left md:block">
            <div className="text-[12.5px] font-semibold leading-tight">Aditi Rao</div>
            <div className="text-[10.5px] leading-tight text-muted-foreground">Facilities Admin</div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}

function IconButton({ children, badge }: { children: React.ReactNode; badge?: string }) {
  return (
    <button className="relative flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-primary">
      {children}
      {badge && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-2 ring-white">
          {badge}
        </span>
      )}
    </button>
  );
}
