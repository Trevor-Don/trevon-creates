# Project Spec: Portfolio + Client Portal + Admin Portal

> Hand this file to the coding agent as the source of truth. Build in the phases at the bottom, in order. Ask before deviating from anything marked **DECISION**.

---

## 1. Purpose

A single web app with three surfaces:

1. **Public site**: a professional portfolio and landing page with a project inquiry form that hands the lead off to WhatsApp Business.
2. **Client portal**: invite-only. Clients see project status, complete assigned tasks, view deliverables, sign documents, and pay invoices.
3. **Admin portal**: used only by the owner (Trevor). Manages leads, clients, projects, templates, deliverables, documents, invoices.

**Core goal:** automate every repeatable step of client work (onboarding, contracts, invoices, access requests, kick-off, feedback, handover) so the owner spends his time on the actual work.

**Core principle:** the owner configures a project once (scope, timeline, budget, requirements). That configuration flows to the client automatically and generates the client's task checklist.

---

## 2. Roles

| Role | How created | Access |
|---|---|---|
| `admin` | Seeded manually (owner's email) | Everything |
| `client` | Created by admin only. No public signup. | Only their own projects, tasks, documents, invoices, files |
| anonymous | n/a | Public site only |

---

## 3. Tech Stack

**DECISION (default, change only if told):**

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS (+ shadcn/ui components) |
| Auth | Firebase Auth, **email link (passwordless) sign-in** |
| Database | **Postgres** via a free-tier host (Neon or Supabase) to start; ORM: Drizzle or Prisma |
| File storage | Google Cloud Storage (private bucket, signed URLs) |
| Hosting | Google Cloud Run (container, scale to zero) |
| Secrets | Google Secret Manager |
| Email | Resend (transactional) |
| DNS + domain | Cloudflare |
| CI/CD | GitHub Actions to build the container and deploy to Cloud Run |
| Payments | Paystack and/or M-Pesa Daraja (Phase 3) |

---

## 4. Architecture and Domains

One codebase, one deployment, role-based routing.

| URL | Purpose |
|---|---|
| `yourdomain.com` | Public portfolio |
| `portal.yourdomain.com` | Client portal (or `/portal` path) |
| `admin.yourdomain.com` | Admin portal (or `/admin` path) |

---

## 5. Surfaces and Routes

### 5.1 Public site
- `/` hero, services, selected work, process, testimonials, CTA
- `/work` and `/work/[slug]` case studies (from `portfolio_items`)
- `/about`
- `/contact` inquiry form

### 5.2 Admin portal
- `/admin` dashboard: new leads, active projects, tasks waiting on me, tasks waiting on clients, unpaid invoices
- `/admin/leads` list and detail; actions: mark contacted/qualified/lost, **Convert to client**
- `/admin/clients` list and detail
- `/admin/projects` list; `/admin/projects/[id]` full project control
- `/admin/templates` manage project templates (stages and tasks)
- `/admin/portfolio` manage case studies and testimonials
- `/admin/settings` business info, WhatsApp number, email templates

### 5.3 Client portal
- `/portal/login` enter email, receive magic link (only works for admin-created accounts)
- `/portal` list of the client's projects
- `/portal/projects/[id]`:
  - progress tracker (current stage highlighted, percent complete)
  - "Your tasks" and "In progress by me"
  - timeline and budget summary
  - deliverables
  - documents (view, sign)
  - invoices (view, pay)
  - updates feed
  - change request form

---

## 6. Default Template: "Web/App Build"

1. **Onboarding**: Welcome doc, Onboarding form, Contract + scope, MSA, Deposit invoice
2. **Discovery**: Request for access, Kick-off call booking, Requirements confirmation
3. **Design**: Wireframes, Designs, Design approval
4. **Build**: Live prototype link, Progress updates, Testing/UAT feedback
5. **Delivery**: Final invoice, Final link, Handover docs, Credentials transfer
6. **Closing**: Feedback form, Testimonial request, Support period info

---

## 7. Environment Variables

```env
DATABASE_URL=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
RESEND_API_KEY=
GCS_BUCKET=
WHATSAPP_BUSINESS_NUMBER=254142993925
ADMIN_EMAIL=trevon@trevoncreates.com
APP_URL=http://localhost:3000
PAYSTACK_SECRET_KEY=
```
