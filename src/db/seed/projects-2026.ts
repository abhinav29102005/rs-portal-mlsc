/**
 * ELC Summer Internship 2026 — Faculty Project Seed Script
 *
 * Ingests projects_seed.json into the live schema:
 *   - Upserts faculty users and profiles (deduped by email)
 *   - Inserts openings with structured co-mentor data
 *   - Normalizes phone numbers to +91XXXXXXXXXX
 *   - Detects doctorate from name prefix (Dr.)
 *
 * Usage: npm run db:seed:projects
 * Safe to re-run — idempotent by design.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";
import { resolve } from "path";

import { users } from "../schema/users";
import { facultyProfiles } from "../schema/profiles";
import { openings } from "../schema/openings";

/* ──────────────── DB Client ──────────────── */

const client = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

/* ──────────────── Types ──────────────── */

interface SeedProject {
  id: number;
  title: string;
  department: string;
  mentor_name: string;
  mentor_email: string;
  mentor_phone: string | null;
  co_mentor_name: string | null;
  co_mentor_email: string | null;
  co_mentor_phone: string | null;
  description?: string;
}

interface CoMentor {
  name: string;
  email: string | null;
  phone: string | null;
}

/* ──────────────── Department Code Mapping ──────────────── */

const DEPT_CODE_MAP: Record<string, string> = {
  BTD: "Biotechnology",
  CED: "Civil Engineering",
  CHED: "Chemical Engineering",
  CSED: "Computer Science & Engineering",
  ECED: "Electronics & Communication Engineering",
  EIED: "Electrical & Instrumentation Engineering",
  ELC: "Experiential Learning Centre",
  MED: "Mechanical Engineering",
  Others: "Interdisciplinary",
};

/* ──────────────── Utility Functions ──────────────── */

/**
 * Normalize a phone number to +91XXXXXXXXXX format.
 * Handles: "9501020747", "07719669340", "+91 94632 79788", "99119 41540"
 */
