import { db } from "@/db";
import { studentProfiles } from "@/db/schema/profiles";
import { eq } from "drizzle-orm";

export interface AcademicCourse {
  code: string;
  name: string;
  credits: number;
  grade?: string;
}

export interface AcademicRecord {
  cgpa: number | null;
  attendance: number | null;
  enrolledCourses: AcademicCourse[] | null;
}

export interface UimsAdapter {
  /**
   * Fetch a student's academic record from the university system
   * @param rollNumber The student's roll number (e.g. "1024030440")
   */
  getStudentAcademicRecord(rollNumber: string): Promise<AcademicRecord | null>;
}

/**
 * Manual Entry Adapter
 *
 * This adapter is used as a fallback before the official UIMS API integration
 * is complete. It relies on the manual CGPA entry from the student's profile.
 * Courses and attendance are currently unsupported in manual mode.
 */
export class ManualEntryAdapter implements UimsAdapter {
  async getStudentAcademicRecord(
    rollNumber: string
  ): Promise<AcademicRecord | null> {
    try {
      const profile = await db
        .select({ cgpa: studentProfiles.cgpa })
        .from(studentProfiles)
        .where(eq(studentProfiles.rollNumber, rollNumber))
        .get();

      if (!profile) {
        return null;
      }

      return {
        cgpa: profile.cgpa,
        attendance: null,
        enrolledCourses: null,
      };
    } catch (error) {
      console.error("ManualEntryAdapter error:", error);
      return null;
    }
  }
}

// Export a singleton instance of the active adapter
export const uimsClient = new ManualEntryAdapter();
