import { config } from "dotenv";
config({ path: ".env.local" }); // Ensure env is loaded first

import { db } from "./src/db";
import { users } from "./src/db/schema/users";
import { eq } from "drizzle-orm";
import * as cheerio from "cheerio";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function run() {
  console.log("Fetching csed.thapar.edu/faculty...");
  const res = await fetch("https://csed.thapar.edu/faculty", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log("Parsing images...");
  const facultyImages: { name: string; url: string }[] = [];

  $("img").each((_, el) => {
    const src = $(el).attr("src");
    if (src && src.includes("microfaculty")) {
      const parentBox = $(el).closest(".faculty-box");
      if (parentBox.length) {
        const nameNode = parentBox.find(".faculty-design strong").first();
        if (nameNode.length) {
          const rawName = nameNode.text().trim();
          const cleanName = rawName.replace(/(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)/gi, "").trim();
          const fullUrl = src.startsWith("http") ? src : `https://csed.thapar.edu${src}`;
          facultyImages.push({ name: cleanName, url: fullUrl });
        }
      }
    }
  });

  console.log(`Found ${facultyImages.length} faculty images from website.`);

  const dbUsers = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.role, "faculty")).all();
  
  let matchCount = 0;

  for (const dbUser of dbUsers) {
    if (!dbUser.name) continue;
    const cleanDbName = dbUser.name.replace(/(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)/gi, "").trim().toLowerCase();
    
    const match = facultyImages.find(f => {
      const cleanScrapedName = f.name.toLowerCase();
      // Partial match
      return cleanScrapedName.includes(cleanDbName) || cleanDbName.includes(cleanScrapedName);
    });

    if (match) {
      console.log(`Matching DB: ${dbUser.name} -> Scraped: ${match.name} [${match.url}]`);
      await db.update(users).set({ image: match.url }).where(eq(users.id, dbUser.id));
      matchCount++;
    }
  }

  console.log(`Successfully updated ${matchCount} faculty images in the database.`);
  process.exit(0);
}

run().catch(console.error);
