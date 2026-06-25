const fs = require('fs');
const { createClient } = require('@vercel/postgres');

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

async function setup() {
  parseEnv();
  const client = createClient();
  await client.connect();
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS attendance_signatures (
      id SERIAL PRIMARY KEY,
      sharepoint_id VARCHAR(255) NOT NULL,
      cedula VARCHAR(255) NOT NULL,
      blob_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log("Table 'attendance_signatures' created successfully.");
  await client.end();
}

setup().catch(console.error);
