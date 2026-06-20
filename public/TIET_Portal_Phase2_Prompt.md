# TIET Research & Mentor Portal — v1 Continuation Prompt (Phase 2)

> **Context for the agent**: The project already has a working foundation — Next.js 16 (App Router), React 19, Tailwind v4, Turso/LibSQL + Drizzle ORM, NextAuth v5 with Google OAuth restricted to `@thapar.edu`, and a modular schema (`users`, `profiles`, `portfolio`, `taxonomy`, `openings`, `proposals`, `workspaces`, `messaging`). Auth, routing, and DB structure are in place. This prompt covers the **next phase**: real data seeding from an actual faculty project call, and a faculty-facing self-service submission/edit form that writes directly into the live schema — functioning like a Google Form, but native to the app and feeding the same tables the discovery engine reads from.

---

## 0. Scope Correction — Cut From v1

Drop the following from active scope. It does not belong in v1 and should not appear in code, routes, schema, or UI:

- ❌ Mobile app (React Native)

If any scaffolding for this already exists in the codebase, leave it as dead code only if removing it risks breaking something already shipped — otherwise delete it. Do not build anything new in this area.

Everything else previously discussed as a "future extension" — alumni mentor network, co-supervision, recommendation engine, seminar/workshop listings, publication co-authorship badges, and TIET ERP/UIMS integration — stays **in scope** for this phase and should be designed and built alongside the rest of the work below. Treat these with the same level of care as the core features:

- **Alumni mentor network**: extend auth to accept `@alumni.thapar.edu` as a second verified domain tier, role `alumni_mentor`, with its own lightweight profile (current company/role, willingness to mentor, domains of interest) distinct from the faculty profile schema.
- **Co-supervision**: support multiple faculty jointly owning a single workspace — a real relational many-to-many between `workspaces` and `users` (faculty), not just free-text `co_mentors`. Each co-supervisor should have equal read/write access to the workspace, milestones, and messaging thread.
- **Recommendation engine**: a basic collaborative-filtering or skill/domain-overlap-based suggestion layer — surface "Faculty you might be a fit for" on the student dashboard and "Students who match your openings" on the faculty dashboard, computed from the existing skills/domains taxonomy junction tables.
- **Seminar/workshop event listings + RSVP**: a simple events module where faculty or admin can post talks/workshops, students RSVP, and attendance is tracked.
- **Publication co-authorship badges**: when a student is listed as a co-author on a paper tied to a project workspace (with faculty confirmation), display a badge on their portfolio's Research & Papers section.
- **TIET ERP/UIMS integration**: build this as a pluggable adapter behind a feature flag — implement the manual-entry fallback now, but structure the CGPA/attendance fields so they can be swapped for a live UIMS API pull once institute access is granted, without a schema migration.

---

## 1. Real Data Seeding — Source of Truth

A real faculty project call has been collected: **"ELC Summer Internship 2026 — Call for Projects from Faculty"**, sourced from `Project Details for Students.pdf`. This contains **78 real projects** spanning 9 departments (BTD, CED, CHED, CSED, ECED, EIED, ELC, MED, Others) with real faculty names, `@thapar.edu` emails, phone numbers, and full project abstracts.

This is not placeholder/dummy data — it is the actual current faculty project pool and should seed the production-shaped tables (`faculty_profiles`, `openings`/`projects`, `users` for faculty where missing).

### 1.1 Seed File

A structured JSON extraction of this PDF is attached as `projects_seed.json` (78 entries). Each entry has: `id`, `title`, `department`, `mentor_name`, `mentor_email`, `mentor_phone`, `co_mentor_name`, `co_mentor_email`, `co_mentor_phone`.

