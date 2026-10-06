# ComplyPilot — AI Employee Onboarding & Compliance Assistant
### Project Planning Documents (PRD · TRD · App Flow · Backend Schema · Implementation Plan)

---

## Assumptions

Since several brief fields were left to my judgment, here's exactly what I decided and why — correct anything below before we go further:

1. **App name:** "ComplyPilot" — placeholder, easy to rename later; used consistently across every document and table/variable name.
2. **Target user:** HR teams and employees at small-to-mid-size companies (roughly 20–500 people), especially remote/hybrid teams where onboarding is currently scattered across email, PDFs, and spreadsheets, and HR has no single place to see who's behind on compliance.
3. **Platform — "both":** interpreted as **one responsive web app** (works on desktop and mobile browsers) rather than separate native iOS/Android apps. Native apps would roughly double the build (separate codebase, app store accounts, review process) and aren't realistic for a free-tier solo build. If you actually meant native mobile apps, say so and I'll redo the TRD/Implementation Plan.
4. **Tech stack:** Next.js (frontend + API routes) + Supabase (Postgres + Auth + Storage + pgvector) + Claude API for the chat/RAG agent, deployed on Vercel. Reasoning is in the TRD — this combo keeps everything free-tier except the LLM API calls themselves, which are unavoidable for any AI feature and billed per-token (see TRD constraints — **verify current Anthropic API pricing before building**, since I won't guess at numbers).
5. **UI/UX Design Brief:** **left out of this file**, since you're designing visuals in a separate tool. Everything that tool needs to know — every page, every tab, what's on each screen, navigation, auth flow, button destinations — is still fully specified in the **App Flow** document below. Say the word whenever you want a colors/typography/vibe brief added.
6. **Must-have features for v1** (narrowed from the broader list in my earlier thoughts doc, to keep v1 buildable by one person):
   - Role-based login (Employee, Manager, HR Admin)
   - Personalized onboarding checklist per employee, built from reusable HR-defined templates
   - Document upload with status tracking (uploaded / pending / approved)
   - Policy Q&A chat grounded in uploaded policy documents (RAG), with citations and an "ask HR" fallback when unsure
   - Compliance deadline tracking with automated email reminders
   - HR Admin dashboard showing org-wide onboarding/compliance status
   - Audit log + exportable compliance report (CSV)
7. **Out of scope for v1:** native mobile apps; real e-signature/legal integration (DocuSign etc.); automatic IT account provisioning (Okta/AD); Slack/Teams bot; multi-language support; multi-company (multi-tenant) support — this version serves one company's employees.

---

# 1. PRD (Product Requirements Document)

### App name and tagline
**ComplyPilot** — "Onboarding that doesn't need a spreadsheet, and compliance you can actually audit."

### Problem statement
New hires don't know what's pending and who to ask; HR can't easily see, across the whole org, who's finished what and who's about to fall out of compliance. Compliance evidence (who acknowledged which policy, when) is scattered and hard to produce under audit pressure.

### Target user persona
- **Dana, HR Generalist (HR Admin):** manages onboarding for 15–40 new hires a quarter across two offices. Currently tracks completion in a shared spreadsheet; dreads the yearly compliance audit because the records aren't centralized.
- **Sam, New Hire (Employee):** started this week, has a dozen onboarding emails, doesn't know what's actually required vs. optional, and doesn't want to keep pinging HR with basic questions.
- **Priya, Team Manager (Manager):** wants a simple heads-up if her new report is stuck or behind, without logging into a full HR system.

### Core value proposition
One place where employees see exactly what's left to do and can ask policy questions in plain language, and where HR gets a live, audit-ready view of who's compliant and who isn't — without chasing anyone manually.

### Must Have features
1. Role-based auth and dashboards (Employee / Manager / HR Admin)
2. Onboarding checklist engine (HR-defined templates → per-employee task instances)
3. Document upload with status tracking
4. Policy Q&A chat (RAG over uploaded policy docs, with citations)
5. Compliance deadline tracking + automated email reminders
6. HR Admin org-wide dashboard
7. Audit log + CSV compliance export

### Nice to Have (v2+)
- Real e-signature integration (DocuSign/HelloSign)
- Slack/Teams bot interface
- Automatic IT provisioning on hire (Okta/Google Workspace webhook)
- Multi-company (multi-tenant) support
- Native mobile apps
- Policy version diffing ("this policy changed since you last acknowledged it")

### User stories
- As an **employee**, I want to see a checklist of exactly what I still need to do, so I don't miss anything.
- As an **employee**, I want to ask "how many sick days do I get" and get a sourced answer, so I don't have to email HR for basic policy questions.
- As an **HR Admin**, I want to build an onboarding template once per role, so I don't manually assign tasks to every new hire.
- As an **HR Admin**, I want to see, at a glance, who is overdue on any compliance item org-wide.
- As an **HR Admin**, I want to export a compliance report for a specific employee or policy, so I'm ready for an audit without manual digging.
- As a **manager**, I want to be notified if my new report is stuck, so I can help before it becomes a problem.

### Out of scope (v1)
Native mobile apps; legal e-signature; automated IT provisioning; Slack/Teams bot; multi-language; multi-tenant.

### Success metrics
- % of onboarding tasks completed within target timeframe (e.g., day-1 tasks done by day 1)
- Average time-to-first-answer for policy questions (chat vs. prior email-to-HR turnaround)
- % of compliance items completed before their deadline (no overdue items at audit time)
- HR Admin time spent per week manually tracking onboarding (should trend toward zero)

---

# 2. TRD (Technical Requirements Document)

### Frontend
**Next.js 14 (App Router) + TypeScript + Tailwind CSS.** Single codebase serves both the Employee portal and the HR Admin console behind role-based routing — one reason: avoids maintaining two separate frontends for a single-developer build.

### Backend
**Next.js API routes / Route Handlers** (no separate backend service). Reason: keeps the whole app in one deployable unit, which is simplest for a solo, free-tier build.

### Database and provider
**Supabase (managed Postgres)**, free tier. Reason: gives Postgres + Auth + Storage + pgvector (for RAG embeddings) in one free-tier product, instead of stitching together three separate services.

### Authentication
**Supabase Auth** (email/password + magic link). Roles (`employee`, `manager`, `hr_admin`) stored on the `profiles` table and enforced via Postgres Row-Level Security (RLS). Reason: avoids a third-party auth bill and keeps auth + data access rules in the same place (the database), which is also easier to defend in a compliance audit.

### Hosting
**Vercel** (free tier) for the Next.js app; Supabase hosts the database/auth/storage. Reason: Vercel is the natural free-tier host for Next.js with zero extra config.

### Third-party APIs
| API | Purpose | Tier |
|---|---|---|
| Anthropic Claude API | Policy Q&A chat + RAG answer generation | Paid, pay-per-token — **verify current pricing/limits before building**, this is the one real recurring cost in an otherwise free stack |
| Resend (or Supabase's built-in email) | Compliance deadline reminder emails | Free tier available — **verify current free-tier send limits before building** |

### Key libraries
- `@supabase/supabase-js` — DB/auth/storage client
- `@anthropic-ai/sdk` — Claude API calls
- Postgres `pgvector` extension — policy document embeddings for RAG
- `react-hook-form` + `zod` — form handling and validation
- `papaparse` or a simple server-side CSV writer — compliance export

### Environment variables (names only — never real values)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
RESEND_API_KEY
APP_BASE_URL
```

### Constraints
- Free-tier infrastructure only, except unavoidable LLM API usage.
- Solo developer build — stack chosen to minimize the number of separate services to learn/manage.
- No real PII should be used in development/demo — use synthetic employee data.

---

# 3. App Flow

### Page list (routes and purpose)

**Public**
| Route | Purpose |
|---|---|
| `/` | Landing page — simple static page (app name, tagline, feature bullets, "Login" button). Not wired to auth/Supabase; exists purely to explain the product before someone logs in. |
| `/login` | Email/password or magic-link login |
| `/signup` | Account creation (HR Admin invites employees in practice, but a self-serve signup exists for demo purposes) |

**Employee**
| Route | Purpose |
|---|---|
| `/app/dashboard` | "What's next for me" — personalized checklist + progress bar |
| `/app/tasks` | Full task list with detail, status, due dates |
| `/app/documents` | Upload required documents; see status (pending/approved) |
| `/app/ask` | Policy Q&A chat |
| `/app/profile` | Personal info, role, manager, start date |

**Manager** (adds to Employee tabs)
| Route | Purpose |
|---|---|
| `/app/team` | List of direct reports with onboarding/compliance status, flags for anyone stuck |

**HR Admin**
| Route | Purpose |
|---|---|
| `/admin/dashboard` | Org-wide onboarding/compliance overview — counts, overdue flags |
| `/admin/employees` | All employees, filterable by status/department/role |
| `/admin/employees/[id]` | Single employee's full task + compliance history |
| `/admin/templates` | Build/edit onboarding checklist templates per role |
| `/admin/policies` | Upload/manage policy documents (feeds the RAG index) |
| `/admin/compliance` | Compliance requirements + deadlines config |
| `/admin/reports` | Generate/export CSV audit reports |
| `/admin/settings` | Org settings, departments, roles |

### Navigation type
Left sidebar navigation (persistent), with the visible tabs determined by role — Employee sees 5 tabs, Manager sees those + "Team," HR Admin sees the full admin set instead.

### First screen for a new visitor
`/login`. No public marketing page in v1 — this is an internal tool, not a public product.

### Auth flow
1. User lands on `/login`.
2. Supabase Auth validates credentials → session issued.
3. App reads `profiles.role` → redirects: `employee`/`manager` → `/app/dashboard`; `hr_admin` → `/admin/dashboard`.
4. Unauthenticated access to any `/app/*` or `/admin/*` route redirects to `/login`.
5. Authenticated employee hitting any `/admin/*` route → redirected to `/app/dashboard` (role mismatch, not an error page).

### Core user journeys

**Journey A — New hire completes onboarding**
1. Employee logs in → `/app/dashboard` shows checklist generated from the template assigned to their role.
2. Employee clicks a task (e.g., "Upload signed NDA") → `/app/documents` → uploads file → status becomes "Pending review."
3. HR Admin reviews in `/admin/employees/[id]` → marks "Approved" → task auto-completes on employee's dashboard.
4. Progress bar updates; when all Must-Have tasks are done, dashboard shows "Onboarding complete" state.

**Journey B — Employee asks a policy question**
1. Employee goes to `/app/ask`, types a question.
2. Backend retrieves relevant policy chunks (pgvector similarity search) → sends to Claude with retrieved context → returns answer with a citation link to the source policy section.
3. If no sufficiently relevant policy chunk is found, the agent responds that it isn't sure and suggests contacting HR directly — it does not guess.

**Journey C — HR Admin tracks compliance and exports an audit report**
1. HR Admin opens `/admin/dashboard` → sees count of overdue compliance items org-wide.
2. Clicks into `/admin/compliance` → sees which employees are overdue on which requirement.
3. Goes to `/admin/reports` → selects employee or policy + date range → exports CSV with full completion history and timestamps.

### Empty, loading and error states
- **Empty:** `/app/dashboard` with no assigned template → "No onboarding plan assigned yet — contact HR." `/admin/policies` with no documents uploaded → "Upload a policy document to enable the Q&A assistant."
- **Loading:** skeleton loaders on dashboard/task list; a typing indicator in the chat while the RAG pipeline runs.
- **Error:** failed upload → inline retry message, file stays in "not uploaded" state (never silently lost); chat API failure → "Something went wrong — try again, or contact HR directly for this question."

### Redirect rules
Unauthenticated → `/login`. Wrong-role route access → redirected to that role's own dashboard, not shown an error page. Successful login → role-based dashboard as above.

---

# 4. Backend Schema

### Auth provider
Supabase Auth (manages the underlying `auth.users` table). Application-level profile and role data lives in `public.profiles`, linked 1:1 to `auth.users`.

### User roles
`employee`, `manager`, `hr_admin` — stored as an enum on `profiles.role`.

### Tables

**profiles**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK, FK → auth.users.id) | |
| full_name | text | |
| role | enum(employee, manager, hr_admin) | |
| department | text | |
| manager_id | uuid (FK → profiles.id, nullable) | |
| start_date | date | |
| created_at | timestamptz | |

**onboarding_templates**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | e.g. "Engineering Onboarding" |
| role_target | text | which role/department this applies to |
| created_by | uuid (FK → profiles.id) | |
| created_at | timestamptz | |

**template_tasks**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| template_id | uuid (FK → onboarding_templates.id) | |
| title | text | |
| description | text | |
| due_offset_days | int | days from start_date |
| required | boolean | Must Have vs optional |

**employee_tasks** (per-employee task instances, generated from a template on assignment)
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| employee_id | uuid (FK → profiles.id) | |
| template_task_id | uuid (FK → template_tasks.id) | |
| status | enum(not_started, in_progress, pending_review, completed) | |
| due_date | date | computed from start_date + due_offset_days |
| completed_at | timestamptz (nullable) | |

**documents**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| employee_id | uuid (FK → profiles.id) | |
| employee_task_id | uuid (FK → employee_tasks.id, nullable) | |
| storage_path | text | Supabase Storage object path |
| status | enum(uploaded, pending_review, approved, rejected) | |
| uploaded_at | timestamptz | |
| reviewed_by | uuid (FK → profiles.id, nullable) | |

**policies**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| title | text | |
| storage_path | text | original document in Supabase Storage |
| version | int | |
| uploaded_by | uuid (FK → profiles.id) | |
| uploaded_at | timestamptz | |

**policy_chunks** (RAG index)
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| policy_id | uuid (FK → policies.id) | |
| content | text | chunked policy text |
| embedding | vector(1536) | pgvector column |
| section_ref | text | for citation display, e.g. "Section 4.2" |

**compliance_requirements**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| title | text | e.g. "Annual Data Privacy Training" |
| applies_to_role | text (nullable) | null = applies to everyone |
| recurrence | enum(one_time, annual) | |
| policy_id | uuid (FK → policies.id, nullable) | linked policy, if any |

**compliance_records**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| employee_id | uuid (FK → profiles.id) | |
| requirement_id | uuid (FK → compliance_requirements.id) | |
| status | enum(pending, completed, overdue) | |
| due_date | date | |
| completed_at | timestamptz (nullable) | |

**audit_log**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| actor_id | uuid (FK → profiles.id) | who performed the action |
| action | text | e.g. "task_approved", "policy_uploaded", "record_exported" |
| target_table | text | |
| target_id | uuid | |
| metadata | jsonb | before/after values where relevant |
| created_at | timestamptz | |

### Relationships
`profiles` 1—N `employee_tasks`, `documents`, `compliance_records`; `onboarding_templates` 1—N `template_tasks`; `template_tasks` 1—N `employee_tasks`; `policies` 1—N `policy_chunks`, `compliance_requirements`; every write that matters for compliance also writes a row to `audit_log`.

### Row-level access rules
| Table | employee | manager | hr_admin |
|---|---|---|---|
| profiles | read/update own row only | read own + direct reports | read/update all |
| employee_tasks | read/update own | read own reports' | read/update all |
| documents | insert/read own | read own reports' | read/update all |
| policies, policy_chunks | read all (needed for Q&A) | read all | read/write all |
| compliance_records | read own | read own reports' | read/update all |
| onboarding_templates, template_tasks | no access | no access | read/write all |
| audit_log | no access | no access | read all, insert via system only |

### File storage structure
Supabase Storage buckets: `documents/{employee_id}/{document_id}.ext` (private, RLS-gated by employee_id/role) and `policies/{policy_id}.pdf` (readable by all authenticated users, since policy text must be queryable org-wide).

### Sensitive-field handling
Government ID numbers, bank details, and signed tax/legal forms are stored only as **opaque uploaded files** in the private `documents` bucket — never parsed into structured database columns, and never sent to the Claude API. The RAG pipeline only ever touches `policy_chunks` (HR-authored policy text), never employee personal documents.

### API endpoint list
```
POST   /api/auth/login
POST   /api/tasks/:id/complete
POST   /api/documents/upload
PATCH  /api/documents/:id/review          (hr_admin only)
POST   /api/chat/ask                       (RAG query)
GET    /api/admin/dashboard-stats          (hr_admin only)
POST   /api/admin/templates
POST   /api/admin/templates/:id/assign
POST   /api/admin/policies/upload
GET    /api/admin/compliance
GET    /api/admin/reports/export           (hr_admin only, writes audit_log row)
```

---

# 5. Implementation Plan

### Phase 0 — Setup
**Goal:** working skeleton, deployed.
- Init Next.js + TypeScript + Tailwind project
- Create Supabase project, enable `pgvector` extension
- Connect Vercel deployment, set env vars
**Done check:** empty app deployed and reachable at a live URL.

### Phase 1 — Database & Auth
**Goal:** users can sign up/log in and get routed by role.
- Create all tables and RLS policies above
- Implement Supabase Auth login/signup pages
- Role-based redirect logic
**Done check:** three test accounts (employee/manager/hr_admin) each land on the correct dashboard and cannot access each other's admin routes.

### Phase 2 — Onboarding Checklist Engine
**Goal:** HR can build a template; employees see their generated checklist.
- `/admin/templates` CRUD
- Template → `employee_tasks` assignment logic on new-hire creation
- `/app/dashboard` and `/app/tasks` views with status updates
**Done check:** a template with 5 tasks, assigned to a test employee, shows correctly on their dashboard with working status changes.

### Phase 3 — Document Upload
**Goal:** employees can upload required documents; HR can review.
- Supabase Storage integration, private bucket + RLS
- `/app/documents` upload UI
- `/admin/employees/[id]` review/approve UI
**Done check:** upload → pending → approved flow works end-to-end and updates the linked task.

### Phase 4 — Policy Q&A (RAG)
**Goal:** employees can ask policy questions and get sourced answers.
- `/admin/policies` upload + chunking + embedding pipeline into `policy_chunks`
- `/api/chat/ask`: embed query → pgvector similarity search → Claude API call with retrieved context → return answer + citation
- `/app/ask` chat UI
**Done check:** a question clearly answered in an uploaded policy returns a correct, cited answer; a question not covered by any policy returns an honest "not sure, contact HR" response instead of a guess.

### Phase 5 — Compliance Tracking & Reminders
**Goal:** deadlines are tracked and reminders go out automatically.
- `/admin/compliance` requirement config
- Scheduled job (Vercel Cron or Supabase scheduled function) to flag overdue records and send reminder emails via Resend
**Done check:** a requirement with a near-term due date triggers a reminder email to the test account.

### Phase 6 — HR Admin Dashboard & Audit Export
**Goal:** HR has one place to see org status and pull audit-ready reports.
- `/admin/dashboard` aggregate stats
- `/admin/reports` CSV export, writing an `audit_log` row per export
**Done check:** exported CSV matches what's shown in the dashboard for a test employee.

### Phase 7 — Testing
**Goal:** core flows are verified end-to-end.
- Manual test pass through Journeys A, B, and C from the App Flow
- RLS policy tests confirming no role can read/write outside its allowed tables
**Done check:** no role can access another role's data; all three journeys complete without errors.

### Phase 8 — Deployment & Polish
**Goal:** production-ready v1.
- Final Vercel production deploy, env var check, empty/loading/error states verified on every page
**Done check:** a fresh test account can complete the entire new-hire journey (login → tasks → document upload → policy question → compliance visible to HR) without any developer intervention.

### Phase 9 — Landing Page
**Goal:** a simple static page explaining the product before login. Low priority — build last, doesn't block or depend on any other phase.
- One static page at `/`: app name, one-line tagline, 3–4 feature bullets, "Login" button linking to `/login`
- No hero imagery, animations, or marketing copy — this is evaluated by a live walkthrough, not cold traffic, so keep it to a clean, professional minimum
- Not connected to Supabase/auth in any way — pure presentation
**Done check:** page loads, clearly states what the app does, and the Login button correctly routes into the real app.

### Overall done criteria
All Must Have features from the PRD are live, traceable to App Flow pages and Backend Schema tables, every table has a defined access rule, and all three core journeys pass end-to-end on the deployed app.

---

# Consistency Check

- **Rule 1 (naming consistency):** App name "ComplyPilot," page routes, table names, and the three roles (`employee`, `manager`, `hr_admin`) are identical across the PRD, TRD, App Flow, Backend Schema, and Implementation Plan.
- **Rule 2 (traceability):** Every Must Have feature in the PRD maps to specific App Flow pages, a Backend Schema table, and an Implementation Plan phase:
  - Role-based auth → `/login`, `profiles` table → Phase 1
  - Onboarding checklist → `/app/dashboard`, `/admin/templates`, `onboarding_templates`/`template_tasks`/`employee_tasks` → Phase 2
  - Document upload → `/app/documents`, `documents` table → Phase 3
  - Policy Q&A → `/app/ask`, `policies`/`policy_chunks` tables → Phase 4
  - Compliance tracking + reminders → `/admin/compliance`, `compliance_requirements`/`compliance_records` → Phase 5
  - HR Admin dashboard + audit export → `/admin/dashboard`, `/admin/reports`, `audit_log` table → Phase 6

### Open questions for you
1. Confirm "both platforms" = one responsive web app, not separate native apps (see Assumption 3).
2. Any specific industry in mind (tech, healthcare, finance)? That would change what compliance requirements look like in the demo data (e.g., HIPAA-style vs. generic HR policies).

A separate **UI Design Context** file has been generated for your design tool — it has the full page list, navigation structure, and key interaction patterns on its own, so it doesn't need this document.
