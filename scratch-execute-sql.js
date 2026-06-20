const { createClient } = require("@libsql/client");
const fs = require("fs");
require("dotenv").config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const sql = fs.readFileSync("create_all_faculty.sql", "utf-8");
const statements = sql.split(";\n").filter(s => s.trim().length > 0);

async function run() {
  let count = 0;
  for (let s of statements) {
    try {
      const res = await client.execute(s + ";");
      if (res.rowsAffected > 0) count++;
    } catch (e) {
      console.error("Error executing:", s.substring(0, 50), e.message);
    }
  }
  console.log(`Executed. Inserted records/rows: ${count}`);
}

run().catch(console.error);
