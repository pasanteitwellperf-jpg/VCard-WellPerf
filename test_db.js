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
async function run() {
  const client = createClient();
  await client.connect();
  const res = await client.query("SELECT * FROM employees WHERE nombre LIKE '%CARLA MARIA%' OR nombre LIKE '%YUMISEBA%'");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run().catch(console.error);
