import { db } from "../index";
import { facultyProfiles } from "../schema/profiles";
import { eq } from "drizzle-orm";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const MODES = ["in_person", "online"];
const LOCATIONS = ["Room 101, C-Block", "Virtual (Teams)", "Room 205, G-Block", "Faculty Lounge"];

// Helper to generate a random time between 09:00 and 16:00
function getRandomTime() {
  const hour = Math.floor(Math.random() * (16 - 9 + 1)) + 9;
  return `${hour.toString().padStart(2, "0")}:00`;
}

async function seedFakeOfficeHours() {
  console.log("Seeding fake office hours for all faculty...");
  
  const allFaculty = await db.select({ id: facultyProfiles.id }).from(facultyProfiles).all();
  console.log(`Found ${allFaculty.length} faculty profiles.`);

  for (const faculty of allFaculty) {
    const numSlots = Math.floor(Math.random() * 3) + 1; // 1 to 3 slots
    const slots = [];
    
    // Pick random distinct days
    const shuffledDays = [...DAYS].sort(() => 0.5 - Math.random());
    const selectedDays = shuffledDays.slice(0, numSlots);

    for (const day of selectedDays) {
      const startH = Math.floor(Math.random() * (15 - 9 + 1)) + 9;
      const endH = startH + 1;
      
      const startTime = `${startH.toString().padStart(2, "0")}:00`;
      const endTime = `${endH.toString().padStart(2, "0")}:00`;
      
      const mode = MODES[Math.floor(Math.random() * MODES.length)];
      const location = mode === "online" ? "Virtual (Teams)" : LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

      slots.push({
        day,
        startTime,
        endTime,
        mode,
        location,
      });
    }

    // Since we're trying to make sure some are "available now" for testing:
    // Let's add a slot specifically for the CURRENT time for 30% of the faculty.
    if (Math.random() < 0.3) {
      const now = new Date();
      const currentDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];
      
      if (DAYS.includes(currentDay)) {
        const startH = now.getHours();
        const endH = startH + 1;
        slots.push({
          day: currentDay,
          startTime: `${startH.toString().padStart(2, "0")}:00`,
          endTime: `${endH.toString().padStart(2, "0")}:00`,
          mode: "online",
          location: "Zoom",
        });
      }
    }

    await db.update(facultyProfiles)
      .set({ officeHours: slots as any })
      .where(eq(facultyProfiles.id, faculty.id));
  }
  
  console.log("Successfully seeded fake office hours!");
  process.exit(0);
}

seedFakeOfficeHours().catch(console.error);
