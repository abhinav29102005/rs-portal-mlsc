const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function run() {
  const res = await client.execute("SELECT image FROM users WHERE role = 'faculty' AND image LIKE '%thapar.edu%' LIMIT 10");
  console.log("Example URLs:", res.rows.map(r => r.image));
}

run().catch(console.error);
