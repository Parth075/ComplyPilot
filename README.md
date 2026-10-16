# ComplyPilot

Production-hardened employee onboarding and compliance operations platform. Powered by **React 19 + Vite + TypeScript** on the frontend, and backed by **Supabase (PostgreSQL, Row-Level Security, Supabase Auth, Storage, and pgvector)**, with server-side AI policy retrieval via **Anthropic Claude API** and automated compliance reminders via **Resend**.

---

## Architecture Overview

- **Frontend:** Vite + React 19 + TypeScript + React Router v7 (SPA with client-side rewrites for Vercel).
- **Database & Auth:** Supabase PostgreSQL with strict **Row-Level Security (RLS)** policies on all 10 schema tables. Authentication supports email/password and magic links. User role (`employee`, `manager`, `hr_admin`) is stored on `public.profiles` and enforced at the database layer.
- **Document Storage:** Supabase Storage private bucket (`documents/{employee_id}/{document_id}.ext`) for opaque personal documents, and public/authenticated bucket (`policies/{policy_id}.pdf`) for organization handbooks.
- **AI Policy Q&A (RAG):** Supabase Edge Function (`ask-policy`) performing `pgvector` cosine similarity search against `policy_chunks`, sending grounded context to Anthropic's Claude 3.5 Sonnet API, and returning strict source citations with a strict "not sure, contact HR" fallback. **Anthropic API key is strictly server-side**.
- **Automated Compliance Reminders:** Scheduled Supabase Edge Function (`compliance-reminders`) querying upcoming or overdue `compliance_records` and triggering notification emails via Resend. **Resend API key is strictly server-side**.
- **Audit Logging:** Every critical administrative action (due date adjustment, ad-hoc task assignment, document review, and CSV audit export) writes an immutable record to `public.audit_log`.

---

## 1. Supabase Project Setup

### A. Create Project & Enable Extensions
1. Log in to [Supabase](https://supabase.com) and create a new project.
2. In the Supabase dashboard, navigate to **Project Settings** -> **API** to copy your **Project URL** and **anon/public key**.

### B. Run Database Migrations & Seeds
1. Open the **SQL Editor** in your Supabase dashboard.
2. Paste and run the contents of [`supabase/migrations/20261016000000_init_schema.sql`](supabase/migrations/20261016000000_init_schema.sql). This creates:
   - Extensions: `uuid-ossp` and `vector` (pgvector).
   - Enums: `user_role`, `task_status`, `document_status`, `compliance_cadence`, `compliance_status`.
   - All 10 tables: `profiles`, `onboarding_templates`, `template_tasks`, `employee_tasks`, `documents`, `policies`, `policy_chunks`, `compliance_requirements`, `compliance_records`, and `audit_log`.
   - Complete Row-Level Security (RLS) policies for `employee`, `manager`, and `hr_admin` access control.
   - Vector match function: `match_policy_chunks(...)`.
   - Trigger `on_auth_user_created` to automatically create a profile row upon registration.
   - Storage buckets: `documents` (private) and `policies` (readable by authenticated users).
3. In the SQL Editor, paste and run the contents of [`supabase/seed.sql`](supabase/seed.sql) to populate baseline templates, tasks, compliance rules, and initial policy text chunks.

### C. Deploy Supabase Edge Functions
Install the Supabase CLI (if not already installed) and log in:
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
```

Deploy the Policy Q&A and Compliance Reminder functions:
```bash
supabase functions deploy ask-policy --no-verify-jwt
supabase functions deploy compliance-reminders
```

Set server-side secrets in the Supabase Dashboard (**Project Settings** -> **Edge Functions** -> **Secrets**) or via the CLI:
```bash
# 100% Free AI Key from https://aistudio.google.com (No credit card needed)
supabase secrets set GEMINI_API_KEY="AIzaSy..."

# (Optional: or leave blank to use the built-in zero-cost grounded excerpt engine)
supabase secrets set RESEND_API_KEY="re_..."
supabase secrets set RESEND_FROM_EMAIL="onboarding@yourdomain.com"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
supabase secrets set APP_BASE_URL="https://your-complypilot.vercel.app"
```

---

## 2. Environment Variables

Create a `.env` file in the project root by copying [`.env.example`](.env.example):
```bash
cp .env.example .env
```

Populate the frontend variables:
```ini
# Client-side (Vite / Browser exposed)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Security Note:** `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` must **NEVER** be placed in `.env` or prefixed with `VITE_`. They are exclusively configured as Supabase Edge Function secrets.

---

## 3. Local Development

Install dependencies and start the development server:
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Build and test production bundle locally:
```bash
npm run build
npm run preview
```

---

## 4. Production Deployment to Vercel

The application is configured for deployment as a static SPA on Vercel with client-side routing rewrites defined in [`vercel.json`](vercel.json).

### Steps to Deploy:
1. Push your repository to GitHub / GitLab / Bitbucket.
2. Go to [Vercel](https://vercel.com) and click **Add New** -> **Project**.
3. Import your `ComplyPilot` repository.
4. Keep the default settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon / Public Key.
6. Click **Deploy**. Vercel will build the application and assign a production URL.

---

## 5. Security & Access Control

- **Zero-Bypass Role Enforcement:** Users cannot select or spoof their role in the frontend. Role is read from `profiles.role` via authenticated session and enforced at the database level using Postgres RLS.
- **Route Guards & Automatic Redirects:**
  - Unauthenticated visitors hitting `/app/*` or `/admin/*` are redirected to `/login`.
  - Employees hitting `/admin/*` are automatically redirected to `/app/dashboard`.
  - Non-managers hitting `/app/team` are redirected to `/app/dashboard`.
  - Admins hitting `/app/*` are redirected to `/admin/dashboard`.
- **Sensitive Document Isolation:** PII and employee documents are stored as opaque files in the private `documents` bucket, never sent to LLMs, and accessible only to the employee and authorized HR administrators.
- **Immutable Audit Logging:** Administrative actions (task deadline adjustments, ad-hoc task creation, document review, and compliance CSV exports) write directly to the `audit_log` table.
