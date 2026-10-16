# ComplyPilot UI Prototype — Outcome Tracking

## [x] 1. Build the public entry and role-aware app shell

- `/` is a minimal static landing page with app name, tagline, feature bullets, and a Login button; it has no hero background, marketing imagery, or animation.
- `/login` contains an email/password or magic-link demo flow; `/signup` contains an account-creation demo flow.
- A persistent left sidebar shows navigation appropriate to the selected role. Employees see their own checklist, documents, and policy chat; managers see those employee pages plus a direct-reports view; HR Admin sees a separate 7-tab admin set. No top navigation or mega-menus are used.
- Include a demo-only role selector and local route/state behavior. Do not implement real authentication, backend services, or database persistence.
- Include all routes: `/`, `/login`, `/signup`, `/app/dashboard`, `/app/tasks`, `/app/documents`, `/app/ask`, `/app/profile`, `/app/team`, `/admin/dashboard`, `/admin/employees`, `/admin/employees/:id`, `/admin/templates`, `/admin/policies`, `/admin/compliance`, `/admin/reports`, and `/admin/settings`.

## [x] 2. Implement employee and manager onboarding routes

- `/app/dashboard` shows a personalized checklist, a progress bar, and what is next for the employee.
- `/app/tasks` shows a full task list, details, statuses, and due dates.
- `/app/documents` supports a front-end-only mock upload/file-picker interaction and displays uploaded, pending review, approved, and rejected states. A simulated failed upload has an inline retry action; no file is transmitted or persisted.
- `/app/profile` shows personal information, role, manager, and start date.
- `/app/team` is manager-only and lists direct reports with status flags.
- Employees see only their own employee experience; managers get the employee experience plus the team view.

## [x] 3. Implement policy Q&A and shared feedback states

- `/app/ask` presents a standard chat-bubble interface. Each grounded assistant answer has a visible source link/citation to the policy section it came from. An uncertain “I’m not sure, contact HR” answer has a distinct reassuring treatment, not an error treatment.
- Include a chat typing indicator. Chat errors suggest contacting HR directly.
- Include empty states for no onboarding plan assigned and no policies uploaded; each reads as “nothing here yet,” not as a broken page.
- Lists and dashboards have skeleton loading states.
- Keep all demo chat content fictional and generic HR; it does not represent live policy/legal advice or select an industry or jurisdiction.

## [x] 4. Implement the HR admin dashboard and employee review pages

- `/admin/dashboard` presents an org-wide onboarding/compliance overview, stat/count cards (including overdue-item counts), overdue flags, and a filterable table. This is the highest-density screen and prioritizes scanability.
- `/admin/employees` presents a filterable all-employee list.
- `/admin/employees/:id` presents one employee’s full history and a document review/approve UI.
- Task-status visuals are one consistent reusable component for not started, in progress, pending review, and completed; reuse the same component on the employee dashboard, manager team view, and HR admin employee detail page.
- The admin navigation is the HR Admin-only 7-tab set; no admin-facing content appears in employee navigation.

## [x] 5. Implement HR admin configuration and audit tools

- `/admin/templates` supports building/editing onboarding checklist templates.
- `/admin/policies` supports mock uploading and managing policy documents.
- `/admin/compliance` supports configuring compliance requirements and deadlines.
- `/admin/reports` supports generating and downloading CSV audit reports in the browser.
- `/admin/settings` supports organization settings, departments, and roles.
- These controls use front-end-only demo state and do not imply that a real organization record has been changed.

## [x] 6. Apply the approved visual system and responsive behavior

- The interface uses the approved custom people-first operations-console design: canvas `#F6F8F5`, white surfaces, ink `#1D2925`, secondary text `#586760`, divider `#DDE5DF`, and signature forest green `#26745B`, with restrained semantic status colors.
- DM Sans is used for UI/headings and IBM Plex Mono only for IDs, dates, and compact metadata. Spacing follows a 4/8px rhythm; controls use a 10px radius and cards 14px; subtle elevation is limited to overlays.
- Employee pages emphasize the next action and use more breathing room; HR admin tables are dense but grouped and scan-friendly. Desktop-first layout is responsive, with sidebar collapse to a drawer on narrow screens.
- Use an original text-first ComplyPilot wordmark and no external financial-sector logos or copied branding. The landing page remains static and minimal. Motion is limited to roughly 150ms interaction feedback; honor reduced-motion settings.
- Use readable status labels in addition to color, visible focus indicators, and accessible semantic form controls.

## [x] 7. Deliver the viewable prototype and route declaration

- Serve a `public/manus-routes.json` manifest at `/manus-routes.json` with every route above, including `/admin/employees/:id` as the dynamic route pattern; keep it synchronized with the app routes.
- Configure TypeScript diagnostics before application code; pin the package manager and record reviewed dependency lifecycle permissions before the first install.
- The app starts on the WebDev-configured port and returns a successful Preview response. The route manifest returns HTTP 200 with valid JSON and every listed route.
- Resolve actionable TypeScript diagnostics and run the project’s available production/build check.
- Keep the result in Preview for the internal walkthrough; do not publish publicly unless later requested. Do not add real authentication, backend/database services, external integrations, or file transmission.

## [x] 8. Template task editing, HR date controls, and master onboarding blueprint

- `/admin/templates`: Full task management in existing templates. HR Admins can view all steps within a template, edit step titles, categories, due windows (e.g. Day 1, Day 5, Day 30), assigned owners (Employee, Manager, HR Admin, IT), instructions, and mandatory flags. Admins can also add new steps or delete obsolete steps with immediate state updates.
- `/admin/employees/:id`: HR Admin task due date adjustment. Admins can adjust task deadlines directly on the employee's onboarding checklist, with quick presets (Today, +3 days, +1 week, +2 weeks, end of month), custom date input, and optional change reasons that are automatically logged into the employee's audit trail timeline.
- `/app/onboarding` and `/admin/onboarding`: Comprehensive Onboarding Hub and Platform Blueprint containing:
  1. Complete employee profile & provisioning dossier (Maya Chen, personal details, equipment serials, MDM enrollment, SaaS entitlements).
  2. 5-Stage Lifecycle Milestone Roadmap (Pre-boarding, Day 1 launchpad, Week 1 compliance, Month 1 immersion, Days 30-60 autonomy, Days 60-90 graduation with verification evidence).
  3. Regulatory compliance & legal repository (Form I-9, Form W-4, Direct Deposit, NDAs, Handbook, SOC2 Type II training).
  4. Strategic Architecture Decision Matrix for upcoming building plans (HRIS bi-directional sync, dynamic conditional template engine, AI OCR identity verification, Slack RAG bot, e-signatures, SLA escalation engine) with interactive priority selection, sprint approval tracking, stakeholder notes, and direct CSV export.
