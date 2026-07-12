import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-blue-800">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Section({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card shadow-card", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div>
            {title && <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatusPill({
  tone = "blue",
  children,
}: {
  tone?: "blue" | "green" | "red" | "muted" | "amber";
  children: ReactNode;
}) {
  const map = {
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    green: "bg-green-50 text-[--color-success] ring-green-200",
    red: "bg-red-50 text-[--color-destructive] ring-red-200",
    muted: "bg-muted text-muted-foreground ring-border",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
  }[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-medium ring-1 ring-inset", map)}>
      <span className={cn("h-1.5 w-1.5 rounded-full",
        tone === "green" && "bg-[--color-success]",
        tone === "red" && "bg-[--color-destructive]",
        tone === "blue" && "bg-primary",
        tone === "muted" && "bg-muted-foreground",
        tone === "amber" && "bg-amber-600",
      )} />
      {children}
    </span>
  );
}
