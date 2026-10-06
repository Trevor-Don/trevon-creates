# Architecture & Technical Design: Trevon Creates

> System architecture, data flow, security model, and deployment topology.

---

## 1. System Topology

```
+--------------------------------------------------------------------------+
|                            Cloudflare DNS                                |
|             yourdomain.com | portal.yourdomain.com | admin.yourdomain.com|
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                  Google Cloud Run (Next.js Standalone Container)        |
|                                                                          |
|  +--------------------+  +----------------------+  +------------------+  |
|  |    Public Site     |  |    Client Portal     |  |   Admin Portal   |  |
|  |  (/, /work, /about)|  |  (/portal/*)         |  |   (/admin/*)     |  |
|  +--------------------+  +----------------------+  +------------------+  |
|                                     |                                    |
|              Server-Side Role Guard & Zod Request Validation             |
+--------------------------------------------------------------------------+
           |                         |                         |
           v                         v                         v
+--------------------+    +--------------------+    +--------------------+
|   PostgreSQL DB    |    |  Firebase Auth     |    |   External APIs    |
| (Neon / Supabase)  |    | (Email Magic Link) |    | - Resend (Email)   |
| Drizzle ORM        |    | Admin / Client     |    | - WhatsApp Business|
+--------------------+    +--------------------+    | - Cloud Storage GCS|
                                                    +--------------------+
```

---

## 2. Role-Based Routing & Access Control

### Routing Strategy
1. **Public Site**: Anonymous access.
2. **Client Portal (`/portal`)**:
   - Guarded by session middleware.
   - User must have role `client`.
   - Data queries strictly scoped by `client_id = authUser.clientId`.
3. **Admin Portal (`/admin`)**:
   - Guarded by session middleware.
   - User must have role `admin` (verified server-side from DB, never trusted from client JWT).

---

## 3. Database Architecture (Drizzle ORM Schema)

All tables use UUID v4 primary keys and standard timestamps (`created_at`, `updated_at`).

### Core Tables
1. **`users`**: Identity mapping between Firebase UID and platform role (`admin` | `client`).
2. **`leads`**: Potential clients who submit `/contact`.
3. **`clients`**: Confirmed client accounts linked to `users`.
4. **`projects`**: Active or past engagements linked to a `client_id`.
5. **`project_templates`**, **`template_stages`**, **`template_tasks`**: Reusable workflow templates ("Web/App Build").
6. **`stages`**: Concrete project milestones (`Onboarding`, `Discovery`, `Design`, `Build`, `Delivery`, `Closing`).
7. **`tasks`**: Concrete actionable checklist items (`owner: admin | client`, `type: form | upload | approval | payment | link | call | document | info`).
8. **`deliverables`**: Prototype links, Figma URLs, or files stored in GCS.
9. **`documents`**: In-app contracts and MSAs with signature tracking (`signed_name`, `signed_ip`, `signed_at`).
10. **`invoices`**: Billing records (`INV-XXXX`).
11. **`updates`**: Timestamped progress notes from Trevor to the client.
12. **`change_requests`**: Scope change proposals with budget & timeline deltas.
13. **`portfolio_items`**: Case studies published to `/work`.
14. **`testimonials`**: Client reviews and endorsements.
15. **`activity_log`**: Immutable audit log of all system actions.

---

## 4. The Workflow State Machine

Stages and tasks are data-driven:
1. When Trevor creates a project, he selects a template (e.g. "Web/App Build").
2. The system clones all template stages and tasks into `stages` and `tasks`.
3. Only **one stage** is `status = 'current'` at a time; others are `upcoming` or `done`.
4. **Task Lifecycle**:
   `pending` -> Client submits -> `submitted` -> Admin approves -> `approved` -> (or `rejected` with notes).
5. Progress is dynamically computed:
   $$\text{Progress \%} = \frac{\text{Completed Required Tasks}}{\text{Total Required Tasks}} \times 100$$
6. When all required tasks in a stage are completed, the system advances to the next stage.

---

## 5. Deployment & Containerization

### Next.js Standalone
In `next.config.js`:
```js
module.exports = {
  output: 'standalone',
};
```
The Dockerfile uses a multi-stage Alpine build copying only `./standalone` and `./static` files, keeping the image under 150MB.

### Google Cloud Run
- Scaled from 0 to N instances.
- Environment variables injected via Google Secret Manager.
