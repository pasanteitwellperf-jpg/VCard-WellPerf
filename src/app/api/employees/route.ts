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

    // Actualizar la base de datos Postgres
    // Si tenemos photoUrl la actualizamos, si no, dejamos la que estaba
    if (photoUrl) {
      await sql`
        UPDATE employees 
        SET 
          telefono = ${updatedEmployee.telefono}, 
          email = ${updatedEmployee.email}, 
          cargo = ${updatedEmployee.cargo},
          photo_url = ${photoUrl}
        WHERE cedula = ${updatedEmployee.cedula}
      `;
    } else {
      await sql`
        UPDATE employees 
        SET 
          telefono = ${updatedEmployee.telefono}, 
          email = ${updatedEmployee.email}, 
          cargo = ${updatedEmployee.cargo}
        WHERE cedula = ${updatedEmployee.cedula}
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
