import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  Boxes,
  ArrowLeftRight,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth";
import { api } from "@/lib/api";

const nav = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/organization", label: "Organization", icon: Building2 },
  { to: "/app/assets", label: "Assets", icon: Boxes },
  { to: "/app/allocation", label: "Allocation", icon: ArrowLeftRight },
  { to: "/app/booking", label: "Resource Booking", icon: CalendarClock },
  { to: "/app/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/app/audit", label: "Audit", icon: ClipboardCheck },
  { to: "/app/reports", label: "Reports", icon: BarChart3 },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

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
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-[240px]",
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-sm">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4 7l8-4 8 4-8 4-8-4z" />
            <path d="M4 12l8 4 8-4" />
            <path d="M4 17l8 4 8-4" />
          </svg>
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold tracking-tight text-blue-800">AssetFlow</span>
            <span className="text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">
              Enterprise ERP
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-4">
        {!collapsed && (
          <div className="mb-2 px-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </div>
        )}
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-[13.5px] font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-primary" />
                  )}
                  <Icon className={cn("h-4.5 w-4.5 shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-primary")} strokeWidth={active ? 2.3 : 1.9} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.label === "Notifications" && unreadCount > 0 && (
                    <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-2.5">
        {!collapsed && (
          <div className="mb-2 rounded-md border border-border bg-secondary/60 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">Enterprise Plan</div>
            <div className="mt-1 text-xs text-muted-foreground">128 / 500 assets tracked</div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-100">
              <div className="h-full w-[26%] rounded-full bg-gradient-to-r from-blue-500 to-blue-700" />
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-primary"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          {!collapsed && (
            <button
              type="button"
              onClick={() => {
                signOut();
                window.location.assign("/");
              }}
              className="ml-auto flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
