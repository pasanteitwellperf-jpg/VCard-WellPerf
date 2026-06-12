const fs = require('fs');
const path = require('path');

// Cargar variables de entorno manualmente desde .env.local
try {
  const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
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
  console.log("No se pudo cargar .env.local, usando variables de entorno del sistema");
}
const { put } = require('@vercel/blob');
const { createClient } = require('@vercel/postgres');

async function seed() {
  const client = createClient();
  await client.connect();

  console.log("Creando tabla employees...");
  await client.sql`
    CREATE TABLE IF NOT EXISTS employees (
      cedula VARCHAR(20) PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      area VARCHAR(255),
      cargo VARCHAR(255),
      telefono VARCHAR(50),
      email VARCHAR(255),
      item VARCHAR(20),
      photo_url TEXT
    );
  `;
  console.log("Tabla creada.");

  const jsonPath = path.join(__dirname, '..', 'src', 'data', 'employees.json');
  const employees = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const fotosDir = path.join(__dirname, '..', 'public', 'fotos');

  for (const emp of employees) {
    if (!emp.cedula || emp.cedula === 'nan') continue;

    console.log(`Procesando ${emp.nombre}...`);
    
    let blobUrl = null;
    const fotoPath = path.join(fotosDir, `${emp.nombre}.png`);
    if (fs.existsSync(fotoPath)) {
      try {
        const fileData = fs.readFileSync(fotoPath);
        // Subir a Blob
        console.log(`Subiendo foto de ${emp.nombre} a Vercel Blob...`);
        const blob = await put(`fotos/${emp.nombre}.png`, fileData, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        blobUrl = blob.url;
      } catch (err) {
        console.error(`Error subiendo foto de ${emp.nombre}:`, err.message);
      }
    }

    // Upsert a Postgres
    try {
      await client.query(`
        INSERT INTO employees (cedula, nombre, area, cargo, telefono, email, item, photo_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (cedula) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          area = EXCLUDED.area,
          cargo = EXCLUDED.cargo,
          telefono = EXCLUDED.telefono,
          email = EXCLUDED.email,
          item = EXCLUDED.item,
          photo_url = EXCLUDED.photo_url
      `, [
        emp.cedula,
        emp.nombre,
        emp.area,
        emp.cargo,
        emp.telefono,
        emp.email,
        emp.item,
        blobUrl
      ]);
    } catch (err) {
      console.error(`Error insertando a ${emp.nombre} en BD:`, err.message);
    }
  }

  console.log("Completado!");
  await client.end();
}

seed().catch(console.error);
