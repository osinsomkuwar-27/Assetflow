# AssetFlow

## 1. Executive Summary
AssetFlow is an Enterprise Asset & Resource Management System designed to help organizations digitize how they track, allocate, and maintain physical assets and shared resources. It replaces spreadsheets and paper logs with a centralized platform offering structured asset lifecycles, conflict-free resource booking, approval-driven maintenance workflows, and scheduled audit cycles — all backed by role-based access control.

AssetFlow is industry-agnostic: any organization with equipment, furniture, vehicles, or shared spaces (offices, schools, hospitals, factories, agencies) can adopt it.

## 2. Vision
To become the operational backbone for asset visibility — giving every organization real-time answers to "who holds what, where it is, and what condition it's in," while enabling clean, auditable workflows for allocation, booking, maintenance, and verification.

## 3. Problem Statement
Most organizations still track physical assets and shared resources through spreadsheets, paper logs, or ad-hoc communication. This leads to:
- No single source of truth for asset location, ownership, or condition
- Double-booking of shared resources (rooms, vehicles, equipment)
- Untracked or unapproved maintenance work
- No structured way to catch lost, damaged, or misallocated assets
- No visibility into overdue returns or bookings until it's too late

AssetFlow solves this with a centralized ERP module that enforces conflict rules, approval workflows, and lifecycle discipline — without touching purchasing, invoicing, or accounting concerns.

## 4. Goals
- Provide a single system of record for departments, employees, and assets
- Enforce non-self-elevating, realistic account creation and role assignment
- Prevent double-allocation of assets and overlapping resource bookings
- Route maintenance through a mandatory approval workflow
- Run structured, closeable audit cycles with auto-generated discrepancy reports
- Surface overdue items and key operational metrics via dashboard and notifications
- Maintain a full activity log for accountability

## 5. Non Goals
- Purchasing, procurement, or vendor management
- Invoicing, billing, or accounting integration
- Payroll or HR management beyond basic employee directory fields
- Multi-organization / multi-tenant support (future scope)
- Native mobile apps (future scope)
- IoT/RFID/QR hardware integration (future scope)

## 6. Target Users

### Admin
The organizational super-user. Sets up departments and asset categories, promotes employees to Department Head or Asset Manager, manages audit cycles, and views organization-wide analytics. Admin is the only role that assigns other roles.

### Asset Manager
The operational owner of the asset lifecycle. Registers and allocates assets, approves transfers and maintenance requests, approves returns and condition check-ins, and resolves audit discrepancies.

### Department Head
Departmental oversight role. Views assets allocated to their department, approves allocation/transfer requests within it, and books shared resources on behalf of the department.

### Employee
The end user. Views assets allocated to them, books shared resources, raises maintenance requests, and initiates return/transfer requests.

## 7. User Stories

**Admin**
- As an Admin, I want to create and deactivate departments so that the org structure stays current.
- As an Admin, I want to assign a Department Head to a department so that departmental approvals have an owner.
- As an Admin, I want to promote an Employee to Asset Manager or Department Head from the Employee Directory so that role changes are deliberate and auditable.
- As an Admin, I want to create asset categories with custom fields (e.g., warranty period) so that different asset types capture relevant data.
- As an Admin, I want to view organization-wide KPIs so that I can monitor overall asset health.

**Asset Manager**
- As an Asset Manager, I want to register a new asset with an auto-generated Asset Tag so that it enters the system as trackable and Available.
- As an Asset Manager, I want to be blocked from allocating an already-held asset so that double-allocation never happens.
- As an Asset Manager, I want to approve or reject transfer requests so that reassignment is controlled.
- As an Asset Manager, I want to approve maintenance requests before repair work starts so that unauthorized servicing doesn't occur.
- As an Asset Manager, I want to resolve audit discrepancies so that lost or damaged assets are properly reflected in the system.

**Department Head**
- As a Department Head, I want to see all assets allocated to my department so that I have visibility into departmental resources.
- As a Department Head, I want to approve allocation/transfer requests within my department so that I retain oversight of departmental assets.
- As a Department Head, I want to book shared resources on behalf of my team so that department needs are met.