**Important data-quality notes the agent must handle, not ignore:**
- Several mentor emails repeat (one faculty member listed across multiple projects) — dedupe into one `faculty_profiles` row per unique email, with multiple linked `openings` rows.
- A handful of rows have `co_mentor_email` that is identical to `mentor_email` (PDF transcription artifact, e.g. project #2, #21) — do not create a duplicate self-referencing co-mentor; treat as a data-entry error and either null it or flag it for the faculty member to correct via their own edit form (see Section 3).
- Department codes in the source map to real TIET departments: `BTD` = Biotechnology, `CED` = Civil Engineering, `CHED` = Chemical Engineering, `CSED` = Computer Science & Engineering, `ECED` = Electronics & Communication Engineering, `EIED` = Electrical & Instrumentation Engineering, `MED` = Mechanical Engineering, `ELC` = Experiential Learning Centre (cross-department/interdisciplinary projects), `Others` = unclassified/interdisciplinary.
- Some phone numbers have inconsistent formatting (with/without country code, spaces) — normalize on insert to a single E.164-like format (`+91XXXXXXXXXX`), don't store raw.
- Faculty designations (`Dr.` prefix) are present for most but not all (a few are non-PhD staff, e.g. `Mr Sumit Sharma`, `Vivek Jain`, `Jayant Kolte` appear without `Dr.`) — store `has_doctorate: boolean` derived from prefix presence, and store display name without forcing a fake `Dr.` prefix onto people who don't have one.

### 1.2 Seed Script Requirements

Write a one-time idempotent seed script (`src/db/seed/projects-2026.ts` or similar, following the existing `seed/` pattern in the codebase) that:

1. Reads `projects_seed.json`.
2. For each unique `mentor_email`:
   - Upserts a `users` row with role `faculty`, status `active` (pre-verified — these are confirmed real faculty from an official call, skip the normal admin-approval queue for this seed batch only), and a flag `seeded_from: "elc_2026_call"` so these accounts are distinguishable from organically self-registered faculty.
   - Upserts a `faculty_profiles` row with name, department, designation (`has_doctorate` derived).
   - **Do not overwrite** any field a faculty member has already manually edited post-seed — seed script must be safe to re-run without clobbering live edits (check an `is_manually_edited` boolean per profile, or use a `last_seeded_at` vs `updated_at` comparison, before touching profile fields on re-run).
3. For each project row, inserts into the `openings`/`projects` table:
   - Title, full abstract/description, department, linked faculty (`mentor_id` FK), co-mentor as free-text (name + email + phone, not a separate FK relation — co-mentors are not required to have portal accounts), status `open`, `source: "elc_2026_call"`.
4. Logs a summary: faculty created, faculty matched-existing, projects inserted, projects skipped due to data issues (e.g. missing mentor email).
5. Is safe to run via a single `npm run db:seed:projects` command.

### 1.3 Co-mentor Handling

Co-mentors are stored as **structured free text**, not as a second FK to `users`, because:
- They may not have logged into the portal yet.
- Several rows have ambiguous multi-person co-mentor strings (e.g. `"Dr Ravinder Kumar Duvedi, Dr Bikramjit Sharma, Dr Krishan Kumar Gupta, Dr Harishankar Singh"`).

Schema for this: `openings.co_mentors` as a JSON text column storing an array of `{ name, email, phone }` objects, parsed from the comma-separated source string at seed time. If a co-mentor's email matches an existing `faculty_profiles` row, link it as a soft reference (`co_mentor_user_ids: number[]` JSON array) for future cross-linking on their own profile ("co-mentored on" list) — this soft link is also what feeds the relational co-supervision feature once a workspace is created from this opening (see Section 6).

### 1.4 Relationship Between Seed-Time Co-Mentors and Workspace Co-Supervision

These are two different layers and should not be conflated:
- **At the opening/listing level** (Section 1.3 above): co-mentors stay free-text + soft-linked `co_mentor_user_ids`, because a listing can reference people who haven't logged in yet, and the PDF data is inherently loose (multi-person comma-separated strings).
- **At the workspace level** (Section 6 below): once a proposal is accepted and a workspace is created from an opening, any co-mentor whose email resolves to a real `faculty_profiles` row should be offered a one-click "Add as co-supervisor" action, which creates a proper relational entry in the new `workspace_supervisors` join table — giving them full read/write access to that workspace. Co-mentors who don't yet have an account stay as display-only free text on the workspace until they sign up, at which point the same one-click prompt should appear for the primary mentor to formalize them.

---

## 2. Faculty Self-Service Submission Form (Google-Forms-style, native to the app)

This is the core new feature for this phase: a guided, multi-step form — modeled on the simplicity of a Google Form — that any verified faculty member fills out to **submit a new project listing**, which writes directly into the same `openings` table that powers student discovery. No admin moderation step required for faculty submitting their own data (they're already verified via `@thapar.edu` OAuth) — but log every submission for audit.

### 2.1 Form Location & Entry Points

- Route: `/openings/new` (within the existing `(portal)/openings/` route group).
- Entry points: prominent "Post a new project" CTA on the faculty dashboard, and on `/openings` (their own openings list view).
- Also build `/openings/[id]/edit` for editing an existing posting they own — same form component, pre-filled, with a `mode: 'create' | 'edit'` prop. Don't duplicate the form markup between create and edit.

### 2.2 Form Fields (mirrors the structure proven by the real PDF data)

Step-by-step (3 steps, like a typed Google Form, not one giant page):

**Step 1 — Project Basics**
- Project title (text, max 200 chars, required)
- Department (select, pre-filled from their own faculty profile, editable in case of interdisciplinary project, required)
- Full project description / abstract (textarea, markdown-lite, recommend ~150–500 words, required)
- Domain tags (multi-select from the existing `research_domains` taxonomy table, required, min 1)

**Step 2 — Mentorship Details**
- First mentor (auto-filled: themselves, name + email + phone from their profile — phone editable per-posting in case they want a different contact number for this specific project)
- Co-mentor(s) — repeatable field group (name, email, phone), add/remove rows, 0 to N entries. If a co-mentor's email matches an existing faculty account, show a live inline confirmation chip ("✓ matched to Dr. X's profile").
- Required skills (multi-select from existing `skills` taxonomy table, required, min 1)
- Preferred student year/batch (multi-select: BE1/BE2/BE3/BE4/MTech/PhD)
- Seats available (number input, default 1)
- Engagement type (select: RA / Thesis / Project Collaboration / Co-authorship / Internship / ELC Activity)
- Stipend/credit (select: Paid / Academic Credit / Unpaid, with optional free-text amount field if Paid)

**Step 3 — Logistics & Review**
- Application deadline (date picker, optional)
- Duration (text or dropdown: e.g. "8 weeks", "1 semester", "ongoing")
- Application instructions (optional free-text — e.g. "email a 1-page SOP")
- Status (Draft / Open — faculty chooses whether to publish immediately or save as draft)
- Final review screen showing the whole posting as it will appear to students, with an "Edit" link back to any step, before final "Publish" button

### 2.3 Validation & UX Behavior

- Client-side validation per step (cannot advance with required fields empty), but allow **saving as Draft at any step** without full validation — drafts are private to the faculty member, never shown in discovery.
- Auto-save to a draft state every ~10 seconds or on step change, so faculty don't lose work (use the same pattern as the rest of the app's form handling, e.g. React Hook Form + Zod, matching what's already used elsewhere in the codebase for the portfolio builder — check `portfolio/` form components first and reuse the pattern rather than inventing a new one).
- On publish: writes to `openings` table with `source: "self_submitted"` (distinguishing from the `elc_2026_call` seed batch), `status: "open"`, and timestamps.
- Confirmation screen with a link to the live posting and a "Post another" shortcut.

### 2.4 Editing Existing Postings

- Faculty can edit any posting where they are `mentor_id` (or listed as a co-mentor with a linked account, if that soft-link exists).
- Edits update `updated_at`; keep `created_at` immutable.
- Editing a posting that already has active proposals/shortlisted students against it should show a non-blocking warning banner: "X students have already applied — changing requirements won't notify them automatically." Do not auto-notify; that's out of scope for this phase.
- Faculty can change status: `Draft → Open → Closed`. Closing a posting hides it from discovery but does not delete it or break existing workspace links.
- Faculty can delete a Draft outright. Cannot hard-delete a posting once it's `Open` or `Closed` and has any linked proposal — soft-delete (`status: "archived"`) instead, to preserve referential integrity with any student application history.

### 2.5 Profile Sync

When a faculty member submits their first project through this form, also surface a lightweight prompt (not a blocking modal) on their dashboard: "Your faculty profile is X% complete — add your bio, research interests, and office hours to help students find you." Link to `/portfolio` (faculty profile editor). Do not force profile completion before allowing a posting — the form must work standalone for a faculty member who just wants to post quickly.

---

## 3. Data Correction Workflow (handles the seed data quality issues from Section 1.1)

Because the seed data has known minor issues (duplicate co-mentor emails, inconsistent phone formats, missing `Dr.` prefixes), give faculty an easy way to fix their own seeded data without needing an admin:

- When a faculty member logs in for the first time and their account was `seeded_from: "elc_2026_call"`, show a one-time onboarding banner: "We've pre-loaded your project from the Summer 2026 call. Please review and confirm your details." Link to their profile edit page with the seeded fields highlighted for review (not locked, just visually flagged as "auto-imported — please verify").
- Same applies to their seeded project posting(s) — flagged as "auto-imported," editable via the same `/openings/[id]/edit` flow described in 2.4.
- Once a faculty member edits any seeded field, clear the "needs review" flag on that record.

---

## 5. Database Schema Additions Needed (Core Module)

Building on the existing modular schema files, add or extend:

```
faculty_profiles:
  + has_doctorate: boolean
  + seeded_from: text | null        // 'elc_2026_call' | null
  + needs_review: boolean default false
  + is_manually_edited: boolean default false
  + last_seeded_at: timestamp | null

openings (or projects, matching existing table name):
  + source: text                    // 'elc_2026_call' | 'self_submitted'
  + co_mentors: text (JSON array)   // [{name, email, phone}]
  + co_mentor_user_ids: text (JSON array) | null   // soft FK links, optional
  + status: enum('draft','open','closed','archived')
  + needs_review: boolean default false
  + seats_available: integer default 1
  + engagement_type: enum('RA','Thesis','Project Collaboration','Co-authorship','Internship','ELC Activity')
  + stipend_type: enum('Paid','Academic Credit','Unpaid')
  + stipend_amount: text | null
  + duration: text | null
  + application_deadline: date | null
  + application_instructions: text | null
```

Keep this consistent with the SQLite/Turso constraints already in place (JSON as text columns, no native arrays — matches the documented migration pattern from PostgreSQL).

---

## 6. Implementation Details for Restored Features

### 6.1 Alumni Mentor Network

- New `users.role` enum value: `alumni_mentor`.
- Auth callback (`lib/auth.ts`) needs a second accepted domain pattern: `@alumni.thapar.edu`, classified separately from the existing student/faculty regex logic in `email-utils.ts`. Do not let alumni emails fall through to student/faculty parsing.
- New `alumni_profiles` table: `user_id` FK, `current_company`, `current_role`, `graduation_year`, `degree_program`, `willing_to_mentor: boolean`, `mentorship_domains` (JSON array, linked to the same `research_domains` taxonomy used elsewhere), `linkedin_url`, `bio`.
- Alumni mentors appear in student discovery as a separate filterable category alongside faculty — keep the UI clearly distinguishing "Faculty" vs "Alumni Mentor" cards (different badge/accent), since the engagement type is different (mentorship/career guidance, not formal research supervision).
- Alumni mentors do not post `openings` or run formal proposal/workspace flows in this phase — they use the messaging system directly (with the same cold-DM throttling rules as faculty) for informal mentorship conversations. Do not build a parallel proposal pipeline for them yet.

### 6.2 Co-Supervision (Workspace-Level)

- New join table `workspace_supervisors`: `workspace_id` FK, `user_id` FK (faculty), `added_at`, `added_by` (which existing supervisor approved adding them), `role: enum('primary','co_supervisor')`.
- A workspace must always have exactly one `primary` supervisor (the original mentor from the accepted proposal/opening) and zero or more `co_supervisor` rows.
- All supervisors (primary + co) get identical permissions within that workspace: milestone creation/editing, file uploads, messaging thread access, status changes, and writing the completion endorsement (Section on Collaboration Workspace from the original prompt).
- Only the `primary` supervisor can remove a co-supervisor or close/archive the workspace.
- See Section 1.4 for how co-supervisors get added from opening-level co-mentor data.

### 6.3 Recommendation Engine

- Keep this simple and explainable in v1 — no ML model, just a deterministic scoring function, computed server-side at request time (no need for a background job/cron in this phase given expected data volume).
- Student-side ("Faculty you might be a fit for"): score = (count of overlapping `research_domains` between student profile and faculty profile) + (count of overlapping `skills` between student profile and faculty's currently-open posting requirements), weighted domains higher than skills (e.g. 2x). Surface top 5 on student dashboard.
- Faculty-side ("Students who match your openings"): same overlap logic, scoped to students with `open_to_research: true`, ranked per-opening. Surface top 5 per opening, accessible from the opening's detail/shortlist view — this should reuse the same scoring function as the discovery filter's match-score calculation (Section 7.2 of the original prompt), don't duplicate the logic in two places.
- Build this as a single shared utility function (e.g. `lib/matching.ts`) called from both the dashboard recommendation widgets and the discovery/shortlist filter views.

### 6.4 Seminar/Workshop Event Listings + RSVP

- New `events` table: `title`, `description`, `host_user_id` FK (faculty or admin), `event_type: enum('seminar','workshop','talk','other')`, `start_time`, `end_time`, `location` (text — room number or meeting link), `capacity: integer | null`, `department` (optional filter tag), `status: enum('draft','published','cancelled')`.
- New `event_rsvps` table: `event_id` FK, `user_id` FK (student), `rsvp_at`, `attended: boolean default false` (faculty/host can mark attendance after the fact, optional for v1 — don't over-build a check-in system, a simple manual toggle is enough).
- Route: `/events` (list/browse, filterable by department and date), `/events/new` (host-only creation form, reuse the multi-step form pattern from Section 2 where reasonable but this is a much shorter form — title, description, type, time, location, capacity — doesn't need 3 steps, one page is fine), `/events/[id]` (detail + RSVP button for students).
- If `capacity` is set and reached, show "Full" and disable RSVP (no waitlist in this phase).
- Notification on RSVP confirmation and a reminder notification ~24h before the event (reuse the existing notification system rather than building a separate one).

### 6.5 Publication Co-Authorship Badges

- Extend the existing `student_papers` table (in `portfolio.ts`) with: `workspace_id: integer | null` FK (links the paper to the project workspace it came out of, if any), `co_authorship_confirmed_by: integer | null` FK to a faculty `user_id`.
- A student can self-report a paper as normal (existing flow, unconfirmed). If they additionally tag it as resulting from a specific workspace, the workspace's primary or co-supervisor gets a notification with a one-click "Confirm co-authorship" action.
- Once confirmed, the paper entry on the student's public portfolio displays a small "✓ Faculty-confirmed" badge distinct from self-reported entries. Unconfirmed papers still display normally, just without the badge — never block or hide unconfirmed self-reported papers.

### 6.6 TIET ERP/UIMS Integration (Adapter Pattern)

- Do not attempt a live integration in this phase — institute API access is not yet granted.
- Structure it correctly so it's a drop-in later: create `lib/integrations/uims-adapter.ts` exporting a typed interface (e.g. `getStudentAcademicRecord(rollNumber): Promise<{ cgpa, enrolledCourses, attendance } | null>`), with a single concrete implementation right now — `ManualEntryAdapter` — that just reads/writes the existing manual `cgpa` field on `student_profiles` and returns `enrolledCourses`/`attendance` as `null`/empty.
- The student profile UI calls this adapter, not the raw DB field directly, so swapping in a real `UimsApiAdapter` later requires zero changes to any component — only a new adapter class and a config flag.
- Do not add UI for attendance or auto-pulled course enrollment yet, since there's no real data source — just leave the interface shape ready for it.

---

## 7. Deliverables for This Phase

1. `projects_seed.json` ingested via a working, idempotent seed script.
2. Faculty self-service multi-step submission form at `/openings/new`, writing to the live `openings` table.
3. Edit flow at `/openings/[id]/edit` reusing the same form component.
4. Draft/Open/Closed/Archived lifecycle implemented and enforced at the API layer (not just UI).
5. Seeded-data review banners for faculty whose data came from the PDF import.
6. Schema migrations for all new columns/tables listed in Sections 5 and 6.
7. Alumni mentor auth tier, profile, and discovery integration (Section 6.1).
8. Relational co-supervision at the workspace level via `workspace_supervisors` (Section 6.2).
9. Shared matching/recommendation utility powering both dashboards and discovery filters (Section 6.3).
10. Events module with RSVP (Section 6.4).
11. Co-authorship confirmation flow and portfolio badge (Section 6.5).
12. UIMS adapter interface with manual-entry implementation, ready for future swap (Section 6.6).
13. Mobile app scaffolding (if any exists) confirmed removed; no new mobile-specific code introduced.

---

*End of Phase 2 prompt. Attach `projects_seed.json` alongside this document when submitting to the implementation agent.*