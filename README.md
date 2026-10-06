# Trevon Creates Platform

> Professional Portfolio, Client Portal, and Admin Mission Control for Trevon Creates Studio. Built with Next.js 14, TypeScript, Tailwind CSS, and Google Stitch Design System.

---

## Documentation Index (Ready for Notion Sync)
- [PROJECT_SPEC.md](docs/PROJECT_SPEC.md): Complete requirements, business goals, roles, and phase roadmap.
- [IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md): Phase-by-phase execution plan and acceptance criteria.
- [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md): Complete Stitch design tokens, color palette, typography, and component styling.
- [STITCH_SCREENS.md](docs/STITCH_SCREENS.md): Catalog of all 26 screens from Google Stitch.
- [ARCHITECTURE.md](docs/ARCHITECTURE.md): System topology, data models, workflow engine, and Cloud Run deployment.

---

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Stitch Cyber-Modern Design DNA
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Firebase Authentication (Passwordless Email Magic Link)
- **Deployment**: Google Cloud Run (Containerized Standalone)
- **Notifications**: Resend (Email) + WhatsApp Business API

---

## Environment Setup
Create a `.env.local` file with the following keys:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/trevon_creates
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
RESEND_API_KEY=your-resend-api-key
GCS_BUCKET=trevon-creates-assets
WHATSAPP_BUSINESS_NUMBER=254700000000
ADMIN_EMAIL=trevon@trevoncreates.com
APP_URL=http://localhost:3000
```

---

## Local Development
```bash
# Install dependencies
npm install

# Run database migrations
npx drizzle-kit push:pg

# Seed admin and templates
npm run db:seed

# Start dev server
npm run dev
```
