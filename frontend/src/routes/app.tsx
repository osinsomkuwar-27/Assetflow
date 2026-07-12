import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app/sidebar";
import { AppTopbar } from "@/components/app/topbar";

import { getAuthSession } from "@/lib/auth";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    setAuthenticated(session != null);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !authenticated) {
      void navigate({ to: "/", replace: true });
    }
  }, [authenticated, navigate, ready]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-muted-foreground">
        Checking session…
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-muted-foreground">
        Redirecting to sign in…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar />
        <main className="flex-1 bg-page-grid">
          <div className="mx-auto max-w-[1440px] px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
