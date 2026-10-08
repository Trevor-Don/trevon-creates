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

# Type-check and lint
npm run lint

# Start dev server on port 3000
npm run dev

# Production standalone build
npm run build
```

---

## CI/CD & Cloud Build Deployment (europe-west1)

This project is configured for automated CI/CD deployment via GitHub Actions and Google Cloud Build targeting the **europe-west1** region.

### 1. Google Cloud Build (`cloudbuild.yaml`)
Target Region: **`europe-west1`**  
Service Name: **`trevon-creates-platform`**  
Artifact Registry: **`europe-west1-docker.pkg.dev/$PROJECT_ID/trevon-creates/platform`**

To trigger a manual Cloud Build run in `europe-west1`:
```bash
gcloud builds submit \
  --config=cloudbuild.yaml \
  --region=europe-west1 \
  --substitutions=_REGION=europe-west1,_SERVICE_NAME=trevon-creates-platform
```

### 2. GitHub Actions Workflow (`.github/workflows/deploy.yml`)
1. On each push or PR to `main`, the pipeline automatically validates types with `npm run lint` and verifies the build with `npm run build`.
2. Upon merging to `main`, the workflow authenticates to Google Cloud via Workload Identity Federation or GitHub Secrets (`GCP_SA_KEY`), triggers Cloud Build in `europe-west1`, and rolls out the latest container image to Cloud Run.

### 3. Container Specs (`Dockerfile`)
Multi-stage minimal Alpine container running Node.js 22 with standalone static SPA server on port 3000 and automatic client-route fallback (`server.mjs`). Single container size < 120MB, scaling to zero on idle.

