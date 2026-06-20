import { db } from "@/db";
import { studentProfiles, facultyProfiles } from "@/db/schema/profiles";
import {
  studentSkills,
  studentResearchDomains,
  facultyResearchDomains,
} from "@/db/schema/taxonomy";
import { eq, inArray } from "drizzle-orm";

/* ──────────────── Types ──────────────── */

export interface ScoredMatch<T> {
  item: T;
  score: number;
  matchReasons: string[];
}

// Minimal interfaces for scoring
interface StudentData {
  profile: any;
  skills: string[];
  domains: string[];
}

interface OpeningData {
  id: string;
  department: string | null;
  prerequisites: string[] | null;
  // Extracted from opening text or linked faculty
  domains: string[];
}

interface FacultyData {
  profile: any;
  domains: string[];
}

/* ──────────────── Constants ──────────────── */

const WEIGHTS = {
  DOMAIN_MATCH: 40, // Points per matching research domain
  SKILL_MATCH: 15, // Points per matching skill (for openings)
  DEPARTMENT_MATCH: 20, // Points if student and opening/faculty are in same dept
  CGPA_BONUS: 10, // Points if CGPA > 8.5
};

/* ──────────────── Utility Functions ──────────────── */

/**
 * Normalizes a string for matching (lowercase, alphanumeric only)
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Computes overlap score between two arrays of strings
 */
function computeOverlapScore(
  arr1: string[],
  arr2: string[],
  weight: number
): { score: number; matches: string[] } {
  const norm1 = arr1.map(normalize);
  const norm2 = arr2.map(normalize);

  let score = 0;
  const matches: string[] = [];

  for (let i = 0; i < norm1.length; i++) {
    if (norm2.includes(norm1[i])) {
      score += weight;
      matches.push(arr1[i]); // Keep original casing
    }
  }

  return { score, matches };
}

/* ──────────────── Recommendation Engine ──────────────── */

/**
 * Recommend openings to a specific student based on their profile, domains, and skills
 */
export async function recommendOpeningsForStudent(
  userId: string,
  openings: OpeningData[] // Pass active openings fetched from DB
): Promise<ScoredMatch<OpeningData>[]> {
  // 1. Fetch student data
  const profile = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, userId))
    .get();

  if (!profile) return [];

  const studentSkillsData = await db
    .select()
    .from(studentSkills)
    .where(eq(studentSkills.studentProfileId, profile.id))
    .all();
  const sSkills = studentSkillsData.map((s) => s.skillId); // Assuming skillId holds the skill string or taxonomy ID

  const studentDomainsData = await db
    .select()
    .from(studentResearchDomains)
    .where(eq(studentResearchDomains.studentProfileId, profile.id))
    .all();
  const sDomains = studentDomainsData.map((d) => d.researchDomainId);

  const studentData: StudentData = {
    profile,
    skills: sSkills,
    domains: sDomains,
  };

  // 2. Score openings
  const scoredOpenings: ScoredMatch<OpeningData>[] = [];

  for (const opening of openings) {
    let score = 0;
    const reasons: string[] = [];

    // Domain Match
    const domainMatch = computeOverlapScore(
      studentData.domains,
      opening.domains,
      WEIGHTS.DOMAIN_MATCH
    );
    if (domainMatch.score > 0) {
      score += domainMatch.score;
      reasons.push(
        `Matches your interests: ${domainMatch.matches.join(", ")}`
      );
    }

    // Skill Match (prerequisites)
    if (opening.prerequisites && opening.prerequisites.length > 0) {
      const skillMatch = computeOverlapScore(
        studentData.skills,
        opening.prerequisites,
        WEIGHTS.SKILL_MATCH
      );
      if (skillMatch.score > 0) {
        score += skillMatch.score;
        reasons.push(`You have ${skillMatch.matches.length} requested skills`);
      }
    }

    // Department Match
    if (
      opening.department &&
      studentData.profile.department &&
      normalize(opening.department) === normalize(studentData.profile.department)
    ) {
      score += WEIGHTS.DEPARTMENT_MATCH;
      reasons.push("In your department");
    }

    // Only suggest if there is SOME relevance
    if (score > 0) {
      scoredOpenings.push({ item: opening, score, matchReasons: reasons });
    }
  }

  // 3. Sort by score descending
  return scoredOpenings.sort((a, b) => b.score - a.score);
}

/**
 * Recommend students to a specific faculty based on faculty's research domains
 */
export async function recommendStudentsForFaculty(
  userId: string,
  students: { userId: string; name: string; department: string | null }[] // Pool of potential students (e.g. recent active)
): Promise<ScoredMatch<any>[]> {
  // 1. Fetch faculty data
  const profile = await db
    .select()
    .from(facultyProfiles)
    .where(eq(facultyProfiles.userId, userId))
    .get();

  if (!profile) return [];

  const facultyDomainsData = await db
    .select()
    .from(facultyResearchDomains)
    .where(eq(facultyResearchDomains.facultyProfileId, profile.id))
    .all();
  const fDomains = facultyDomainsData.map((d) => d.researchDomainId);

  // 2. Fetch data for all student candidates (bulk query for efficiency)
  const studentIds = students.map((s) => s.userId);
  if (studentIds.length === 0) return [];

  const allStudentProfiles = await db
    .select()
    .from(studentProfiles)
    .where(inArray(studentProfiles.userId, studentIds))
    .all();

  const profileIds = allStudentProfiles.map((p) => p.id);

  let allStudentDomains: any[] = [];
  if (profileIds.length > 0) {
    allStudentDomains = await db
      .select()
      .from(studentResearchDomains)
      .where(inArray(studentResearchDomains.studentProfileId, profileIds))
      .all();
  }

  // 3. Score students
  const scoredStudents: ScoredMatch<any>[] = [];

  for (const student of students) {
    let score = 0;
    const reasons: string[] = [];

    const sProfile = allStudentProfiles.find(
      (p) => p.userId === student.userId
    );

    const sDomains = sProfile 
      ? allStudentDomains
          .filter((d) => d.studentProfileId === sProfile.id)
          .map((d) => d.researchDomainId)
      : [];

    // Domain Match
    const domainMatch = computeOverlapScore(
      fDomains,
      sDomains,
      WEIGHTS.DOMAIN_MATCH
    );
    if (domainMatch.score > 0) {
      score += domainMatch.score;
      reasons.push(
        `Shares research interests: ${domainMatch.matches.join(", ")}`
      );
    }

    // Department Match
    if (
      student.department &&
      profile.department &&
      normalize(student.department) === normalize(profile.department)
    ) {
      score += WEIGHTS.DEPARTMENT_MATCH;
      reasons.push("In your department");
    }

    // High CGPA Bonus
    if (sProfile?.cgpa && sProfile.cgpa >= 8.5) {
      score += WEIGHTS.CGPA_BONUS;
      reasons.push("High Academic Standing (CGPA > 8.5)");
    }

    // Only suggest if there is SOME relevance
    if (score > 0) {
      scoredStudents.push({ item: student, score, matchReasons: reasons });
    }
  }

  // 4. Sort by score descending
  return scoredStudents.sort((a, b) => b.score - a.score);
}
