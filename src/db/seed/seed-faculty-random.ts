import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";

import { facultyProfiles, facultyCurrentProjects } from "../schema/profiles";

const client = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const MODES: Array<"in_person" | "online"> = ["in_person", "online"];
const LOCATIONS = ["Room 101, C-Block", "Virtual (Teams)", "Room 205, G-Block", "Faculty Lounge"];

const PROJECT_PREFIXES = [
  "Advanced", "Intelligent", "Automated", "Next-Generation", 
  "Distributed", "Secure", "Optimized", "Scalable", "Real-Time"
];
const PROJECT_TOPICS = [
  "Machine Learning Models", "Cloud Infrastructure", "Blockchain Protocols",
  "IoT Sensor Networks", "Natural Language Processing Systems", "Computer Vision Algorithms",
  "Data Analytics Pipelines", "Cybersecurity Frameworks", "Robotics Navigation"
];
const PROJECT_APPLICATIONS = [
  "for Healthcare Diagnostics", "in Smart Cities", "for Autonomous Vehicles",
  "in Precision Agriculture", "for Financial Forecasting", "in Supply Chain Management"
];

function generateRandomProjects(count: number, facultyId: string): Array<{ facultyProfileId: string; title: string; description: string; status: "active" | "completed" | "seeking_students" }> {
  const projects = [];
  for (let i = 0; i < count; i++) {
    const prefix = PROJECT_PREFIXES[Math.floor(Math.random() * PROJECT_PREFIXES.length)];
    const topic = PROJECT_TOPICS[Math.floor(Math.random() * PROJECT_TOPICS.length)];
    const application = PROJECT_APPLICATIONS[Math.floor(Math.random() * PROJECT_APPLICATIONS.length)];
    const title = `${prefix} ${topic} ${application}`;
    
    const descriptions = [
      `This project focuses on the development and evaluation of ${topic.toLowerCase()} to address key challenges ${application.toLowerCase()}.`,
      `An exploratory research initiative investigating how ${prefix.toLowerCase()} methodologies can improve ${topic.toLowerCase()}.`,
      `We aim to build a robust framework leveraging ${topic.toLowerCase()} with a primary focus on real-world implementations ${application.toLowerCase()}.`
    ];
    
    projects.push({
      facultyProfileId: facultyId,
      title,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      status: Math.random() > 0.3 ? "active" : "seeking_students",
    } as const);
  }
  return projects as any;
}

async function seedRandomFacultyData() {
  console.log("🌱 Starting realistic data seed for all faculty...");
  
  const allFaculty = await db.select({ id: facultyProfiles.id }).from(facultyProfiles).all();
  console.log(`Found ${allFaculty.length} faculty profiles.`);

  let totalProjects = 0;

  for (const faculty of allFaculty) {
    // 1. Generate Timetable (Office Hours)
    const numSlots = Math.floor(Math.random() * 3) + 1; // 1 to 3 slots
    const slots = [];
    const shuffledDays = [...DAYS].sort(() => 0.5 - Math.random());
    const selectedDays = shuffledDays.slice(0, numSlots);

    for (const day of selectedDays) {
      const startH = Math.floor(Math.random() * (15 - 9 + 1)) + 9;
      const endH = startH + 1;
      const startTime = `${startH.toString().padStart(2, "0")}:00`;
      const endTime = `${endH.toString().padStart(2, "0")}:00`;
      const mode = MODES[Math.floor(Math.random() * MODES.length)];
      const location = mode === "online" ? "Virtual (Teams)" : LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

      slots.push({ day, startTime, endTime, mode, location });
    }

    // 2. Generate Random Projects
    const numProjects = Math.floor(Math.random() * 3) + 1; // 1 to 3 projects
    const projects = generateRandomProjects(numProjects, faculty.id);
    
    // Clear existing projects for this faculty to ensure clean state
    await db.delete(facultyCurrentProjects).where(eq(facultyCurrentProjects.facultyProfileId, faculty.id));
    
    // Insert new projects
    for (const p of projects) {
      await db.insert(facultyCurrentProjects).values({
        facultyProfileId: p.facultyProfileId,
        title: p.title,
        description: p.description,
        status: p.status,
      });
      totalProjects++;
    }

    // Update office hours in profile
    await db.update(facultyProfiles)
      .set({ officeHours: slots as any })
      .where(eq(facultyProfiles.id, faculty.id));
  }
  
  console.log(`✅ Successfully seeded office hours for ${allFaculty.length} faculty.`);
  console.log(`✅ Successfully seeded ${totalProjects} active projects.`);
  process.exit(0);
}

seedRandomFacultyData().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
