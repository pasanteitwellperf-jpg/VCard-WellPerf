const fs = require('fs');
const { createClient } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

function parseEnv() {
  try {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
  } catch (e) {
    console.error("Could not parse .env.local", e);
  }
}

async function run() {
  parseEnv();
  const client = createClient();
  await client.connect();
  
  // Update password
  const defaultEmail = 'admin@wellperf.com';
  const newPassword = 'W311p3rf_2026!!';
  const hash = await bcrypt.hash(newPassword, 10);
  
  await client.query('UPDATE admins SET password_hash = $1 WHERE email = $2', [hash, defaultEmail]);
  console.log("Password updated successfully.");
  
  // Create meetings table
  await client.query(`
    CREATE TABLE IF NOT EXISTS meetings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("Table 'meetings' created successfully.");
  
  await client.end();
}

run().catch(console.error);
