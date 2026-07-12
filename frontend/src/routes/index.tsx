import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Eye, EyeClosed, LineChart, ShieldCheck } from "lucide-react";

import { signIn } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Left — editorial */}
      <div className="relative hidden overflow-hidden bg-blue-800 text-white lg:block">
        <div className="absolute inset-0" style={{
          backgroundImage:
            "radial-gradient(at 15% 20%, rgba(0,180,216,0.35) 0px, transparent 55%), radial-gradient(at 85% 10%, rgba(0,150,199,0.30) 0px, transparent 50%), radial-gradient(at 75% 85%, rgba(0,180,216,0.25) 0px, transparent 55%), radial-gradient(at 20% 90%, rgba(2,95,146,0.55) 0px, transparent 55%)",
        }} />
        <div className="absolute inset-0 opacity-[0.09]" style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 78%)",
        }} />

        {/* Floating geometric marks */}
        <div className="absolute right-16 top-24 h-40 w-40 rounded-3xl border border-white/20 backdrop-blur-sm rotate-12" />
        <div className="absolute right-40 top-52 h-24 w-24 rounded-full border border-white/25" />
        <div className="absolute bottom-24 right-24 h-56 w-56 rounded-full bg-gradient-to-br from-cyan-300/25 to-transparent blur-2xl" />

        <div className="relative z-10 flex h-full flex-col p-14">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 7l8-4 8 4-8 4-8-4z" />
                <path d="M4 12l8 4 8-4" />
                <path d="M4 17l8 4 8-4" />
              </svg>
            </div>
            <div>
              <div className="text-[16px] font-semibold tracking-tight">AssetFlow</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">Enterprise ERP</div>
            </div>
          </div>

          <div className="my-auto max-w-lg">
            <h1 className="font-serif text-[52px] font-medium leading-[1.05] tracking-tight">
              Every asset,<br />
              <span className="italic text-cyan-200">accounted for.</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/75">
              A single enterprise workspace to register, allocate, book, service and audit
              every asset and resource across your organization.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/15 pt-8">
              {[
                { k: "12,480", v: "Assets under management" },
                { k: "99.98%", v: "Audit accuracy" },
                { k: "43", v: "Enterprises trust us" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="font-serif text-2xl font-medium text-white">{s.k}</div>
                  <div className="mt-1 text-[11.5px] uppercase tracking-wider text-white/55">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[12px] text-white/55">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> SOC 2 · ISO 27001</div>
              <div className="flex items-center gap-1.5"><LineChart className="h-3.5 w-3.5" /> Real-time analytics</div>
            </div>
            <div>© 2026 AssetFlow Inc.</div>
          </div>
        </div>
      </div>

      {/* Right — auth card */}
      <div className="relative flex items-center justify-center bg-background px-6 py-12">
        <div className="absolute inset-0 bg-page-grid opacity-70" />
        <div className="relative w-full max-w-[420px]">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 text-blue-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 7l8-4 8 4-8 4-8-4z" /><path d="M4 12l8 4 8-4" /><path d="M4 17l8 4 8-4" /></svg>
              </div>
              <span className="text-lg font-semibold">AssetFlow</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-elevated">
            <div className="mb-6">
              <h2 className="text-[22px] font-semibold tracking-tight text-blue-800">Sign in to AssetFlow</h2>
              <p className="mt-1 text-sm text-muted-foreground">Welcome back. Enter your work credentials to continue.</p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setIsSubmitting(true);
                const formData = new FormData(e.currentTarget);
                try {
                  const result = await signIn(
                    String(formData.get("email") ?? ""),
                    String(formData.get("password") ?? "")
                  );

                  if (!result.ok) {
                    setError(result.message);
                    setIsSubmitting(false);
                    return;
                  }

                  navigate({ to: "/app/dashboard", replace: true });
                } catch (err: any) {
                  setError(err.message || "An unexpected error occurred.");
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <Field label="Work email">
                <input
                  name="email"
                  type="email"
                  defaultValue=""
                  className="h-11 w-full rounded-md border border-border bg-white px-3.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                />
              </Field>

              <Field
                label="Password"
                right={
                  <button type="button" className="text-[12px] font-medium text-primary hover:text-primary-hover">
                    Forgot password?
                  </button>
                }
              >
                <div className="relative">
                  <input
                    name="password"
                    type={showPw ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-11 w-full rounded-md border border-border bg-white px-3.5 pr-10 text-[14px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showPw ? <Eye className="h-4 w-4" /> : <EyeClosed className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2 text-[13px] text-red-800">
                  {error}
                </div>
              )}

              <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30" />
                Keep me signed in on this device
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-[14px] font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-hover"
              >
                {isSubmitting ? "Signing in…" : "Sign in to workspace"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <div className="relative py-1 text-center">
                <div className="absolute inset-0 top-1/2 h-px bg-border" />
                <span className="relative bg-card px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Or continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="h-10 rounded-md border border-border bg-white text-[13px] font-medium hover:border-primary/40 hover:text-primary">
                  SSO · SAML
                </button>
                <button type="button" className="h-10 rounded-md border border-border bg-white text-[13px] font-medium hover:border-primary/40 hover:text-primary">
                  Microsoft 365
                </button>
              </div>

              <div className="pt-2 text-center text-[13px] text-muted-foreground">
                Need a workspace account?{' '}
                <Link to="/signup" className="font-semibold text-primary hover:text-primary-hover">
                  Create account
                </Link>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

function Field({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[12.5px] font-semibold text-foreground">{label}</label>
        {right}
      </div>
      {children}
    </div>
  );
}
