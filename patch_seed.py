import os

filepath = "src/db/seed/seed-openings.ts"
with open(filepath, "r") as f:
    content = f.read()

target = """        await db.insert(openings).values({
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
        });"""

replacement = """        const isCapstone = Math.random() > 0.8;
        await db.insert(openings).values({
          facultyProfileId: faculty.id,
          title: isCapstone ? "Capstone Project: " + sample(OPENING_TITLES) : sample(OPENING_TITLES),
          description: isCapstone ? "Final year capstone group slot available." : sample(DESCRIPTIONS),
          department: faculty.department,
          prerequisites: sampleMany(PREREQUISITES, Math.floor(Math.random() * 3) + 1),
          compensation: sample(COMPENSATIONS),
          expectedHoursPerWeek: Math.floor(Math.random() * 10) + 5,
          durationMonths: isCapstone ? 6 : Math.floor(Math.random() * 6) + 3,
          positionsAvailable: isCapstone ? 4 : Math.floor(Math.random() * 3) + 1,
          seatsAvailable: isCapstone ? 4 : 1,
          engagementType: isCapstone ? "Capstone Project" : "Research Opportunity",
          status: Math.random() > 0.2 ? "open" : sample(STATUSES),
        });"""

new_content = content.replace(target, replacement)
with open(filepath, "w") as f:
    f.write(new_content)
