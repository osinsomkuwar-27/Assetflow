import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Eye, EyeClosed, LineChart, ShieldCheck } from "lucide-react";

import { signUp } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
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
              Create your<br />
              <span className="italic text-cyan-200">workspace account.</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/75">
              Register to manage assets, approvals, and organizational workflows in one place.
            </p>
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

      <div className="relative flex items-center justify-center bg-background px-6 py-12">
        <div className="absolute inset-0 bg-page-grid opacity-70" />
        <div className="relative w-full max-w-[420px]">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-elevated">
            <div className="mb-6">
              <h2 className="text-[22px] font-semibold tracking-tight text-blue-800">Create your Account</h2>
              <p className="mt-1 text-sm text-muted-foreground">Set up your AssetFlow workspace access in a few steps.</p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const result = signUp({
                  name: String(formData.get("name") ?? ""),
                  email: String(formData.get("email") ?? ""),
                  password: String(formData.get("password") ?? ""),
                  department: String(formData.get("department") ?? ""),
                });

                if (!result.ok) {
                  setError(result.message);
                  return;
                }

                setError(null);
                setIsSubmitting(true);
                void navigate({ to: "/app/dashboard", replace: true });
              }}
              className="space-y-4"
            >
              <Field label="Full name">
                <input
                  name="name"
                  type="text"
                  className="h-11 w-full rounded-md border border-border bg-white px-3.5 text-[14px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  placeholder="Aditi Rao"
                  required
                />
              </Field>

              <Field label="Work email">
                <input
                  name="email"
                  type="email"
                  className="h-11 w-full rounded-md border border-border bg-white px-3.5 text-[14px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                />
              </Field>

              <Field label="Department (optional)">
                <input
                  name="department"
                  type="text"
                  className="h-11 w-full rounded-md border border-border bg-white px-3.5 text-[14px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  placeholder="Facilities"
                />
              </Field>

              <Field label="Password">
                <div className="relative">
                  <input
                    name="password"
                    type={showPw ? "text" : "password"}
                    className="h-11 w-full rounded-md border border-border bg-white px-3.5 pr-10 text-[14px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((value) => !value)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showPw ? <Eye className="h-4 w-4" /> : <EyeClosed className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              {error && <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2 text-[13px] text-red-800">{error}</div>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-[14px] font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-hover"
              >
                {isSubmitting ? "Creating account…" : "Create account"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <div className="pt-2 text-center text-[13px] text-muted-foreground">
                Already have an account?{' '}
                <Link to="/" className="font-semibold text-primary hover:text-primary-hover">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-semibold text-foreground">{label}</label>
      {children}
    </div>
  );
}
