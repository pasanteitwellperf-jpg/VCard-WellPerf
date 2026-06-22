import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const updatedEmployee = await request.json();
    let photoUrl = null;

    // Si viene una nueva foto en base64, subirla a Vercel Blob
    if (updatedEmployee.photoBase64) {
      try {
        const base64Data = updatedEmployee.photoBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        
        const blob = await put(`fotos/${updatedEmployee.nombre}.png`, buffer, {
          access: 'public',
          contentType: 'image/png'
        });
        photoUrl = blob.url;
      } catch (err) {
        console.error("Error al subir foto a Vercel Blob:", err);
      }
    }

    // Actualizar o Insertar la base de datos Postgres (UPSERT)
    if (photoUrl) {
      await sql`
        INSERT INTO employees (cedula, nombre, area, cargo, telefono, email, photo_url)
        VALUES (${updatedEmployee.cedula}, ${updatedEmployee.nombre}, ${updatedEmployee.area}, ${updatedEmployee.cargo}, ${updatedEmployee.telefono}, ${updatedEmployee.email}, ${photoUrl})
        ON CONFLICT (cedula) DO UPDATE SET 
          nombre = EXCLUDED.nombre,
          area = EXCLUDED.area,
          cargo = EXCLUDED.cargo,
          telefono = EXCLUDED.telefono,
          email = EXCLUDED.email,
          photo_url = EXCLUDED.photo_url
      `;
    } else {
      await sql`
        INSERT INTO employees (cedula, nombre, area, cargo, telefono, email)
        VALUES (${updatedEmployee.cedula}, ${updatedEmployee.nombre}, ${updatedEmployee.area}, ${updatedEmployee.cargo}, ${updatedEmployee.telefono}, ${updatedEmployee.email})
        ON CONFLICT (cedula) DO UPDATE SET 
          nombre = EXCLUDED.nombre,
          area = EXCLUDED.area,
          cargo = EXCLUDED.cargo,
          telefono = EXCLUDED.telefono,
          email = EXCLUDED.email
      `;
    }

    return NextResponse.json({ success: true, message: 'Empleado actualizado en Vercel DB' });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Obtener todos los empleados de Postgres para el panel de administración
    const { rows } = await sql`SELECT * FROM employees ORDER BY nombre ASC`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { cedula } = await request.json();
    if (!cedula) {
      return NextResponse.json({ success: false, message: 'Cédula es requerida' }, { status: 400 });
    }

    await sql`DELETE FROM employees WHERE cedula = ${cedula}`;

    return NextResponse.json({ success: true, message: 'Empleado eliminado' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
