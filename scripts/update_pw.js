const { createClient } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function update() {
  const client = createClient();
  await client.connect();
  
  const defaultEmail = 'admin@wellperf.com';
  const newPassword = 'W311p3rf_2026!!';
  const hash = await bcrypt.hash(newPassword, 10);
  
  await client.query('UPDATE admins SET password_hash = $1 WHERE email = $2', [hash, defaultEmail]);
  
  console.log("Password updated successfully.");
  await client.end();
}

update().catch(console.error);