**Employee**
- As an Employee, I want to view assets currently allocated to me so that I know what I'm responsible for.
- As an Employee, I want to book a shared resource for a specific time slot so that I can reserve rooms, vehicles, or equipment without conflict.
- As an Employee, I want to raise a maintenance request with a photo so that issues are clearly communicated.
- As an Employee, I want to initiate a return or transfer request so that I can hand off an asset I no longer need.

**Cross-role**
- As any user, I want to receive notifications for overdue returns, bookings, and maintenance events so that I don't miss important actions.
- As any user, I want to see an activity log of actions relevant to my scope so that I understand what has happened and when.

## 8. Functional Requirements

### Authentication
**Purpose:** Authenticate users with realistic, non-self-elevating account creation.
**Features:** Email/password signup and login, forgot password flow, session validation.
**Validation:** Valid email format, password strength rules, unique email per account.
**Business Rules:** Signup always creates an Employee account. No role selection is available at signup. Roles are only elevated by an Admin via the Employee Directory.

### Dashboard
**Purpose:** Give every role a real-time operational snapshot.
**Features:** KPI cards (Assets Available, Assets Allocated, Maintenance Today, Active Bookings, Pending Transfers, Upcoming Returns), separated overdue-vs-upcoming returns, quick actions (Register Asset, Book Resource, Raise Maintenance Request).
**Validation:** Data displayed is scoped to the user's role/department where applicable.
**Business Rules:** Overdue items (past Expected Return Date) are always visually distinguished from upcoming ones.

### Organization Setup
**Purpose:** Maintain the master data all other modules depend on. Admin-only, three tabs.
**Features:**
- Department Management: create/edit/deactivate department, assign Department Head, optional parent department for hierarchy, Active/Inactive status.
- Asset Category Management: create/edit categories, optional category-specific fields (e.g., warranty period for Electronics).
- Employee Directory: name, email, department, role, status; promote Employee to Department Head or Asset Manager.
**Validation:** Department names unique; category names unique; only Active employees can be promoted.
**Business Rules:** This is the only screen where roles are assigned. Deactivating a department does not delete historical data.

### Employee Directory
**Purpose:** Central record of all people in the system.
**Features:** List/search/filter employees by department, role, status.
**Validation:** Email uniqueness, valid department reference.
**Business Rules:** Only Admin can change role or status.

### Asset Categories
**Purpose:** Classify assets and define category-specific metadata.
**Features:** CRUD on categories, optional custom fields per category.
**Validation:** Category name required and unique.
**Business Rules:** Categories in use by existing assets cannot be deleted, only deactivated.

### Asset Registration
**Purpose:** Register assets and make them searchable/trackable centrally.
**Features:** Capture Name, Category, auto-generated Asset Tag (e.g., AF-0001), Serial Number, Acquisition Date, Acquisition Cost, Condition, Location, photo/documents, shared/bookable flag; search/filter by tag, serial number, QR code, category, status, department, location; per-asset allocation and maintenance history.
**Validation:** Asset Tag auto-generated and immutable; Serial Number optional but unique if provided; Category required.
**Business Rules:** Acquisition Cost is used only for ranking/reporting, never linked to accounting. New assets always enter as Available.

### Asset Allocation
**Purpose:** Manage who currently holds each asset.
**Features:** Allocate to employee/department with optional Expected Return Date; return flow with condition check-in notes; overdue allocation auto-flagging.
**Validation:** Cannot allocate an asset that is not in Available status.
**Business Rules:** Attempting to allocate an already-held asset is blocked, shows current holder, and offers a Transfer Request action instead. On return, asset status reverts to Available.

### Transfer Workflow
**Purpose:** Reassign a held asset from one holder to another in a controlled way.
**Features:** Requested → Approved (by Asset Manager/Department Head) → Re-allocated, with automatic history update.
**Validation:** Only Asset Manager or the relevant Department Head can approve.
**Business Rules:** Approval automatically updates allocation history; rejected transfers leave the asset with its current holder.

