# AssetFlow — Frontend Design System & Screen Specification

**Prepared for:** Odoo Hackathon 2026
**Frontend ownership (this doc's author):** Resource Booking, Maintenance, Audit, Reports, Notifications
**Document owner:** Shreeja Mahale
**Version:** 1.0 — July 2026

---

## 1. Introduction

This document defines the visual design system and the screen-level functional specification for AssetFlow, the Enterprise Asset & Resource Management System being built for the Odoo Hackathon. It exists so that the two frontend contributors on the team can build independently, in parallel, and still produce a single application that looks and behaves as though one person designed it.

The document has two parts. **Part A** defines the design system — color palette, typography, shape language, iconography, and theming rules that every screen must follow, along with the reasoning behind each choice. **Part B** applies that system to each of the ten screens defined in the problem statement, listing the functional requirements each screen must satisfy and how the design system maps onto that screen specifically.

All requirements referenced in Part B are drawn directly from the official AssetFlow problem statement and the accompanying wireframe (Excalidraw POC) provided by the hackathon organizers.

---

# Part A — Design System

## 2. Design Rationale

AssetFlow is an internal operations tool used to track physical equipment, rooms, and vehicles across an organization. It is not a consumer product, so the visual language prioritizes clarity, scanability, and trustworthiness over decoration. Two deliberate choices follow from this:

- A single-hue (monochromatic) blue system is used everywhere except two functional exceptions — **Approve** and **Decline** actions — which get their own green and red so irreversible, high-stakes actions are never confused with routine navigation or state changes.
- The same nine-step blue scale is used for both the light and dark theme, simply read in opposite directions. This keeps the palette internally consistent instead of requiring a second, unrelated dark-mode palette to be invented and maintained.

## 3. Color Palette

### Base scale (lightest → darkest)

| Swatch | Hex | Role | Usage |
|---|---|---|---|
| 🟦 | `#CAF0F8` | Blue 50 | Lightest step. Page background in light theme. |
| 🟦 | `#ADE8F4` | Blue 100 | Muted fills, disabled states, soft badge backgrounds (light theme). |
| 🟦 | `#90E0EF` | Blue 200 | Borders and dividers (light theme). |
| 🟦 | `#48CAE4` | Blue 300 | Hover highlights; accent color in dark theme. |
| 🟦 | `#00B4D8` | Blue 400 | Secondary accent; primary accent in dark theme. |
| 🟦 | `#0096C7` | Blue 500 | Hover state for the primary accent (light theme). |
| 🟦 | `#0077B6` | Blue 600 | Primary accent — buttons, links, active nav item (light theme). |
| 🟦 | `#023E8A` | Blue 700 | Secondary text; card surfaces in dark theme. |
| 🟦 | `#03045E` | Blue 800 | Primary text/headings (light theme). Page background in dark theme. |

### 3.1 Light Theme Assignment

| Token | Value |
|---|---|
| Page background | `#CAF0F8` (Blue 50) |
| Card / surface background | `#FFFFFF`, bordered with Blue 200 (`#90E0EF`) |
| Border / divider | `#90E0EF` (Blue 200) |
| Primary text | `#03045E` (Blue 800) |
| Secondary / muted text | `#023E8A` (Blue 700), 70% opacity for captions |
| Primary accent (buttons, links, active nav) | `#0077B6` (Blue 600) |
| Accent hover | `#0096C7` (Blue 500) |
| Soft accent fill (chips, selected rows) | `#ADE8F4` (Blue 100) |

### 3.2 Dark Theme Assignment

The dark theme is not a separate palette — it re-reads the same nine swatches from the opposite end, so the two themes stay visually related rather than feeling like two different products.

| Token | Value |
|---|---|
| Page background | `#03045E` (Blue 800) |
| Card / surface background | `#023E8A` (Blue 700), slightly lifted from page background |
| Border / divider | `#0077B6` (Blue 600) at 40% opacity |
| Primary text | `#CAF0F8` (Blue 50) |
| Secondary / muted text | `#ADE8F4` (Blue 100), 70% opacity for captions |
| Primary accent (buttons, links, active nav) | `#00B4D8` (Blue 400) — chosen over Blue 600 because it holds contrast on a dark background |
| Accent hover | `#48CAE4` (Blue 300) |
| Soft accent fill (chips, selected rows) | `#023E8A` (Blue 700) at 60% opacity |

### 3.3 Functional Exception — Approve / Decline

Green and red are reserved **exclusively** for the Approve/Decline family of actions and the statuses that result directly from them. Never reuse them decoratively or for ordinary navigation.

| Status | Color Role | Hex |
|---|---|---|
| Approve button / Verified / Available | Success green | `#2E7D32` |
| Approve button (dark theme) | Success green (dark) | `#66BB6A` |
| Decline button / Missing / Lost | Danger red | `#C62828` |
| Decline button (dark theme) | Danger red (dark) | `#EF5350` |

### 3.4 Non-Approval Status Colors

Every other status (asset lifecycle, booking status, maintenance stage) stays inside the blue scale, differentiated by shade rather than hue — this is what keeps the interface monochromatic in practice.

| Status | Color Role | Hex |
|---|---|---|
| Reserved / Upcoming / In Progress | Blue 400 | `#00B4D8` |
| Allocated / Ongoing | Blue 600 | `#0077B6` |
| Under Maintenance / Pending | Blue 500 | `#0096C7` |
| Retired / Cancelled / Disposed | Muted grey-blue | `#5C6470` |

## 4. Typography

Two typefaces, each with a single job. No third face is introduced — asset tags/IDs (e.g. `AF-0001`) are set in Sono at medium weight with slightly increased letter-spacing rather than switching typeface.

| Role | Specification |
|---|---|
| Headings, nav labels, buttons | Source Sans 3, weight 600–700 |
| Body text, tables, forms, descriptions | Sono, weight 400–500 |
| Asset Tags / Serial Numbers / IDs | Sono, weight 500, +0.5px letter-spacing, set in accent color |

### 4.1 Type Scale

| Level | Size / Line-height / Weight |
|---|---|
| H1 — Page title | 28px / 36px / Source Sans 3, 700 |
| H2 — Section header | 22px / 30px / Source Sans 3, 600 |
| H3 — Card / block title | 17px / 24px / Source Sans 3, 600 |
| Body | 14px / 20px / Sono, 400 |
| Small / caption / table meta | 12px / 16px / Sono, 400 |
| Button label | 14px / 20px / Source Sans 3, 600 |

## 5. Shape Language

Rounded corners throughout, radius scaling with element size.

| Element | Radius |
|---|---|
| Buttons, inputs, badges, status pills | 8px |
| Cards, panels, modals | 12px |
| Large containers (dashboard KPI blocks) | 16px |

## 6. Iconography

**Lucide** is the only icon set used across the app — mixing icon libraries is a common source of visual inconsistency between two people building in parallel, so this is a hard rule.

- Sidebar navigation icons: 20px, stroke-width 1.75
- Inline icons within buttons or table rows: 16px, stroke-width 1.75
- Page-header / empty-state icons: 24–32px, stroke-width 1.5
- Icon color follows text color at that location — icons never introduce a new color

## 7. Theming

Light/dark mode is a user-toggleable setting, not a fixed build-time default.

- Toggle lives in the top navigation bar, accessible from every screen
- Theme preference persists (e.g. `localStorage`) across sessions
- On first visit with no stored preference, the app follows the OS color-scheme preference
- All color tokens are implemented as CSS variables so components never hardcode a hex value — this is what makes the toggle apply instantly and consistently across both contributors' screens

## 8. Component Guidelines

### 8.1 Buttons
- **Primary:** solid Blue 600 (light) / Blue 400 (dark) fill, white text — the single main action on a screen (e.g. "Book It", "Register Asset")
- **Secondary:** outlined, accent-colored border/text, transparent fill — secondary actions (e.g. "Cancel", "Reschedule")
- **Approve:** solid success green fill, white text — reserved for approval actions only
- **Decline:** solid danger red fill, white text — reserved for rejection actions only

### 8.2 Status Badges / Pills
- Rounded pill shape (8px radius), soft background at 15–20% of the status color, solid-color text or dot indicator
- One badge = one status, always drawn from the tables in 3.3 / 3.4 — no ad-hoc colors

### 8.3 Cards
- White (light) / Blue 700 (dark) surface, 1px border in Blue 200 / Blue 600-at-40%, 12px radius, consistent internal padding of 16–24px

### 8.4 Tables
- Set in Sono for scanability of numeric/ID-heavy data; header row in Source Sans 3, 600 weight
- Row hover uses the soft accent fill token, never a new color

### 8.5 Forms
- Inputs share the card border/radius tokens; focus state uses a 2px accent-colored outline, never a color outside the palette

---

# Part B — Screen Specifications

All screens share the same shell: a left sidebar for primary navigation (Dashboard, Organization Setup, Assets, Allocation & Transfer, Resource Booking, Maintenance, Audit, Reports, Notifications) and a top bar carrying the AssetFlow wordmark and the theme toggle.

## 1. Login / Signup

**Purpose:** Authenticate users through realistic account creation, without allowing anyone to self-assign a privileged role.
**Applicable Roles:** Public (unauthenticated)

**Wireframe Reference:** A single centered card: AssetFlow wordmark/monogram, Email field, Password field, "Forgot password" link, divider, "New here?" prompt explaining signup creates an Employee account only, Create Account button.

**Functional Requirements:**
- Signup creates an Employee-level account only — no role selector anywhere on this screen
- Admin, Department Head, and Asset Manager roles can only be granted later, from the Employee Directory (Screen 3)
- Email + password login with client-side validation and a forgot-password flow
- Session validation on load — an already-authenticated user is redirected straight to the Dashboard

**Key Components:**
- Centered auth card, 400–440px wide, standard card token (12px radius, bordered)
- Primary button ("Create Account") uses primary accent fill
- Inline validation messages use the danger red token, never a new red

---

## 2. Dashboard / Home

**Purpose:** Give every role a single real-time operational snapshot the moment they log in.
**Applicable Roles:** All roles (content scoped per role)

**Wireframe Reference:** Sidebar plus a KPI row of small stat cards, an overdue-returns alert block set apart from the rest, three quick-action buttons, and a recent-activity feed underneath.

**Functional Requirements:**
- KPI cards: Assets Available, Assets Allocated, Maintenance Today, Active Bookings, Pending Transfers, Upcoming Returns
- Overdue returns (past Expected Return Date) visually separated from upcoming ones, not just sorted together
- Quick actions: Register Asset, Book Resource, Raise Maintenance Request — each deep-links into the relevant screen
- Recent activity feed summarizing latest system events relevant to the logged-in user

**Status / Color Application:**
- Overdue-return alert block uses the danger red soft-fill token
- KPI cards use neutral card styling — the numbers carry the information, not the card color

**Key Components:**
- KPI card row (equal-width cards, 16px radius)
- Alert/banner component for overdue items
- Quick-action button group (primary + two secondary buttons)

---

## 3. Organization Setup

**Purpose:** Maintain the master data — departments, categories, and people — that every other module depends on.
**Applicable Roles:** Admin only

**Wireframe Reference:** Three-tab layout: Department Management, Asset Category Management, Employee Directory, each showing a data table with a "+ Add" action top-right.

**Functional Requirements:**
- Tab A — Department Management: create/edit/deactivate a department; assign a Department Head; optional parent department for hierarchy; Active/Inactive status
- Tab B — Asset Category Management: create/edit categories (Electronics, Furniture, Vehicles, etc.); optional category-specific fields (e.g. warranty period)
- Tab C — Employee Directory: Name, Email, Department, Role, Status; the only screen where an Employee can be promoted to Department Head or Asset Manager

**Status / Color Application:**
- Active/Inactive shown as a small blue-scale status pill (Blue 400 for Active, muted grey-blue for Inactive) — not green/red, since this is a data-state toggle, not an approval

**Key Components:**
- Tab navigation using primary accent for the active tab underline
- Data table (Sono type) with inline edit/deactivate row actions
- Modal/drawer form for add/edit, using standard form tokens (8.5)

---

## 4. Asset Registration & Directory

**Purpose:** Register new assets and give staff a single searchable place to find and track every physical asset.
**Applicable Roles:** Asset Manager (register/edit); all roles (search/view, scoped by permission)

**Wireframe Reference:** Prominent search/filter bar with a "Register Asset" button top-right, results table listing Tag, Category, Status, Location, and other core fields.

**Functional Requirements:**
- Register: Name, Category (from Screen 3), auto-generated Asset Tag (e.g. `AF-0001`), Serial Number, Acquisition Date, Acquisition Cost (reporting only, not linked to accounting), Condition, Location, photos/documents, shared/bookable flag
- Search/filter by Asset Tag, Serial Number, QR code, category, status, department, or location
- Lifecycle status per asset: Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed
- Per-asset history combining allocation history and maintenance history in one view

**Status / Color Application:**
- Available → success green (the state everything exits/returns to)
- Lost → danger red
- Allocated, Reserved, Under Maintenance, Retired, Disposed → differentiated blue shades (3.4)

**Key Components:**
- Search bar with filter chips
- Asset Tag rendered in Sono medium with letter-spacing, in accent color
- Status pill component reused from 8.2

---

## 5. Asset Allocation & Transfer

**Purpose:** Manage who currently holds each asset, with an explicit, visible conflict rule so double-allocation is impossible.
**Applicable Roles:** Asset Manager, Department Head (approvals); Employee (initiating return/transfer requests)

**Wireframe Reference:** Asset summary strip at top showing current holder, highlighted conflict-warning block, allocation form (Employee vs. Department target), notes field, Submit button, allocation history list beneath.

**Functional Requirements:**
- Allocate an asset to an employee/department with an optional Expected Return Date
- Conflict rule: an already-allocated asset cannot be allocated again — system blocks the action, shows current holder, offers a Transfer Request button instead
- Transfer workflow: Requested → Approved (by Asset Manager/Department Head) → Re-allocated, with history updated automatically
- Return flow: mark returned, capture condition check-in notes, asset status reverts to Available
- Overdue allocations (past Expected Return Date) auto-flagged, feeding Dashboard + Notifications

**Status / Color Application:**
- Conflict-block message uses danger red soft-fill — this is a blocked action, not a status label, so it reads as an alert
- Transfer workflow stages use blue-scale pills; the Approve button itself uses success green

**Key Components:**
- Alert/banner for the conflict block, reused from Section 8 pattern
- Two-target selector (Employee vs. Department)
- History list styled as a timeline, using Sono for dates and Tag references

---

## 6. Resource Booking

**Purpose:** Let staff book shared resources by time slot with no possibility of a double-booking.
**Applicable Roles:** Employee, Department Head (booking on behalf of a department)

**Wireframe Reference:** Resource selector, calendar/timeline view of that resource's existing bookings, highlighted existing-booking block, overlap-conflict message, slot-selection form, "Book It" button.

**Functional Requirements:**
- Calendar view of a selected resource's existing bookings
- Overlap validation: a new request overlapping an existing booking is rejected; a request starting exactly when the previous one ends is accepted
- Booking status: Upcoming, Ongoing, Completed, Cancelled
- Cancel/reschedule actions, plus a reminder notification before the slot starts

**Status / Color Application:**
- Upcoming / Ongoing → blue-scale pills (Blue 400 / Blue 600)
- Completed → muted grey-blue
- Cancelled → danger red
- Overlap-conflict message → danger red alert, matching the pattern used in Allocation & Transfer

**Key Components:**
- Resource selector dropdown
- Calendar/timeline component with existing-slot blocks in the soft accent fill
- Primary button ("Book It") stays on primary accent blue — booking is routine, not an approval, so success green is intentionally not used here

---

## 7. Maintenance Management

**Purpose:** Route every repair through an approval step before work begins, and track it through to resolution.
**Applicable Roles:** Employee (raise request), Asset Manager (approve/reject, assign technician)

**Wireframe Reference:** Five-column board — Pending, Approved, Technician Assigned, In Progress, Resolved — with asset request cards in each column.

**Functional Requirements:**
- Raise request: select asset, describe issue, set priority, attach photo
- Workflow: Pending → Approved / Rejected (by Asset Manager) → Technician Assigned → In Progress → Resolved
- Asset status auto-updates to Under Maintenance on approval, back to Available on resolution
- Full maintenance history retained per asset

**Status / Color Application:**
- Approved → success green
- Rejected → danger red
- Pending, Technician Assigned, In Progress → blue-scale pills, differentiated by shade
- Resolved → success green

**Key Components:**
- Kanban-style board, column headers as blue-scale labels (not colored backgrounds — avoids a "traffic light" look)
- Request cards showing Asset Tag (Sono), priority badge, assignee
- Approve/Reject button pair on Pending cards, using the green/red exception tokens

---

## 8. Asset Audit

**Purpose:** Run structured, scoped verification cycles instead of a one-off spreadsheet check.
**Applicable Roles:** Admin (create cycle, assign auditors), designated Auditors (verify assets), Asset Manager (resolve discrepancies)

**Wireframe Reference:** Cycle header showing scope and date range, table of in-scope assets with per-row Verified/Missing/Damaged actions, auto-generated discrepancy summary block at the bottom.

**Functional Requirements:**
- Create an Audit Cycle with defined scope (department/location) and date range
- Assign one or more auditors to the cycle
- Auditor marks each asset: Verified, Missing, or Damaged
- System auto-generates a discrepancy report for flagged items
- Closing the cycle locks it and updates affected asset statuses (e.g. confirmed-missing → Lost)
- Audit history retained per cycle

**Status / Color Application:**
- Verified → success green
- Missing → danger red
- Damaged → Blue 500 with a filled-dot indicator (kept inside the monochromatic system rather than introducing amber)

**Key Components:**
- Cycle header card (scope, date range, assigned auditors as avatar chips)
- Verification table with three inline action buttons per row
- Discrepancy summary card, using danger red soft-fill to surface flagged items

---

## 9. Reports & Analytics

**Purpose:** Give managers actionable operational insight without digging through raw tables.
**Applicable Roles:** Admin, Asset Manager, Department Head (department-scoped)

**Wireframe Reference:** Two chart blocks side by side (department utilization, maintenance frequency trend), two summary-list cards (most-used/idle assets), an upcoming-maintenance/retirement list, Generate Report action.

**Functional Requirements:**
- Asset utilization trends, including most-used vs. idle assets
- Maintenance frequency by asset/category
- Assets due for maintenance or nearing retirement
- Department-wise allocation summary
- Resource booking heatmap (peak usage windows)
- Exportable reports

**Status / Color Application:**
- Charts use the blue scale exclusively (e.g. a gradient from Blue 200 to Blue 600) so visualizations don't compete with status badges elsewhere

**Key Components:**
- Bar chart (department utilization) and line chart (maintenance frequency), both blue-scale only
- Summary list cards for most-used/idle assets
- "Generate Report" primary button, exporting to PDF/CSV

---

## 10. Activity Logs & Notifications

**Purpose:** Keep every role informed of relevant system events without checking each module individually.
**Applicable Roles:** All roles (scoped to what's relevant; Admin sees the full audit log)

**Wireframe Reference:** Filter tab row (All / Alerts / Approvals / Bookings) followed by a flat, timestamped list of events, each with a small leading icon.

**Functional Requirements:**
- Notification types: Asset Assigned, Maintenance Approved/Rejected, Booking Confirmed/Cancelled/Reminder, Transfer Approved, Overdue Return Alert, Audit Discrepancy Flagged
- A full activity log of admin/manager/employee actions (who did what, when), separate from the user-facing notification feed

**Status / Color Application:**
- Approval-related notifications (Maintenance Approved, Transfer Approved) → small success green leading icon
- Alert-type notifications (Overdue Return, Audit Discrepancy) → small danger red leading icon
- Routine notifications (Booking Confirmed, Reminder) → neutral blue-scale icon

**Key Components:**
- Filter tab row using the same active-tab pattern as Organization Setup
- Notification list row: leading icon (Lucide, 16px), message (Sono), relative timestamp (Sono, secondary text color)

---

## 9. Summary

This design system intentionally limits itself to one hue family plus two functional exceptions, one shape language, one icon set, and two typefaces with clearly separated jobs. The constraint is deliberate: with two people building five screens each in parallel under hackathon time pressure, the fastest way to end up with a mismatched product is to leave any of these decisions implicit. Every screen in Part B should be built by pulling directly from the tokens defined in Part A — no new colors, radii, or fonts should be introduced at the component level.