# CivicSense — Implementation Plan

## 1. Overview

A crowdsourced civic issue reporting platform with 3 roles:
- **Helper** (citizen): Reports issues with geo-tagged photos
- **Admin**: Oversees reports, assigns to workers (mostly automated)
- **Worker**: Resolves issues in the field, uploads proof

## 2. Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Clerk |
| Database | Supabase PostgreSQL (via Prisma ORM) |
| Storage | Supabase Storage (2 buckets) |
| Realtime | Supabase Realtime |
| AI/ML | Google Gemini 1.5 Flash |
| Email | Resend |
| Maps | Leaflet + React-Leaflet |
| Charts | Recharts |
| Deploy | Vercel (frontend + serverless API) |

## 3. Architecture Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Helper UI  │     │   Admin UI   │     │  Worker UI   │
│  (React SPA) │     │  (React SPA) │     │  (React SPA) │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────┬───────┴────────────────────┘
                    │
              ┌─────▼─────┐
              │   Clerk    │──── Auth + Sessions + OAuth
              └─────┬──────┘
                    │ JWT
              ┌─────▼──────────────────────────────────┐
              │         Vercel Serverless API           │
              │  ┌────────────┐  ┌──────────────────┐  │
              │  │ Prisma ORM │  │ Supabase Storage │  │
              │  └─────┬──────┘  └────────┬─────────┘  │
              │        │                  │             │
              │  ┌─────▼──────────────────▼─────────┐  │
              │  │     Supabase PostgreSQL           │  │
              │  │     + PostGIS + Realtime          │  │
              │  └──────────────────────────────────┘  │
              │                                        │
              │  ┌──────────────┐  ┌──────────────┐   │
              │  │ Gemini AI    │  │   Resend     │   │
              │  │ (analysis)   │  │   (emails)   │   │
              │  └──────────────┘  └──────────────┘   │
              └────────────────────────────────────────┘
```

## 4. Auth Flow (Clerk)

```
User visits app
  ↓
Clerk <SignIn> / <SignUp> component
  ↓
Clerk handles: email/password, Google OAuth, session management
  ↓
On signup → Clerk webhook fires → POST /api/clerk-webhook
  ↓
Webhook creates row in profiles table (via Prisma):
  { id: clerk_user_id, full_name, email, role: 'helper' }
  ↓
App loads → useUser() (Clerk) + fetch role from profiles table
  ↓
