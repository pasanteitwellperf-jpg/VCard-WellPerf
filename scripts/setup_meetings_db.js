const { createClient } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function setup() {
  const client = createClient();
  await client.connect();
  
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

setup().catch(console.error);
