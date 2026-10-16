# ComplyPilot

A responsive frontend demo for an internal onboarding and compliance workspace. The app is intentionally frontend-only: authentication, uploads, policy retrieval, authorization, and reporting are represented with local mock state for a live walkthrough.

## Run locally

```bash
npm install
npm run dev
# or: pnpm install && pnpm dev
```

The preview listens on port `3000`.

## Demo walkthrough

Start at `/` and choose **Open workspace**. The public login and signup forms route into the employee dashboard without requiring credentials. Use the **Preview as** selector at the bottom of the left sidebar to switch between Employee, Manager, and HR Admin experiences.

The employee and manager flows demonstrate checklist progress, task status changes, document upload/retry states, policy Q&A citations and fallback answers, profile details, and direct-report tracking. The HR Admin flow demonstrates the higher-density dashboard, employee filters and detail review, templates, policies, compliance requirements, CSV report export, and organization settings.

## Routes

The complete route set is kept in `public/manus-routes.json` for the managed preview runtime.
