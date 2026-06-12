import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Configuración de vCard V3 con retornos de carro estrictos (CRLF) obligatorios para iOS/Android
function generateVCard(profile: any) {
  const vcardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${profile.lastName};${profile.firstName};;;`,
    `FN:${profile.firstName} ${profile.lastName}`,
    `ORG:WELL PERFORATING SERVICES ECUADOR WELLPERF S.A.`,
    `TITLE:${profile.jobTitle}`,
    `TEL;TYPE=WORK,VOICE:${profile.phone}`,
    `EMAIL;TYPE=PREF,INTERNET:${profile.email}`,
    `URL:https://wellperf.com/`,
    `ADR;TYPE=WORK:;;${profile.address};;;;`
  ];

  if (profile.photoBase64) {
    vcardLines.push(`PHOTO;ENCODING=b;TYPE=PNG:${profile.photoBase64}`);
  }

  vcardLines.push('END:VCARD');
  
  return vcardLines.join('\r\n');
}

export async function GET(request: Request, { params }: { params: Promise<{ cedula: string }> }) {
  const resolvedParams = await params;
  const cedula = resolvedParams.cedula.replace('.vcf', '');
  
  // Lectura dinámica para evitar el caché del servidor y garantizar datos frescos
  const filePath = path.join(process.cwd(), 'src/data/employees.json');
  const employeesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const employee = employeesData.find(
    (emp: any) => String(emp.cedula) === String(cedula)
  );

  if (!employee) {
    return new NextResponse('Employee not found', { status: 404 });
  }

  // Dividir nombres y apellidos
  const nameParts = employee.nombre.split(" ");
  // Generalmente en el Excel están como APELLIDO APELLIDO NOMBRE NOMBRE
  const lastName = nameParts.slice(0, 2).join(" ");
  const firstName = nameParts.slice(2).join(" ") || nameParts[0];

  // Formato de Teléfono
  let phone = employee.telefono ? String(employee.telefono).trim() : "";
  if (phone) {
    const isColombian = employee.nombre.includes("ROJAS FUENTES ELBER") || employee.nombre.includes("ROJAS FUENTES EDGAR");
    
    if (isColombian) {
      if (!phone.startsWith("+57")) {
        phone = `+57 ${phone}`;
      }
    } else {
      if (!phone.startsWith("+593")) {
        if (phone.startsWith("0")) phone = phone.substring(1);
        phone = `+593 ${phone}`;
      }
    }
  }

  // Determinar la dirección basada en el área
  const area = (employee.area || "").toLowerCase();
  const areasQuito = ["administrativo", "gerencia", "financiero", "talento humano", "supply chain"];
  const isQuito = areasQuito.some(a => area.includes(a));
  
  const address = isQuito 
    ? "Allure park, Av. de los Shyris y Suecia, 170303 Quito"
    : "Via a nuevo paraiso S/N y NA A 280 metros de la via a Lago Agrio, CAB. Union Chimborazo, 220206 Francisco de Orellana";

  // Intentar cargar la foto
  let photoBase64 = null;
  try {
    const photoPath = path.join(process.cwd(), 'public', 'fotos', `${employee.nombre}.png`);
    if (fs.existsSync(photoPath)) {
      const fileData = fs.readFileSync(photoPath);
      photoBase64 = fileData.toString('base64');
    }
  } catch (e) {
    console.error("No se pudo cargar la foto para", employee.nombre);
  }

  const profileData = {
    firstName,
    lastName,
    jobTitle: employee.cargo || "Empleado",
    phone: phone || "No registrado",
    email: employee.email || "contacto@wellperf.com",
    address: address,
    photoBase64
  };

  const vcardStr = generateVCard(profileData);

  const response = new NextResponse(vcardStr);
  response.headers.set('Content-Type', 'text/vcard; charset=utf-8');
  response.headers.set('Content-Disposition', `inline; filename="${employee.nombre.replace(/\s+/g, '_')}.vcf"`);

  return response;
}
