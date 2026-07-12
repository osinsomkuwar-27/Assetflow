#  AssetFlow

**Enterprise Asset & Resource Management System**

AssetFlow is a modern ERP platform that helps organizations track, allocate, and maintain physical assets and shared resources — replacing spreadsheets and paper logs with structured lifecycles, conflict-free booking, and approval-driven workflows.

> Register it. Allocate it. Book it. Maintain it. Audit it. Never lose track of it again.

---

##  Features

-  Role-based access control (Admin, Asset Manager, Department Head, Employee)
-  Organization setup — departments, asset categories, employee directory
-  Full asset registration and lifecycle tracking
-  Allocation & transfer workflows with double-allocation prevention
-  Shared resource booking with overlap validation
-  Maintenance requests with mandatory approval workflow
-  Structured audit cycles with auto-generated discrepancy reports
-  Reports & analytics for utilization, maintenance, and bookings
-  Real-time notifications for overdue items and key events
-  Full activity log for accountability

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Frontend | TanStack Start (React) + TanStack Router + Vite + TypeScript |
| UI / Styling | Tailwind CSS + shadcn/ui |
| Frontend package manager | Bun |
| Backend | Node.js + Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Authentication | JWT |
| Hosting | _TBD_ |

---

##  System Architecture

```mermaid
flowchart TD
    Client[Web Client] --> API[API Layer]
    API --> Auth[Auth & RBAC Middleware]
    API --> Modules[Core Modules]
    Modules --> DB[(PostgreSQL via Prisma)]
    Modules --> Notif[Notification Service]
    Notif --> Client
```

---

##  Folder Structure

### Backend

```
backend/
├── prisma/
│   ├── migrations/
│   │   └── <timestamp>_init/
│   │       ├── migration.sql
│   │       └── migration_lock.toml
│   └── schema.prisma
│
├── src/
│   ├── config/
│   │   └── db.js                 # Prisma client / DB connection
│   │
│   ├── modules/                  # KSHITIJ owns these
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   └── auth.service.js
│   │   ├── assets/
│   │   │   ├── assets.routes.js
│   │   │   ├── assets.controller.js
│   │   │   └── assets.service.js
│   │   ├── allocations/
│   │   │   ├── allocations.routes.js
│   │   │   ├── allocations.controller.js
│   │   │   └── allocations.service.js   # conflict-check + transfer logic
│   │   ├── bookings/
│   │   │   ├── bookings.routes.js
│   │   │   ├── bookings.controller.js
│   │   │   └── bookings.service.js      # overlap validation
│   │   └── org/
│   │       └── org.routes.js
│   │
│   ├── modules/                  # TANISHKA owns these
│   │   ├── maintenance/
│   │   │   ├── maintenance.routes.js
│   │   │   ├── maintenance.controller.js
│   │   │   └── maintenance.service.js
│   │   ├── audits/
│   │   │   ├── audits.routes.js
│   │   │   ├── audits.controller.js
│   │   │   └── audits.service.js
│   │   ├── reports/
│   │   │   ├── reports.routes.js
│   │   │   ├── reports.controller.js
│   │   │   └── reports.service.js
│   │   ├── notifications/
│   │   │   ├── notifications.routes.js
│   │   │   ├── notifications.controller.js
│   │   │   └── notifications.service.js
│   │   └── dashboard/
│   │       ├── dashboard.routes.js
│   │       ├── dashboard.controller.js
│   │       └── dashboard.service.js     # KPI aggregation
│   │
│   ├── shared/                   # BOTH — the coordination point
│   │   ├── assetStatus.service.js   # THE ONE function that writes Asset.status
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # verifies JWT
│   │   │   ├── role.middleware.js   # RBAC guard
│   │   │   └── error.middleware.js
│   │   └── utils/
│   │       ├── overlapCheck.js      # shared booking overlap utility
│   │       └── responseFormatter.js
│   │
│   ├── app.js                    # express app, mounts all routes
│   └── server.js                 # entry point, starts listener
│
├── .env.example
├── .gitignore
├── package.json
└── package-lock.json
```

### Frontend

