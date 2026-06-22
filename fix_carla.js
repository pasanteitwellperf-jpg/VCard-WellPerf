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
  
  // Borrar los duplicados erroneos que no tienen foto
  await client.query("DELETE FROM employees WHERE cedula = '0704935338' OR cedula = '0604935338'");
  
  // Actualizar la cédula del original que sí tiene foto para agregarle el cero
  await client.query("UPDATE employees SET cedula = '0604935338' WHERE cedula = '604935338'");
  
  console.log("Duplicados eliminados y cédula corregida.");
  await client.end();
}
run().catch(console.error);
