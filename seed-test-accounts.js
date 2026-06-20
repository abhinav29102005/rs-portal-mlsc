const { createClient } = require("@libsql/client");
const crypto = require("crypto");
require("dotenv").config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function run() {
  const now = Date.now();
  console.log("Promoting asingh3_be24@thapar.edu to admin...");
  await client.execute(`UPDATE users SET role = 'admin', name = 'Abhinav Singh (Admin)' WHERE email = 'asingh3_be24@thapar.edu'`);

  console.log("Creating Test Account 1: asingh2910.official@gmail.com (Faculty)...");
  const facId = crypto.randomUUID();
  await client.execute({
    sql: `INSERT INTO users (id, email, name, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET role = excluded.role`,
    args: [facId, 'asingh2910.official@gmail.com', 'Dr. Abhinav Singh (Faculty)', 'faculty', 'active', now, now]
  });
  
  // Get the actual id in case it already existed
  const facRes = await client.execute(`SELECT id FROM users WHERE email = 'asingh2910.official@gmail.com'`);
  const actualFacId = facRes.rows[0].id;

  // Insert mock faculty profile so they show up in the directory
  const profId = crypto.randomUUID();
  await client.execute({
    sql: `INSERT INTO faculty_profiles (id, user_id, designation, department, bio, h_index, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO NOTHING`,
    args: [profId, actualFacId, 'Assistant Professor', 'CSED', 'This is a test faculty account for mailing integration.', 10, now, now]
  });

  console.log("Creating Test Account 2: test_student@thapar.edu (Student)...");
  const studId = crypto.randomUUID();
  await client.execute({
    sql: `INSERT INTO users (id, email, name, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(email) DO NOTHING`,
    args: [studId, 'test_student@thapar.edu', 'Jane Doe (Student)', 'student', 'active', now, now]
  });

  console.log("Done!");
}

run().catch(console.error);