function normalizePhone(raw: string | null): string | null {
  if (!raw) return null;
  // Strip everything except digits
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return null;

  // If starts with 91 and has 12 digits total → already has country code
  if (digits.startsWith("91") && digits.length === 12) {
    return `+${digits}`;
  }
  // If 10 digits → add +91
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  // If 11 digits starting with 0 → drop leading 0, add +91
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+91${digits.slice(1)}`;
  }
  // Fallback: store what we can
  return `+91${digits.slice(-10)}`;
}

/**
 * Detect if a name has a doctorate prefix.
 */
function hasDoctorate(name: string): boolean {
  const lower = name.trim().toLowerCase();
  return lower.startsWith("dr.") || lower.startsWith("dr ");
}

/**
 * Strip Dr./Dr prefix from a name for clean storage.
 */
function cleanName(name: string): string {
  return name.replace(/^(Dr\.\s*|Dr\s+)/i, "").trim();
}

/**
 * Parse co-mentor string(s) into structured CoMentor objects.
 * Handles:
 *   - Single: "Dr. Ovais Shafiq Qadri"
 *   - Multiple comma-separated: "Dr Ravinder Kumar Duvedi, Dr Bikramjit Sharma"
 *   - Multiple semicolon-separated: "Dr. Anil Arora; Dr. Kulbir Singh"
 *   - Multiple with "and": "Dr. Anil Singh and Dr Manu Bansal"
 */
function parseCoMentors(
  nameStr: string | null,
  emailStr: string | null,
  phoneStr: string | null,
  mentorEmail: string
): CoMentor[] {
  if (!nameStr) return [];

  // Split names by comma, semicolon, or " and "
  const names = nameStr
    .split(/[,;]|\s+and\s+|\s*&\s*/i)
    .map((n) => n.trim())
    .filter(Boolean);

  // Split emails similarly
  const emails = emailStr
    ? emailStr
        .split(/[,;]/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    : [];

  // Split phones similarly
  const phones = phoneStr
    ? phoneStr
        .split(/[,;]/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  const coMentors: CoMentor[] = [];
  for (let i = 0; i < names.length; i++) {
    const email = emails[i] || emails[0] || null; // fallback to first if fewer emails than names
    const phone = phones[i] || null;

    // Skip if co-mentor email === mentor email (data entry error per spec 1.1)
    if (email && email === mentorEmail.toLowerCase()) {
      continue;
    }

    // Skip empty email entries with typos (e.g., "malkee.singh@thapar.edut")
    const cleanEmail =
      email && email.endsWith("@thapar.edu") ? email : null;

    coMentors.push({
      name: names[i],
      email: cleanEmail,
      phone: normalizePhone(phone),
    });
  }

  return coMentors;
}

/* ──────────────── Main Seed Function ──────────────── */

async function seedProjects() {
  console.log("🌱 Starting ELC Summer 2026 project seed...\n");

  // Read seed file
  const seedPath = resolve(process.cwd(), "public/projects_seed.json");
  const raw = readFileSync(seedPath, "utf-8");
  const data = JSON.parse(raw) as { source: string; projects: SeedProject[] };

  const stats = {
    facultyCreated: 0,
    facultyMatched: 0,
    projectsInserted: 0,
    projectsSkipped: 0,
  };

  // Build unique faculty map (dedup by email)
  const facultyMap = new Map<
    string,
    { name: string; phone: string | null; department: string }
  >();

  for (const project of data.projects) {
    if (!project.mentor_email) {
      console.warn(`  ⚠ Project #${project.id} "${project.title}" — missing mentor email, skipping faculty creation`);
      continue;
    }

    const email = project.mentor_email.toLowerCase().trim();
    if (!facultyMap.has(email)) {
      facultyMap.set(email, {
        name: project.mentor_name,
        phone: project.mentor_phone,
        department: DEPT_CODE_MAP[project.department] || project.department,
      });
    }
  }

  console.log(`📧 Found ${facultyMap.size} unique faculty emails\n`);

  // Upsert faculty users and profiles
  const facultyProfileIdMap = new Map<string, string>(); // email → faculty_profile.id
  const facultyUserIdMap = new Map<string, string>(); // email → user.id

  for (const [email, info] of facultyMap.entries()) {
    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    let userId: string;

    if (existing) {
      userId = existing.id;
      stats.facultyMatched++;
      console.log(`  ✓ Matched existing: ${info.name} (${email})`);
    } else {
      // Create new user
      const displayName = cleanName(info.name);
      const newUser = await db
        .insert(users)
        .values({
          email,
          name: displayName,
          role: "faculty",
          status: "active", // Pre-verified from official call
        })
        .returning()
        .get();
      userId = newUser.id;
      stats.facultyCreated++;
      console.log(`  + Created faculty: ${displayName} (${email})`);
    }

    facultyUserIdMap.set(email, userId);

    // Check/create faculty profile
    const existingProfile = await db
      .select()
      .from(facultyProfiles)
      .where(eq(facultyProfiles.userId, userId))
      .get();

    if (existingProfile) {
      // Only update if not manually edited
      if (!existingProfile.isManuallyEdited) {
        await db
          .update(facultyProfiles)
          .set({
            department: info.department,
            phone: normalizePhone(info.phone),
            hasDoctorate: hasDoctorate(info.name),
            seededFrom: "elc_2026_call",
            needsReview: true,
            lastSeededAt: new Date(),
          })
          .where(eq(facultyProfiles.id, existingProfile.id));
      }
      facultyProfileIdMap.set(email, existingProfile.id);
    } else {
      const newProfile = await db
        .insert(facultyProfiles)
        .values({
          userId,
          department: info.department,
          phone: normalizePhone(info.phone),
          hasDoctorate: hasDoctorate(info.name),
          seededFrom: "elc_2026_call",
          needsReview: true,
          lastSeededAt: new Date(),
        })
        .returning()
        .get();
      facultyProfileIdMap.set(email, newProfile.id);
    }
  }

  console.log(
    `\n👥 Faculty: ${stats.facultyCreated} created, ${stats.facultyMatched} matched existing\n`
  );

  // Insert openings
  for (const project of data.projects) {
    if (!project.mentor_email) {
      stats.projectsSkipped++;
      continue;
    }

    const mentorEmail = project.mentor_email.toLowerCase().trim();
    const facultyProfileId = facultyProfileIdMap.get(mentorEmail);

    if (!facultyProfileId) {
      console.warn(`  ⚠ Project #${project.id} — no profile for ${mentorEmail}, skipping`);
      stats.projectsSkipped++;
      continue;
    }

    // Parse co-mentors
    const coMentors = parseCoMentors(
      project.co_mentor_name,
      project.co_mentor_email,
      project.co_mentor_phone,
      mentorEmail
    );

    // Resolve co-mentor user IDs (soft links)
    const coMentorUserIds: string[] = [];
    for (const cm of coMentors) {
      if (cm.email) {
        const cmUserId = facultyUserIdMap.get(cm.email);
        if (cmUserId) {
          coMentorUserIds.push(cmUserId);
        }
      }
    }

    const department =
      DEPT_CODE_MAP[project.department] || project.department;

    await db.insert(openings).values({
      facultyProfileId,
      title: project.title,
      description: project.description && project.description !== "Description not found." ? project.description : project.title,
      department,
      source: "elc_2026_call",
      status: "open",
      needsReview: true,
      coMentors,
      coMentorUserIds,
      engagementType: project.department === "ELC" ? "ELC Activity" : "Internship",
    });

    stats.projectsInserted++;
    console.log(`  📄 #${project.id}: ${project.title.substring(0, 60)}...`);
  }

  console.log(`\n──────────────────────────────────────────`);
  console.log(`📊 Seed Summary:`);
  console.log(`   Faculty created:     ${stats.facultyCreated}`);
  console.log(`   Faculty matched:     ${stats.facultyMatched}`);
  console.log(`   Projects inserted:   ${stats.projectsInserted}`);
  console.log(`   Projects skipped:    ${stats.projectsSkipped}`);
  console.log(`──────────────────────────────────────────\n`);

  console.log("✅ Seed complete!");
  process.exit(0);
}

seedProjects().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