ProtectedRoute checks role → routes to correct portal
```

**Role promotion flow:**
- Admin goes to Workers page → "Add Worker" → creates Clerk user (via Backend API) + sets role to 'worker' in profiles + creates workers row

## 5. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Role {
  helper
  admin
  worker
}

enum ReportStatus {
  pending
  analyzing
  assigned
  in_progress
  resolved
  duplicate
  escalated
}

enum TaskStatus {
  assigned
  in_progress
  completed
  cancelled
  escalated
}

enum Priority {
  critical
  high
  medium
  low
}

enum Category {
  pothole
  garbage
  streetlight
  flooding
  vandalism
  other
}

enum NotificationType {
  task_assigned
  task_completed
  report_update
  alert
}

model Profile {
  id        String   @id // Clerk user ID
  fullName  String?  @map("full_name")
  email     String?
  phone     String?
  avatarUrl String?  @map("avatar_url")
  role      Role     @default(helper)
  createdAt DateTime @default(now()) @map("created_at")

  reports       Report[]
  worker        Worker?
  assignedTasks Task[]         @relation("AssignedBy")
  notifications Notification[]

  @@map("profiles")
}

model Worker {
  id                 String    @id // Same as profile ID
  zone               String?
  isAvailable        Boolean   @default(true) @map("is_available")
  currentLat         Float?    @map("current_lat")
  currentLng         Float?    @map("current_lng")
  lastLocationUpdate DateTime? @map("last_location_update")
  activeTaskCount    Int       @default(0) @map("active_task_count")
  totalCompleted     Int       @default(0) @map("total_completed")

  profile Profile @relation(fields: [id], references: [id], onDelete: Cascade)
  tasks   Task[]

  @@map("workers")
}

model Report {
  id               String       @id @default(uuid())
  reporterId       String?      @map("reporter_id")
  title            String
  description      String?
  imageUrl         String?      @map("image_url")
  lat              Float
  lng              Float
  address          String?
  category         Category?
  status           ReportStatus @default(pending)
  priority         Priority     @default(medium)
  aiCategory       String?      @map("ai_category")
  aiPriority       String?      @map("ai_priority")
  aiConfidence     Float?       @map("ai_confidence")
  aiSummary        String?      @map("ai_summary")
  aiSuggestedAction String?     @map("ai_suggested_action")
  duplicateOfId    String?      @map("duplicate_of")
  createdAt        DateTime     @default(now()) @map("created_at")
  updatedAt        DateTime     @updatedAt @map("updated_at")

  reporter    Profile? @relation(fields: [reporterId], references: [id])
  duplicateOf Report?  @relation("Duplicates", fields: [duplicateOfId], references: [id])
  duplicates  Report[] @relation("Duplicates")
  tasks       Task[]
  alerts      Alert[]

  @@index([status])
  @@index([category])
  @@index([reporterId])
  @@index([lat, lng])
  @@map("reports")
}

model Task {
  id          String     @id @default(uuid())
  reportId    String     @map("report_id")
  workerId    String     @map("worker_id")
  assignedBy  String?    @map("assigned_by")
  status      TaskStatus @default(assigned)
  beforeImage String?    @map("before_image")
  afterImage  String?    @map("after_image")
  notes       String?
  assignedAt  DateTime   @default(now()) @map("assigned_at")
  startedAt   DateTime?  @map("started_at")
  completedAt DateTime?  @map("completed_at")

  report      Report   @relation(fields: [reportId], references: [id], onDelete: Cascade)
  worker      Worker   @relation(fields: [workerId], references: [id])
  assignedByUser Profile? @relation("AssignedBy", fields: [assignedBy], references: [id])

  @@index([workerId])
  @@index([reportId])
  @@map("tasks")
}

model Notification {
  id        String           @id @default(uuid())
  userId    String           @map("user_id")
  title     String
  message   String?
  type      NotificationType
  isRead    Boolean          @default(false) @map("is_read")
  metadata  Json?
  createdAt DateTime         @default(now()) @map("created_at")

  user Profile @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("notifications")
}

model Alert {
  id           String   @id @default(uuid())
  reportId     String   @map("report_id")
  severity     String?
  message      String?
  acknowledged Boolean  @default(false)
  createdAt    DateTime @default(now()) @map("created_at")

  report Report @relation(fields: [reportId], references: [id], onDelete: Cascade)

  @@map("alerts")
}
```

## 6. Supabase Manual Setup (SQL Editor)

Run these AFTER `prisma db push` creates the tables:

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE workers;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

**Note on RLS:** Since we use Prisma with the Supabase connection string (which uses the `postgres` role, not the anon key), RLS does not apply to server-side Prisma queries. The frontend uses Supabase JS client only for realtime subscriptions — data reads/writes go through our API endpoints which authenticate via Clerk. This is a secure pattern: API validates Clerk JWT → Prisma queries DB with full access → returns only authorized data.

## 7. Storage Buckets

Create in Supabase Dashboard → Storage:

| Bucket | Public | Max Size | MIME Types |
|---|---|---|---|
| `report-images` | Yes | 5MB | image/jpeg, image/png, image/webp |
| `completion-images` | Yes | 5MB | image/jpeg, image/png, image/webp |

Storage policies (SQL editor):
```sql
CREATE POLICY "Anyone can upload report images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'report-images');

CREATE POLICY "Anyone can view report images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'report-images');

CREATE POLICY "Anyone can upload completion images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'completion-images');

CREATE POLICY "Anyone can view completion images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'completion-images');
```

