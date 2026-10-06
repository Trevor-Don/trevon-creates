# Implementation Plan: Trevon Creates Studio Platform

> Complete roadmap and phase-by-phase execution plan for Trevon Creates (Public Portfolio + Client Portal + Admin Portal).

---

## Executive Summary & Objectives

Trevon Creates is an engineering-first studio web platform uniting three distinct operational surfaces:
1. **Public Site**: High-conversion portfolio, interactive case studies, and WhatsApp Business inquiry intake.
2. **Client Portal**: Dedicated command center for invited clients (progress telemetry, task checklist, document signing, and deliverables).
3. **Admin Portal**: Owner mission control (lead pipeline, client conversion, automated project provisioning, stage progression, invoice tracking).

### Core Philosophy
- **Automate Every Repeatable Step**: Eliminate administrative drag through templated workflows and automated client task generation.
- **Configure Once, Flow Everywhere**: A project configured by Trevor cascades automatically into stages, tasks, permissions, and progress milestones.
- **Cyber-Modern Aesthetic**: Grounded in the **Trevon Creates Design System** from Google Stitch (Space Grotesk, Fira Sans, `#00FF00`, `#FFAE00`, `#000000`).

---

## Phase Breakdown

### Phase 1: MVP & Foundation (Current Priority)
- **Scaffold & Setup**:
  - Next.js 14+ (App Router, TypeScript) with `output: "standalone"`
  - Tailwind CSS + CSS variable tokens configured from Stitch Design System
  - Google Fonts setup (`Space Grotesk` + `Fira Sans`)
  - Multi-stage Dockerfile and Cloud Run deployment scripts
- **Database & Data Layer**:
  - PostgreSQL schema using Drizzle ORM
  - Core tables: `users`, `leads`, `clients`, `projects`, `project_templates`, `template_stages`, `template_tasks`, `stages`, `tasks`, `deliverables`, `updates`, `portfolio_items`, `testimonials`, `activity_log`
  - Seeding script with Admin user and "Web/App Build" project template
- **Authentication & Authorization**:
  - Firebase Authentication with passwordless magic link sign-in
  - Server-side token validation and DB role mapping (`admin` vs `client`)
  - Strict tenant isolation: client query scoping by `client_id`
- **Surface 1: Public Portfolio & Inquiry Engine**:
  - Home (`/`), Case Studies (`/work`, `/work/[slug]`), About (`/about`)
  - Contact/Inquiry form (`/contact`) with Zod validation
  - Lead persistence (`status: new`) + Admin email alert (Resend)
  - Direct redirect to WhatsApp Business with pre-filled encoded summary
  - Honeypot anti-spam protection
- **Surface 2: Admin Portal (`/admin`)**:
  - Dashboard: Metrics for new leads, active projects, tasks waiting on Trevor vs client
  - Leads manager with one-click **"Convert to client"**
  - Project detail workspace: Stage board, task manager, deliverables, updates
- **Surface 3: Client Portal (`/portal`)**:
  - Magic link login screen (`/portal/login`)
  - Client project view: Stage progress bar (`% = completed / total`), interactive task checklist, deliverables preview, updates feed
- **Phase 1 Acceptance Flow**:
  1. Lead submits inquiry form on `/contact` -> Saved to DB -> Redirects to WhatsApp.
  2. Admin converts lead to client -> Generates project from "Web/App Build" template.
  3. Client signs in via magic link -> Completes onboarding form.
  4. Admin reviews and approves task -> Stage auto-advances.

---

### Phase 2: Operations, Documents & Financials
- **Document Generation & Signing**:
  - Markdown-based contract & MSA rendering with variable interpolation
  - In-app click-to-sign with name, timestamp, and IP recording
  - PDF document export
- **Invoices & Billing**:
  - Sequential invoice generation (`INV-0001`)
  - Due date tracking and overdue status updates
  - Manual payment recording and automated receipt dispatch
- **File Storage & Asset Management**:
  - Google Cloud Storage (GCS) private bucket integration
  - Secure signed URLs for client uploads and deliverables
- **Feedback & Project Closeout**:
  - Structured change request submission and budget/timeline delta calculator
  - Testimonial and project completion review flow

---

### Phase 3: Automation & Integrations
- **Payment Gateway Integration**:
  - Paystack and M-Pesa Daraja payment links and webhooks
  - Automatic invoice status reconciliation (`paid`)
  - Payment-gated stage unlock (e.g., Deposit payment unlocks Discovery)
- **Advanced Communications**:
  - WhatsApp Business Cloud API automated status alerts
  - Cloud Scheduler for automated client task reminders
  - Auto-publishing completed project case studies to the public portfolio

---

## Architectural Decisions (DECISION log)

1. **Framework**: Next.js App Router with TypeScript. Server Components for security, Client Components for interactive HUD panels.
2. **Auth**: Firebase Auth passwordless email link only. Public signup disabled; accounts created solely by admin invitation.
3. **Database**: PostgreSQL with Drizzle ORM for zero runtime overhead and fast cold start.
4. **Security**: Server-side authorization in route handlers and server actions; no client-only security checks.
5. **Aesthetic**: Strictly adhere to the Google Stitch Design DNA (`#00FF00`, `#FFAE00`, `#000000`, 8px grid).

---

## Notion Sync Checklist
- [ ] Phase 1 MVP Scaffold complete
- [ ] Database Schema & Seed Script verified
- [ ] Public site + WhatsApp lead flow operational
- [ ] Admin Portal & Project Workflow active
- [ ] Client Portal & Task Checklist verified
- [ ] Phase 1 Acceptance Walkthrough passed
- [ ] Phase 2 Document & Invoice specs loaded
- [ ] Phase 3 Payment integration verified
