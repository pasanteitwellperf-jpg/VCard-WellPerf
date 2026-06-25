const fs = require('fs');
const path = require('path');
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
} catch (e) {}

const { createClient } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

async function setup() {
  const client = createClient();
  await client.connect();
  
  // Create table
  await client.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log("Table 'admins' created or already exists.");

  // Insert a default admin for testing
  const defaultEmail = 'admin@wellperf.com';
  const defaultPassword = 'admin';
  const hash = await bcrypt.hash(defaultPassword, 10);
  
  try {
    await client.query(
      'INSERT INTO admins (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
      [defaultEmail, hash]
    );
    console.log("Default admin created: admin@wellperf.com / admin");
  } catch(e) {
    console.log("Could not insert default admin:", e);
  }

  await client.end();
}

setup().catch(console.error);