## 8. API Endpoints (Vercel Serverless)

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/clerk-webhook` | POST | Clerk webhook secret | Sync new users → profiles table |
| `/api/analyze-report` | POST | Clerk JWT | Send image to Gemini → AI analysis |
| `/api/check-duplicate` | POST | Clerk JWT | Detect duplicate reports within 100m |
| `/api/auto-assign` | POST | Clerk JWT | Hybrid worker assignment algorithm |
| `/api/create-worker` | POST | Clerk JWT (admin) | Create Clerk user + worker profile |
| `/api/send-completion-email` | POST | Internal | Resend email to admin + helper on task completion |
| `/api/reports` | GET/POST | Clerk JWT | CRUD for reports |
| `/api/tasks` | GET/PATCH | Clerk JWT | Read + update tasks |
| `/api/workers` | GET/PATCH | Clerk JWT | Read + update workers |
| `/api/notifications` | GET/PATCH | Clerk JWT | Read + mark notifications |

## 9. AI Pipeline

```
Helper submits report
  ↓
POST /api/reports (creates report, status: 'pending')
  ↓
POST /api/analyze-report { reportId, imageUrl, description }
  ↓
  ├─ Updates report status → 'analyzing'
  ├─ Sends image + text to Gemini 1.5 Flash
  ├─ Gemini returns: { category, priority, confidence, summary, suggestedAction }
  ├─ Updates report with ai_* fields
  ├─ If priority === 'critical' → creates Alert
  └─ Updates report status → 'pending' (ready for assignment)
  ↓
POST /api/check-duplicate { reportId, lat, lng, category }
  ↓
  ├─ Queries reports within ~100m, same category, non-resolved
  ├─ If duplicate → marks report status: 'duplicate', links to original
  └─ If not duplicate → continues
  ↓
POST /api/auto-assign { reportId }
  ↓
  ├─ Queries available workers
  ├─ Scores: 50% proximity + 30% workload + 20% zone
  ├─ Creates task (status: 'assigned')
  ├─ Updates report status → 'assigned'
  ├─ Increments worker active_task_count
  └─ Creates notification for worker
```

## 10. Worker Assignment Algorithm

```
Score(worker) = 0.5 * proximityScore + 0.3 * workloadScore + 0.2 * zoneScore

Where:
  proximityScore = 1 / (1 + haversineDistance(worker, report))  // in km
  workloadScore  = 1 / (1 + worker.activeTaskCount)
  zoneScore      = worker.zone matches report area ? 1.0 : 0.0

Filters:
  - is_available = true
  - last_location_update within 1 hour (skip stale locations)

Tiebreak: fewer total_completed (spread experience)
Fallback: if no workers available → status stays 'pending', admin notified
```

## 11. Email Integration (Resend)

**Trigger:** Worker marks task as completed → `/api/send-completion-email`

**Email 1 → Admin:**
```
Subject: Task Completed: {report.title}
Body: Worker {worker.name} resolved "{report.title}" in zone {worker.zone}.
      Category: {report.category} | Priority: {report.priority}
      Completion photo: {task.afterImage}
```

**Email 2 → Helper (original reporter):**
```
Subject: Your reported issue has been resolved!
Body: Great news! The issue you reported — "{report.title}" — has been
      resolved by our field team.
      Resolution photo: {task.afterImage}
      Thank you for helping improve your community!
