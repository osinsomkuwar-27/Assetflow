import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, StatusPill } from "@/components/app/page-header";
import { useState } from "react";
import { Plus, Search, MoreHorizontal, Users, Tag, Building2, Upload } from "lucide-react";

export const Route = createFileRoute("/app/organization")({ component: OrgSetup });

const tabs = [
  { id: "departments", label: "Departments", icon: Building2 },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "employees", label: "Employees", icon: Users },
];

const depts = [
  { name: "Engineering", head: "Aditi Rao", parent: "—", count: 42, status: "Active" },
  { name: "Facilities", head: "Rohan Mehta", parent: "—", count: 18, status: "Active" },
  { name: "Field Ops (East)", head: "Sana Iqbal", parent: "Field Ops", count: 26, status: "Inactive" },
  { name: "Design Studio", head: "Ravi Menon", parent: "—", count: 12, status: "Active" },
  { name: "Finance", head: "Kavya Nair", parent: "—", count: 9, status: "Active" },
  { name: "IT Infrastructure", head: "Arjun Nair", parent: "IT", count: 21, status: "Active" },
];

function OrgSetup() {
  const [active, setActive] = useState("departments");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Setup"
        description="Manage departments, asset categories and employees. Changes here propagate to allocation, booking and audit modules."
        actions={
          <>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm font-medium hover:border-primary/40 hover:text-primary">
              <Upload className="h-4 w-4" /> Import CSV
            </button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              <Plus className="h-4 w-4" /> Add
            </button>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((t) => {
          const on = active === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                on ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold ${on ? "bg-blue-50 text-primary" : "bg-muted text-muted-foreground"}`}>
                {t.id === "departments" ? 12 : t.id === "categories" ? 24 : 148}
              </span>
              {on && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Section
          title="Departments"
          description="Editing a department here also drives the pickers in Assets, Allocation and Booking."
          actions={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input placeholder="Filter…" className="h-8 w-48 rounded-md border border-border bg-white pl-8 pr-3 text-[13px] focus:border-primary focus:outline-none" />
              </div>
            </div>
          }
        >
          <table className="w-full text-sm">
            <thead className="text-[11.5px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-5 py-2.5 text-left font-semibold">Department</th>
                <th className="px-5 py-2.5 text-left font-semibold">Head</th>
                <th className="px-5 py-2.5 text-left font-semibold">Parent</th>
                <th className="px-5 py-2.5 text-right font-semibold">Members</th>
                <th className="px-5 py-2.5 text-left font-semibold">Status</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {depts.map((d) => (
                <tr key={d.name} className="hover:bg-secondary/40">
                  <td className="px-5 py-3">
                    <div className="font-medium">{d.name}</div>
                    <div className="text-[11.5px] text-muted-foreground">Created Jan 12, 2025</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[10.5px] font-semibold text-primary">
                        {d.head.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-[13px]">{d.head}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{d.parent}</td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums">{d.count}</td>
                  <td className="px-5 py-3">
                    <StatusPill tone={d.status === "Active" ? "green" : "muted"}>{d.status}</StatusPill>
                  </td>
                  <td className="px-3">
                    <button className="text-muted-foreground hover:text-primary"><MoreHorizontal className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Quick add" description="Create a new department">
          <form className="space-y-3 p-5">
            <FormField label="Department name" placeholder="e.g. Product Ops" />
            <FormField label="Department head" placeholder="Search employees…" />
            <FormField label="Parent department" placeholder="None" />
            <div>
              <label className="mb-1.5 block text-[12.5px] font-semibold">Status</label>
              <div className="flex gap-2">
                <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-primary bg-blue-50 px-3 py-2 text-[13px] font-medium text-primary">
                  <input type="radio" name="s" defaultChecked className="h-3.5 w-3.5 accent-[var(--primary)]" /> Active
                </label>
                <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-[13px] font-medium">
                  <input type="radio" name="s" className="h-3.5 w-3.5" /> Inactive
                </label>
              </div>
            </div>
            <button type="button" className="mt-2 h-10 w-full rounded-md bg-primary text-[13.5px] font-semibold text-primary-foreground hover:bg-primary-hover">
              Create department
            </button>
          </form>
        </Section>
      </div>
    </div>
  );
}

function FormField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-semibold">{label}</label>
      <input placeholder={placeholder} className="h-10 w-full rounded-md border border-border bg-white px-3 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" />
    </div>
  );
}
