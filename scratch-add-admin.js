const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function run() {
  const email = "ojain_be24@thapar.edu";
  
  // Check if user exists
  const res = await client.execute({
    sql: "SELECT * FROM users WHERE email = ?",
    args: [email]
  });

  if (res.rows.length > 0) {
    // Update existing user
    await client.execute({
      sql: "UPDATE users SET role = 'admin', status = 'active' WHERE email = ?",
      args: [email]
    });
    console.log(`Updated existing user ${email} to admin.`);
  } else {
    // Create new user. Generate a random UUID
    const id = crypto.randomUUID();
    await client.execute({
      sql: "INSERT INTO users (id, name, email, role, status, emailVerified) VALUES (?, ?, ?, ?, ?, ?)",
      args: [id, "Ojas Jain (Admin)", email, "admin", "active", new Date().toISOString()]
    });
    console.log(`Created new admin user ${email}.`);
  }
}

run().catch(console.error);