```

## 12. Component Architecture

```
src/
├── main.jsx                     # Entry: ClerkProvider + Router
├── App.jsx                      # Routes + ProtectedRoute
├── index.css                    # Tailwind base
│
├── lib/
│   ├── supabase.js              # Supabase client (realtime + storage only)
│   ├── prisma.js                # Prisma client (for API routes)
│   ├── constants.js             # Enums, config values
│   └── utils.js                 # cn(), formatDate, haversine, etc.
│
├── context/
│   └── AuthContext.jsx           # Clerk useUser() + role from DB
│
├── hooks/
│   ├── useReports.js             # Fetch reports via API + realtime sub
│   ├── useWorkers.js             # Fetch workers via API + realtime sub
│   ├── useWorkerTasks.js         # Worker's tasks + realtime
│   ├── useNotifications.js       # Notifications + realtime
│   ├── useGeolocation.js         # GPS position
│   └── useCamera.js              # Camera capture
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── badge.jsx
│   │   ├── dialog.jsx
│   │   ├── input.jsx
│   │   ├── select.jsx
│   │   ├── avatar.jsx
│   │   ├── dropdown-menu.jsx
│   │   ├── table.jsx
│   │   ├── switch.jsx
│   │   ├── separator.jsx
│   │   └── skeleton.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── camera/
│   │   └── GeoCamera.jsx
│   ├── maps/
│   │   └── ReportMap.jsx
│   └── charts/
│       ├── CategoryPie.jsx
│       ├── PriorityBar.jsx
│       ├── Timeline.jsx
│       └── DepartmentPerf.jsx
│
├── pages/
│   ├── Login.jsx                 # Clerk <SignIn>
│   ├── SignUp.jsx                # Clerk <SignUp>
│   │
│   ├── helper/
│   │   ├── HelperLayout.jsx
│   │   ├── HelperHome.jsx
│   │   ├── SubmitReport.jsx
│   │   └── MyReports.jsx
│   │
│   ├── admin/
│   │   ├── AdminLayout.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Reports.jsx
│   │   ├── Workers.jsx
│   │   └── Analytics.jsx
│   │
│   └── worker/
│       ├── WorkerLayout.jsx
│       ├── WorkerDashboard.jsx
│       ├── WorkerMapView.jsx
│       └── WorkerProfile.jsx
│
api/                              # Vercel serverless (project root)
├── clerk-webhook.js
├── analyze-report.js
├── check-duplicate.js
├── auto-assign.js
├── create-worker.js
├── send-completion-email.js
├── reports.js
├── tasks.js
├── workers.js
└── notifications.js
```

## 13. Environment Variables

### `.env.local` (local dev)
```
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Prisma (Supabase Postgres)
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# Gemini AI
GEMINI_API_KEY=your-gemini-key

# Resend
RESEND_API_KEY=re_...
```

### Vercel Environment Variables (Dashboard)
Same as above, set for Production + Preview + Development environments.

## 14. New Dependencies

```bash
# Remove (no longer needed)
npm uninstall firebase @supabase/supabase-js  # keep supabase for realtime+storage
npm uninstall jotai  # not used

# Add
npm install @clerk/clerk-react                 # Auth frontend
npm install prisma @prisma/client              # ORM
npm install resend                             # Email
npm install svix                               # Clerk webhook verification

