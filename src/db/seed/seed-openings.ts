import { db } from "../index";
import { openings } from "../schema/openings";
import { facultyProfiles } from "../schema/profiles";
import { eq } from "drizzle-orm";

const sample = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const sampleMany = <T>(arr: readonly T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const OPENING_TITLES = [
  "Research Assistant in Machine Learning",
  "Undergraduate Researcher for NLP",
  "Computer Vision Intern",
  "Quantum Computing Intern",
  "Data Science Researcher",
  "Blockchain and Web3 Researcher",
  "Robotics and IoT Developer",
  "Software Engineering Research Project",
  "Cybersecurity Vulnerability Researcher",
  "Bioinformatics Algorithm Developer",
];

const DESCRIPTIONS = [
  "We are looking for a highly motivated student to work on our latest research project. You will be responsible for data collection, preprocessing, and model training.",
  "Join our dynamic team to explore the frontiers of this exciting domain. The role involves literature review, writing code, and running experiments.",
  "Seeking an enthusiastic individual with strong programming skills to assist in developing new algorithms and evaluating them on benchmark datasets.",
  "An excellent opportunity for students looking to gain hands-on experience in research. Responsibilities include system design and implementation.",
];

const PREREQUISITES = ["Python", "C++", "Machine Learning", "Data Structures", "Linear Algebra", "Web Development", "Node.js", "React", "Linux"];
const COMPENSATIONS = ["unpaid", "stipend", "course_credit"] as const;
const STATUSES = ["draft", "open", "closed", "archived"] as const;

async function main() {
  console.log("Seeding random openings...");

  console.log("Cleaning up all existing openings...");
  await db.delete(openings);

  const faculties = await db.select().from(facultyProfiles).all();
  if (faculties.length === 0) {
    console.log("No faculty found. Please run the faculty seed script first.");
    return;
  }

  let totalOpenings = 0;

  for (const faculty of faculties) {
    // 70% chance a faculty has 1-3 openings
    if (Math.random() > 0.3) {
      const numOpenings = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numOpenings; i++) {
        await db.insert(openings).values({
          facultyProfileId: faculty.id,
          title: sample(OPENING_TITLES),
          description: sample(DESCRIPTIONS),
          department: faculty.department,
          prerequisites: sampleMany(PREREQUISITES, Math.floor(Math.random() * 3) + 1),
          compensation: sample(COMPENSATIONS),
          expectedHoursPerWeek: Math.floor(Math.random() * 10) + 5, // 5 to 14
          durationMonths: Math.floor(Math.random() * 6) + 3, // 3 to 8
          positionsAvailable: Math.floor(Math.random() * 3) + 1, // 1 to 3
          status: Math.random() > 0.2 ? "open" : sample(STATUSES), // 80% chance of being open
        });
        totalOpenings++;
      }
    }
  }

  console.log(`Successfully seeded ${totalOpenings} openings across ${faculties.length} faculty profiles!`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
