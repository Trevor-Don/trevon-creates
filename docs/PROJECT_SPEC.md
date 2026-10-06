# Project Spec: Portfolio + Client Portal + Admin Portal

> Source of truth for Trevon Creates. Built in phases.

---

## 1. Purpose

A single web app with three surfaces:

1. **Public site**: a professional portfolio and landing page with a project inquiry form that hands the lead off to WhatsApp Business.
2. **Client portal**: invite-only. Clients see project status, complete assigned tasks, view deliverables, sign documents, and pay invoices.
3. **Admin portal**: used only by the owner (Trevon). Manages leads, clients, projects, templates, deliverables, documents, invoices.

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

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS (+ shadcn/ui components) |
| Design System | Stitch "Trevon Creates Design System" (Cyber Modernism) |
| Auth | Firebase Auth, **email link (passwordless) sign-in** |
| Database | **Postgres** (Neon / Supabase); ORM: Drizzle ORM |
| File storage | Google Cloud Storage (private bucket, signed URLs) |
| Hosting | Google Cloud Run (container, scale to zero, `output: "standalone"`) |
| Secrets | Google Secret Manager |
| Email | Resend (transactional) |
| DNS + domain | Cloudflare |
| CI/CD | GitHub Actions (Cloud Run deploy) |
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

**Inquiry form fields:** name, email, phone/WhatsApp, project type (dropdown), short description, budget range (dropdown), desired timeline (dropdown).

**Submit behavior:**
1. Validate and save to `leads` (status `new`).
2. Email the admin a notification.
3. Redirect the visitor to a WhatsApp link: `https://wa.me/<BUSINESS_NUMBER>?text=<url-encoded summary of their form entries>`.
4. Rate-limit the endpoint and add a honeypot field or Turnstile to block spam.

### 5.2 Admin portal
- `/admin` dashboard: new leads, active projects, tasks waiting on me, tasks waiting on clients, unpaid invoices
- `/admin/leads` list and detail; actions: mark contacted/qualified/lost, **Convert to client**
- `/admin/clients` list and detail
- `/admin/projects` list; `/admin/projects/[id]` full project control:
  - project details (title, description, scope, requirements, budget, currency, start and target dates)
  - stage board: advance, reorder, add, or hide stages
  - task list: add, edit, assign owner, set due date, approve or reject client submissions
  - deliverables: add links (prototype, final) or upload files; mark visible to client
  - documents: generate from templates, send, track signed status
  - invoices: create, send, mark paid
  - updates: post progress updates to the client
  - change requests: review, approve (adjusts budget/timeline)
  - activity log
- `/admin/templates` manage project templates (stages and tasks)
- `/admin/portfolio` manage case studies and testimonials
- `/admin/settings` business info, WhatsApp number, email templates

### 5.3 Client portal
- `/portal/login` enter email, receive magic link (only works for admin-created accounts)
- `/portal` list of the client's projects
- `/portal/projects/[id]`:
  - progress tracker (current stage highlighted, percent complete)
  - "Your tasks" (items the client must do) and "In progress by me" (admin tasks, read-only)
  - timeline and budget summary (as released by admin)
  - deliverables (prototype link, final link, files)
  - documents (view, sign)
  - invoices (view, pay)
  - updates feed
  - file uploads
  - change request form
  - feedback form and testimonial request at the end

---

## 6. Data Model

All tables use UUID primary keys, `created_at` and `updated_at`.

- **users**: `id`, `firebase_uid`, `email` (unique), `role` (`admin`|`client`), `name`
- **leads**: `id`, `name`, `email`, `phone`, `project_type`, `description`, `budget_range`, `timeline`, `status` (`new`|`contacted`|`qualified`|`converted`|`lost`), `notes`, `converted_client_id`
- **clients**: `id`, `user_id`, `name`, `company`, `phone`, `whatsapp`, `notes`
- **projects**: `id`, `client_id`, `title`, `description`, `scope`, `requirements`, `status` (`draft`|`active`|`paused`|`completed`|`cancelled`), `template_id`, `budget_amount`, `currency`, `start_date`, `target_end_date`, `current_stage_id`, `released_to_client` (bool)
- **project_templates**: `id`, `name`, `description`
- **template_stages**: `id`, `template_id`, `name`, `position`
- **template_tasks**: `id`, `template_stage_id`, `title`, `description`, `owner`, `type`, `config` (jsonb), `position`
- **stages**: `id`, `project_id`, `name`, `position`, `status` (`upcoming`|`current`|`done`), `started_at`, `completed_at`, `visible_to_client`
- **tasks**: `id`, `project_id`, `stage_id`, `title`, `description`, `owner` (`client`|`admin`), `type` (`form`|`upload`|`approval`|`payment`|`link`|`call`|`document`|`info`), `status` (`pending`|`submitted`|`approved`|`rejected`|`done`|`blocked`), `due_date`, `config` (jsonb), `response` (jsonb), `completed_at`, `position`
- **deliverables**: `id`, `project_id`, `stage_id`, `title`, `kind` (`link`|`file`), `url`, `file_key`, `version`, `visible_to_client`
- **documents**: `id`, `project_id`, `type`, `title`, `content` (markdown), `file_key`, `status`, `signed_at`, `signed_name`, `signed_ip`
- **invoices**: `id`, `project_id`, `number`, `description`, `amount`, `currency`, `status`, `due_date`, `payment_link`, `paid_at`
- **updates**: `id`, `project_id`, `author_id`, `body`, `created_at`
- **change_requests**: `id`, `project_id`, `description`, `budget_delta`, `timeline_delta_days`, `status`
- **files**: `id`, `project_id`, `uploader_id`, `key`, `name`, `size`, `mime`
- **portfolio_items**: `id`, `slug`, `title`, `summary`, `body`, `cover_image`, `tags`, `live_url`, `published`
- **testimonials**: `id`, `client_name`, `role_company`, `quote`, `project_id`, `published`
- **activity_log**: `id`, `actor_id`, `project_id`, `action`, `meta` (jsonb)

---

## 7. Workflow Engine

### Default template: "Web/App Build"
1. **Onboarding**: Welcome doc, Onboarding form, Contract + scope, MSA, Deposit invoice
2. **Discovery**: Request for access, Kick-off call booking, Requirements confirmation
3. **Design**: Wireframes, Designs, Design approval
4. **Build**: Live prototype link, Progress updates, Testing/UAT feedback
5. **Delivery**: Final invoice, Final link, Handover docs, Credentials transfer
6. **Closing**: Feedback form, Testimonial request, Support period info

---

## 8. Phases

- **Phase 1: MVP**: Core surfaces, leads flow, WhatsApp redirect, admin conversion, project instantiation, client onboarding flow, task approval, stage advancement, email notifications.
- **Phase 2**: Document templates, in-app signing, PDF export, invoices, GCS file uploads with signed URLs, change requests, feedback/testimonials.
- **Phase 3**: Paystack / M-Pesa payments, payment-gated stages, auto-portfolio publishing.
