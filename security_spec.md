# Security Specification: Trevon Creates Firebase Rules

## 1. Data Invariants
1. **Admins Only for System Mutation**: Only authenticated studio owners (`don.trevor001@gmail.com` or `trevon@trevoncreates.com`) or users in `/users` with `role == 'admin'` can mutate studio configuration, templates, or client definitions.
2. **Lead Creation**: Anyone (including unauthenticated visitors on the public portfolio) can submit an inquiry lead (`/leads/{leadId}`), but cannot update or delete existing leads without admin privilege.
3. **Project Isolation**: Sub-collections (`tasks`, `documents`, `invoices`, `deliverables`, `updates`) inherit access from parent project permissions. Clients may only read/write their assigned project.
4. **Immutable IDs & Timestamps**: Document IDs must pass `isValidId()`. Creation timestamps cannot be mutated after creation.
5. **Signed Document Locking**: Once a document is signed (`isSigned == true`), the content cannot be modified.

## 2. The Dirty Dozen Payloads (Negative Test Payloads)
1. **Ghost Admin Escalation**: User attempting to set `role: "admin"` on client account creation.
2. **Cross-Project Subcollection Write**: Client injecting a task into another client's project.
3. **ID Poisoning Attack**: Passing a 2KB non-alphanumeric string as a document ID.
4. **Email Spoof Attack**: Setting email to owner without verification (`email_verified == false`).
5. **Lead Scraping by Anonymous User**: Unauthenticated user attempting to list `/leads`.
6. **Signed Document Mutation**: Attempting to alter `content` on an already-signed contract.
7. **Task State Shortcutting**: Client changing task `approvalStatus` to "approved" on their own submission.
8. **Shadow Field Injection**: Adding undeclared system fields into project creation payload.
9. **Denial of Wallet Flooding**: Sending an array of 5,000 tasks inside a single document.
10. **Invoice Total Tampering**: Client modifying `amount` or `invoiceNumber` on an invoice document.
11. **Client Account Hijacking**: Client updating `portalAccessCode` or `totalBudget`.
12. **PII Exposure via Blanket List**: Listing all user profiles without filtering to owned profile.