# shadcn/ui (requires)
npx shadcn@latest init
npx shadcn@latest add button card badge dialog input select avatar dropdown-menu table switch separator skeleton
```

## 15. Build Order

### P0: Foundation
1. Install dependencies (Clerk, Prisma, Resend, shadcn)
2. Configure shadcn/ui (`components.json`, `cn()` utility)
3. Write `prisma/schema.prisma`
4. Run `prisma db push` to create Supabase tables
5. Run manual SQL (PostGIS, Realtime, Storage policies)
6. Create storage buckets in Supabase dashboard
7. Configure Clerk project (Google OAuth, webhook endpoint)
8. Wire `.env.local` with all keys
9. `src/lib/supabase.js` — Supabase client (realtime + storage)
10. `src/lib/utils.js` — cn(), helpers
11. `src/lib/constants.js` — enums, config
12. `src/context/AuthContext.jsx` — Clerk + role lookup
13. `src/main.jsx` — ClerkProvider + BrowserRouter
14. `src/App.jsx` — routes + lazy loading
15. `src/components/layout/ProtectedRoute.jsx`
16. `api/clerk-webhook.js` — user sync

### P1: UI Shell
17. shadcn/ui components (init + add all)
18. `src/components/layout/Navbar.jsx` — Clerk UserButton
19. `src/components/layout/Sidebar.jsx`
20. `HelperLayout.jsx`, `AdminLayout.jsx`, `WorkerLayout.jsx`
21. `Login.jsx` (Clerk `<SignIn>`), `SignUp.jsx` (Clerk `<SignUp>`)

### P2: Helper Flow
22. `src/hooks/useGeolocation.js`
23. `src/hooks/useCamera.js`
24. `src/components/camera/GeoCamera.jsx`
25. `src/pages/helper/SubmitReport.jsx` + `api/reports.js` POST
26. `src/pages/helper/MyReports.jsx` + `api/reports.js` GET
27. `src/pages/helper/HelperHome.jsx`
28. `src/hooks/useReports.js` (API fetch + Supabase realtime)

### P3: Admin Reports + Workers
29. `api/reports.js` GET (all, filtered)
30. `src/pages/admin/Reports.jsx`
31. `api/create-worker.js`
32. `src/pages/admin/Workers.jsx`
33. `src/hooks/useWorkers.js`

### P4: AI Pipeline
34. `api/analyze-report.js` — Gemini integration
35. `api/check-duplicate.js` — PostGIS spatial query
36. `api/auto-assign.js` — hybrid scoring algorithm

### P5: Worker Portal
37. `src/hooks/useWorkerTasks.js`
38. `api/tasks.js` GET/PATCH
39. `src/pages/worker/WorkerDashboard.jsx`
40. `src/components/maps/ReportMap.jsx` (shared)
41. `src/pages/worker/WorkerMapView.jsx` — GPS tracking + task markers
42. `src/pages/worker/WorkerProfile.jsx` — availability toggle
43. `api/workers.js` PATCH (location update, availability)

### P6: Admin Dashboard + Analytics
44. `src/components/charts/CategoryPie.jsx`
45. `src/components/charts/PriorityBar.jsx`
46. `src/components/charts/Timeline.jsx`
47. `src/components/charts/DepartmentPerf.jsx`
48. `src/pages/admin/Dashboard.jsx`
49. `src/pages/admin/Analytics.jsx`

### P7: Emails + Notifications
50. `api/send-completion-email.js` — Resend integration
51. Wire completion email into task completion flow
52. `src/hooks/useNotifications.js`
53. `api/notifications.js` GET/PATCH
54. Notification bell in Navbar

### P8: Polish
55. Error boundaries (React ErrorBoundary component)
56. Code splitting (React.lazy for each portal)
57. Loading skeletons (shadcn Skeleton)
58. Unit tests (Vitest) for hooks + utils
59. Integration tests for API endpoints
60. Component tests for key flows

## 16. Testing Strategy

**Framework:** Vitest + React Testing Library

```
tests/
├── unit/
│   ├── utils.test.js          # haversine, cn, formatDate
│   ├── constants.test.js      # enum validation
│   └── hooks/
│       ├── useReports.test.js
│       └── useGeolocation.test.js
├── integration/
│   ├── api/
│   │   ├── analyze-report.test.js
│   │   ├── auto-assign.test.js
│   │   └── clerk-webhook.test.js
│   └── flows/
│       ├── submit-report.test.js
│       └── complete-task.test.js
└── components/
    ├── GeoCamera.test.jsx
    ├── ReportMap.test.jsx
    └── ProtectedRoute.test.jsx
```

## 17. Decision Log

| # | Decision | Alternatives | Why |
|---|---|---|---|
| D1 | Clerk for auth | Supabase Auth | Polished UI, role mgmt, webhooks, Google OAuth out-of-box |
| D2 | Prisma for schema | Raw SQL | Type-safe, version-controlled schema, migrations |
| D3 | shadcn/ui for components | Custom UI components | Production-quality, accessible, consistent design |
| D4 | Resend for emails | SendGrid, Nodemailer | Simple API, great DX, generous free tier |
| D5 | Supabase client for realtime only | Prisma for everything | Prisma doesn't support Postgres realtime subscriptions |
| D6 | Hybrid worker assignment | Pure proximity / Round-robin | Balances proximity, workload, and zone coverage |
| D7 | Async AI analysis | Synchronous | Avoids Vercel timeout, better UX |
| D8 | PostGIS for spatial | Manual haversine in SQL | Proper indexing, `ST_DWithin` for duplicates |
| D9 | Two storage buckets | One bucket with folders | Clean separation, independent policies |
| D10 | No RLS (API-gated) | Full RLS policies | Frontend never hits DB directly; API validates Clerk JWT |
| D11 | Continuous GPS for workers | Manual location update | More realistic for assignment algorithm |
| D12 | Vitest for tests | Jest | Native Vite support, faster |
