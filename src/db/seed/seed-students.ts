import { db } from "../index";
import { users } from "../schema/users";
import { studentProfiles } from "../schema/profiles";
import { DEPARTMENTS, RESEARCH_DOMAINS } from "./taxonomy";
import { eq } from "drizzle-orm";

// Helper for random items
const sample = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const sampleMany = <T>(arr: readonly T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const PROGRAMS = ["B.E.", "M.E.", "Ph.D.", "B.Tech", "M.Tech"];
const SKILLS = ["Python", "TensorFlow", "React", "Node.js", "C++", "Java", "Docker", "AWS", "PyTorch", "Next.js", "SQL", "MongoDB"];

const firstNames = ["Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Siddharth", "Rohan", "Krishna", "Dhruv", "Kabir", "Ananya", "Diya", "Aditi", "Isha", "Neha", "Riya", "Sneha", "Kavya", "Meera", "Priya"];
const lastNames = ["Sharma", "Singh", "Patel", "Kumar", "Gupta", "Deshmukh", "Joshi", "Verma", "Reddy", "Yadav", "Chopra", "Malhotra", "Kapoor", "Bhatia", "Mehta"];

async function main() {
  console.log("Seeding dummy students...");

  // Clear existing dummy students to prevent duplicates if run multiple times
  // We identify dummy students by a specific email pattern
  console.log("Cleaning up old dummy students...");
  const oldUsers = await db.select().from(users).all();
  for (const user of oldUsers) {
    if (user.email.endsWith("@dummy.student.thapar.edu")) {
      await db.delete(users).where(eq(users.id, user.id));
    }
  }

  const numStudents = 50;
  
  for (let i = 0; i < numStudents; i++) {
    const firstName = sample(firstNames);
    const lastName = sample(lastNames);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@dummy.student.thapar.edu`;
    const image = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
    
    // Insert User
    const [user] = await db.insert(users).values({
      name,
      email,
      image,
      role: "student",
      emailVerified: new Date(),
    }).returning();

    // Generate random student data
    const batchYear = new Date().getFullYear() + Math.floor(Math.random() * 4);
    const cgpa = (Math.random() * 4 + 6).toFixed(2); // 6.00 to 10.00
    
    await db.insert(studentProfiles).values({
      userId: user.id,
      rollNumber: `102${Math.floor(Math.random() * 90000) + 10000}`,
      batchYear,
      program: sample(PROGRAMS),
      department: sample(DEPARTMENTS),
      currentYear: new Date().getFullYear() > batchYear ? 4 : (batchYear - new Date().getFullYear() + 1),
      cgpa: parseFloat(cgpa),
      bio: `Hi, I am ${name}. I am a passionate student interested in research and development.`,
      openToResearch: Math.random() > 0.2, // 80% open to research
      preferredEngagement: ["In-person", "Remote", "Hybrid"].filter(() => Math.random() > 0.5),
      domains: sampleMany(RESEARCH_DOMAINS, Math.floor(Math.random() * 3) + 1).map(d => d.name),
      technicalStack: sampleMany(SKILLS, Math.floor(Math.random() * 5) + 2),
      visibility: "public",
      onboardingComplete: true,
    });
  }

  console.log(`Successfully seeded ${numStudents} dummy students!`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
