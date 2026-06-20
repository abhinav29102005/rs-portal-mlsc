const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function run() {
  const res = await client.execute("SELECT id, name, email, role FROM users WHERE email = 'asingh3_be24@thapar.edu'");
  console.log("Existing Users:", res.rows);
}

run().catch(console.error);
