import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const updatedEmployee = await request.json();
    
    // Path to the JSON file
    const filePath = path.join(process.cwd(), 'src/data/employees.json');
    
    // Read the current file
    const fileData = fs.readFileSync(filePath, 'utf8');
    const employees = JSON.parse(fileData);
    
    // Find and update the employee
    const index = employees.findIndex((emp: any) => emp.cedula === updatedEmployee.cedula || emp.item === updatedEmployee.item);
    
    if (index !== -1) {
      // Manejar la actualización de foto si viene en base64
      if (updatedEmployee.photoBase64) {
        try {
          const photoPath = path.join(process.cwd(), 'public', 'fotos', `${updatedEmployee.nombre || employees[index].nombre}.png`);
          const base64Data = updatedEmployee.photoBase64.replace(/^data:image\/\w+;base64,/, "");
          fs.writeFileSync(photoPath, base64Data, 'base64');
        } catch (err) {
          console.error("Error saving photo:", err);
        }
        delete updatedEmployee.photoBase64; // No guardamos el base64 en el JSON
      }

      employees[index] = { ...employees[index], ...updatedEmployee };
      
      // Write back to the file
      fs.writeFileSync(filePath, JSON.stringify(employees, null, 2), 'utf8');
      
      return NextResponse.json({ success: true, message: 'Empleado actualizado correctamente' });
    } else {
      return NextResponse.json({ success: false, message: 'Empleado no encontrado' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