### Resource Booking
**Purpose:** Time-slot booking of shared resources without overlaps.
**Features:** Calendar view of existing bookings, overlap validation, booking status (Upcoming, Ongoing, Completed, Cancelled), cancel/reschedule, pre-slot reminder notification.
**Validation:** A new booking is rejected if its time range overlaps any existing Upcoming/Ongoing booking for the same resource. A booking starting exactly when another ends is valid (no overlap).
**Business Rules:** Only assets flagged as shared/bookable can be booked. Cancelled bookings free the slot immediately.

### Maintenance
**Purpose:** Route repairs through approval before work begins.
**Features:** Raise request (asset, issue description, priority, photo); workflow Pending → Approved/Rejected (by Asset Manager) → Technician Assigned → In Progress → Resolved; per-asset maintenance history.
**Validation:** Only the current holder or an authorized role can raise a request for a given asset.
**Business Rules:** Asset status auto-updates to Under Maintenance only upon Approval, and reverts to Available upon Resolved.

### Audit
**Purpose:** Run structured verification cycles instead of one-off checks.
**Features:** Create Audit Cycle (scope: department/location, date range); assign one or more auditors; auditor marks each asset Verified/Missing/Damaged; auto-generated discrepancy report; Close Audit Cycle; audit history per cycle.
**Validation:** A cycle cannot be closed until all in-scope assets have a verification status.
**Business Rules:** Closing a cycle locks it and updates affected asset statuses (e.g., confirmed-missing items move to Lost).

### Reports
**Purpose:** Give managers actionable operational insight.
**Features:** Asset utilization trends (most-used vs. idle), maintenance frequency by asset/category, assets due for maintenance or nearing retirement, department-wise allocation summary, resource booking heatmap, exportable reports.
**Validation:** Reports respect role-based data scoping.
**Business Rules:** Exported reports reflect data at time of export, not live data.

### Notifications
**Purpose:** Keep every role informed without manual digging.
**Features:** Notifications for Asset Assigned, Maintenance Approved/Rejected, Booking Confirmed/Cancelled/Reminder, Transfer Approved, Overdue Return Alert, Audit Discrepancy Flagged.
**Validation:** Notifications are scoped to the relevant user(s) only.
**Business Rules:** Overdue-related notifications are generated automatically by scheduled checks, not manually triggered.

### Activity Logs
**Purpose:** Provide a full audit trail of system actions.
**Features:** Log of who did what and when, across admin/manager/employee actions.
**Validation:** Logs are immutable once written.
**Business Rules:** Every state-changing action (allocation, transfer, maintenance approval, audit closure, etc.) must generate a log entry.

## 9. User Flow
1. User signs up → account created as Employee (no role selection).
2. Admin logs in, sets up Departments and Asset Categories, and promotes select Employees to Department Head or Asset Manager via the Employee Directory.
3. Asset Manager registers a new asset → it enters the system as **Available**.
4. Asset is either allocated to an employee/department, or flagged as a shared bookable resource.
5. If allocation is attempted on an already-held asset, the system blocks it and offers a Transfer Request instead.
6. Employees book shared resources by time slot; overlapping requests are auto-rejected.
7. If a held asset needs repair, the holder raises a maintenance request; it must be Approved before the asset flips to Under Maintenance and before work starts.
8. Assets are transferred or returned as needs change; overdue returns are auto-flagged and surfaced on the Dashboard and via Notifications.
9. Admin/Asset Manager periodically runs Audit Cycles; auditors verify assets; discrepancies are auto-generated; the cycle is closed, updating asset statuses as needed.
10. All actions throughout are captured in Notifications, Activity Logs, and Reports.

## 10. Asset Lifecycle
```
Available
↓
Allocated
↓
Reserved
↓
Under Maintenance
↓
Lost
↓
Retired
↓
Disposed
```

**Valid transitions:**
- **Available → Allocated**: on successful allocation to an employee/department.
- **Available → Reserved**: on successful booking of a shared/bookable asset.
- **Available ↔ Under Maintenance**: on maintenance approval (→) and resolution (←).
- **Allocated → Available**: on return/check-in.
- **Allocated → Under Maintenance**: on maintenance approval while asset is held.
- **Reserved → Available**: on booking completion or cancellation.
- **Any active state → Lost**: on confirmed-missing result from an Audit Cycle closure.
- **Available/Allocated → Retired**: manual retirement decision by Asset Manager/Admin.
- **Retired → Disposed**: final disposal action, terminal state.