```
frontend/
├── .lovable/                     # Lovable project metadata (not required to run locally)
├── public/
│   └── favicon.ico
│
├── src/
│   ├── components/
│   │   ├── app/                  # shared app-shell components
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   └── page-header.tsx
│   │   └── ui/                   # shadcn/ui kit (button, card, table, dialog, badge, etc.)
│   │
│   ├── hooks/
│   │   └── use-mobile.tsx
│   │
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── error-capture.ts
│   │   ├── error-page.ts
│   │   └── lovable-error-reporting.ts
│   │
│   ├── routes/                   # file-based routing (TanStack Router)
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── app.tsx               # app shell wrapper route
│   │   ├── app.dashboard.tsx
│   │   ├── app.organization.tsx
│   │   ├── app.assets.tsx
│   │   ├── app.allocation.tsx
│   │   ├── app.booking.tsx
│   │   ├── app.maintenance.tsx
│   │   ├── app.audit.tsx
│   │   ├── app.reports.tsx
│   │   └── app.notifications.tsx
│   │
│   ├── router.tsx
│   ├── routeTree.gen.ts          # auto-generated, do not edit by hand
│   ├── server.ts                 # SSR entry
│   ├── start.ts
│   └── styles.css
│
├── components.json               # shadcn/ui config
├── vite.config.ts
├── tsconfig.json
├── bunfig.toml
├── bun.lock
└── package.json
```

---

##  Core Modules

- **Authentication** — signup/login, session management
- **Dashboard** — KPI cards, quick actions, overdue highlights
- **Organization Setup** — departments, categories, employee directory
- **Asset Registration** — asset creation, search, per-asset history
- **Asset Allocation & Transfer** — holder assignment, transfer workflow, returns
- **Resource Booking** — calendar-based booking with overlap checks
- **Maintenance** — request → approval → repair → resolution
- **Audit** — cycle creation, verification, discrepancy reports
- **Reports & Analytics** — utilization, maintenance, booking insights
- **Notifications & Activity Logs** — real-time alerts and full audit trail

---

##  Role Based Access

| Role | Responsibilities |
|---|---|
| **Admin** | Manages departments, categories, audit cycles, and role assignment; views org-wide analytics |
| **Asset Manager** | Registers/allocates assets; approves transfers, maintenance, and audit resolution |
| **Department Head** | Views departmental assets; approves departmental requests; books resources |
| **Employee** | Views own assets; books resources; raises maintenance and transfer requests |

>  Accounts are never self-elevated. Signup always creates an Employee account — only an Admin can promote users to Department Head or Asset Manager.

---

##  Asset Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Available
    Available --> Allocated
    Available --> Reserved
    Available --> UnderMaintenance
    Allocated --> Available
    Allocated --> UnderMaintenance
    Reserved --> Available
    UnderMaintenance --> Available
    Available --> Lost
    Allocated --> Lost
    Available --> Retired
    Allocated --> Retired
    Retired --> Disposed
    Disposed --> [*]
```

---

##  Screens

1. Login / Signup
2. Dashboard / Home
3. Organization Setup (Departments · Categories · Employee Directory)
4. Asset Registration & Directory
5. Asset Allocation & Transfer
6. Resource Booking
7. Maintenance Management
8. Asset Audit
9. Reports & Analytics
10. Activity Logs & Notifications

---

##  Project Workflow

```mermaid
flowchart LR
    A[Admin sets up org] --> B[Asset Manager registers assets]
    B --> C[Assets allocated or marked bookable]
    C --> D[Employees book / hold assets]
    D --> E[Maintenance raised & approved as needed]
    E --> F[Returns / Transfers processed]
    F --> G[Audit cycles verify assets]
    G --> H[Reports & notifications keep everyone informed]
```

---

##  Installation

```bash
git clone https://github.com/osinsomkuwar-27/Assetflow.git
cd Assetflow
```

---

##  Environment Variables

### Backend — create `.env` in `backend/`

```env
DATABASE_URL=
JWT_SECRET=
PORT=
NODE_ENV=
```

### Frontend

No `.env` required for local dev unless the API base URL is externalized — check `frontend/src/lib/utils.ts` for the current API client config.

---

## ▶ Running Locally

```bash
# Backend
cd backend
npm install
npx prisma generate
npm run dev

# Frontend (in a separate terminal)
cd frontend
bun install
bun run dev
```

---

##  Future Improvements

-  QR code scanning for asset lookup
-  RFID / IoT-based asset tracking
-  Native mobile app
-  Predictive maintenance
-  AI-driven analytics
-  Multi-organization support
-  Single Sign-On (SSO)

---

##  Contributing

Contributions are welcome! Please open an issue to discuss significant changes before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request

---

##  License



---

##  Acknowledgements

Built as part of a hackathon project to explore ERP-style asset and resource management workflows.