/**
 * TIET Email Parsing Utilities
 *
 * Student email pattern: <username>_<program><year>@thapar.edu
 * Examples: asingh3_be24@thapar.edu, rkumar_mtech24@thapar.edu
 *
 * Faculty email pattern: firstname.lastname@thapar.edu
 * or h<deptcode>@thapar.edu for department heads
 */

const STUDENT_EMAIL_REGEX = /^[a-z0-9]+_[a-z]{2,4}\d{2}@thapar\.edu$/;
const THAPAR_DOMAIN = "@thapar.edu";

/** Program code → department mapping based on TIET structure */
const PROGRAM_DEPARTMENT_MAP: Record<string, string> = {
  be: "Computer Science & Engineering",
  bce: "Chemical Engineering",
  bme: "Mechanical Engineering",
  bee: "Electrical Engineering",
  bec: "Electronics & Communication Engineering",
  bei: "Electrical & Instrumentation Engineering",
  bci: "Civil Engineering",
  bbt: "Biotechnology",
  bcs: "Computer Science",
  bai: "Artificial Intelligence & Data Science",
  mtech: "Postgraduate Program",
  msc: "Postgraduate Program",
  mba: "School of Management",
  phd: "Doctoral Program",
};

/** Program code → full program name */
const PROGRAM_NAME_MAP: Record<string, string> = {
  be: "BE",
  bce: "BE Chemical",
  bme: "BE Mechanical",
  bee: "BE Electrical",
  bec: "BE ECE",
  bei: "BE EIC",
  bci: "BE Civil",
  bbt: "BE Biotechnology",
  bcs: "BE Computer Science",
  bai: "BE AI & DS",
  mtech: "M.Tech",
  msc: "M.Sc",
  mba: "MBA",
  phd: "PhD",
};

export interface ParsedStudentEmail {
  username: string;
  programCode: string;
  batchYear: number;
  program: string;
  department: string;
  rollNumber: string;
  currentYear: number;
}

const ALUMNI_DOMAIN = "@alumni.thapar.edu";

/**
 * Check if an email belongs to the thapar.edu or alumni.thapar.edu domain
 */
export function isThaparEmail(email: string): boolean {
  const lower = email.toLowerCase();
  return lower.endsWith(THAPAR_DOMAIN) || lower.endsWith(ALUMNI_DOMAIN);
}

/**
 * Check if an email belongs to the alumni domain
 */
export function isAlumniEmail(email: string): boolean {
  return email.toLowerCase().endsWith(ALUMNI_DOMAIN);
}

/**
 * Check if an email matches the student pattern
 */
export function isStudentEmail(email: string): boolean {
  if (isAlumniEmail(email)) return false;
  return STUDENT_EMAIL_REGEX.test(email.toLowerCase());
}

/**
 * Parse a student email into structured data
 */
export function parseStudentEmail(email: string): ParsedStudentEmail | null {
  const lower = email.toLowerCase();
  if (!STUDENT_EMAIL_REGEX.test(lower) || isAlumniEmail(lower)) return null;

  const localPart = lower.split("@")[0]; // e.g., "asingh3_be24"
  const underscoreIdx = localPart.lastIndexOf("_");
  const username = localPart.substring(0, underscoreIdx); // "asingh3"
  const suffix = localPart.substring(underscoreIdx + 1); // "be24"

  // Extract program code and year from suffix
  const yearMatch = suffix.match(/(\d{2})$/);
  if (!yearMatch) return null;

  const yearStr = yearMatch[1]; // "24"
  const programCode = suffix.substring(0, suffix.length - 2); // "be"
  const batchYear = 2000 + parseInt(yearStr); // 2024

  // Compute current year of study
  const now = new Date();
  const currentAcademicYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const yearsCompleted = currentAcademicYear - batchYear;
  const currentYear = Math.max(1, Math.min(yearsCompleted + 1, 5));

  const program = PROGRAM_NAME_MAP[programCode] || programCode.toUpperCase();
  const department =
    PROGRAM_DEPARTMENT_MAP[programCode] || "Unknown Department";

  return {
    username,
    programCode,
    batchYear,
    program,
    department,
    rollNumber: username,
    currentYear,
  };
}

/**
 * Detect role from email: student, faculty, alumni_mentor, or null (non-thapar)
 */
export function detectRole(
  email: string
): "student" | "faculty" | "alumni_mentor" | null {
  if (!isThaparEmail(email)) return null;
  if (isAlumniEmail(email)) return "alumni_mentor";
  return isStudentEmail(email) ? "student" : "faculty";
}

/**
 * Get current semester string for throttling (e.g., "2026-1" for Jan-Jun, "2026-2" for Jul-Dec)
 */
export function getCurrentSemester(): string {
  const now = new Date();
  const half = now.getMonth() < 6 ? 1 : 2;
  return `${now.getFullYear()}-${half}`;
}