Note: the lifecycle diagram represents the general progression path; not every asset passes through every state — an asset can move directly between Available, Allocated, Reserved, and Under Maintenance as operational events dictate, while Lost, Retired, and Disposed are typically end-of-life outcomes.

## 11. Role Permissions Matrix

| Feature | Admin | Asset Manager | Department Head | Employee |
|---|---|---|---|---|
| Department Management | ✅ | ❌ | View | ❌ |
| Asset Category Management | ✅ | View | View | ❌ |
| Employee Directory & Role Assignment | ✅ | View | View (own dept) | ❌ |
| Asset Registration | ✅ | ✅ | ❌ | ❌ |
| Asset Search/View | ✅ | ✅ | View (own dept) | View (own) |
| Asset Allocation | ✅ | ✅ | Approve (own dept) | Request |
| Transfer Request | ✅ | Approve | Approve (own dept) | Request |
| Resource Booking | ✅ | ✅ | ✅ | ✅ |
| Maintenance Request | ✅ | Approve | ❌ | Request |
| Audit Cycle Creation | ✅ | ✅ | ❌ | ❌ |
| Audit Verification | ✅ | ✅ | ❌ | ❌ (unless assigned as auditor) |
| Reports & Analytics | ✅ (org-wide) | ✅ (asset-focused) | View (own dept) | ❌ |
| Notifications | ✅ | ✅ | ✅ | ✅ |
| Activity Logs | ✅ (org-wide) | View (own actions) | View (own dept) | View (own actions) |

## 12. Database Overview

**Core entities:**
- **Users** — account credentials, role, status, linked Department
- **Departments** — name, parent department (hierarchy), assigned Department Head, status
- **Categories** — asset category name, custom fields schema
- **Assets** — tag, category, serial number, acquisition data, condition, location, status, shared/bookable flag
- **Bookings** — asset reference, requester, time slot, status
- **Maintenance Requests** — asset reference, requester, issue, priority, approval status, technician assignment
- **Transfers** — asset reference, from-holder, to-holder, approval status, timestamps
- **Audit Cycles** — scope, date range, assigned auditors, status
- **Audit Items** — audit cycle reference, asset reference, verification result
- **Notifications** — recipient, type, related entity reference, read status
- **Activity Logs** — actor, action type, related entity reference, timestamp

**Relationships (high level):**
- A User belongs to one Department; a Department has one Department Head (a User).
- A Department can have a Parent Department (self-referencing hierarchy).
- An Asset belongs to one Category and, at any time, may be held by one User or Department.
- A Booking references one Asset and one requesting User/Department, over a time range.
- A Maintenance Request references one Asset and one requesting User.
- A Transfer references one Asset, a from-holder, and a to-holder.
- An Audit Cycle contains many Audit Items, each referencing one Asset.
- Notifications and Activity Logs reference the User and the related entity that triggered them.

## 13. Non Functional Requirements

- **Security:** Role-based access control enforced at API level; no client-side-only role checks; passwords hashed and salted.
- **Performance:** Dashboard and search views should respond within acceptable interactive latency even with large asset counts.
- **Scalability:** Modular architecture allowing independent scaling of booking, maintenance, and audit modules.
- **Accessibility:** UI should meet basic accessibility standards (keyboard navigation, sufficient contrast, semantic markup).
- **Responsive Design:** Usable across desktop and tablet screen sizes.
- **Availability:** System designed for high uptime suitable for daily operational use.
- **Auditability:** Every state-changing action produces an immutable activity log entry.

## 14. Future Scope
- QR code scanning for quick asset lookup
- Barcode support
- Native mobile app
- IoT-based asset tracking
- RFID tagging
- Predictive maintenance using historical data
- AI-driven analytics and recommendations
- Multi-organization / multi-tenant support
- Single Sign-On (SSO)