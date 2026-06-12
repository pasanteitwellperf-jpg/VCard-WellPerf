import React from "react";
import AnimatedButton from "@/components/AnimatedButton";
import ProfileImage from "@/components/ProfileImage";
import fs from "fs";
import path from "path";

// Configuración de vCard V3
function generateVCard(profile: any) {
  return `BEGIN:VCARD
VERSION:3.0
N:${profile.fullName.split(" ").reverse().join(";")};;;
FN:${profile.fullName}
ORG:${profile.company}
TITLE:${profile.jobTitle}
TEL;TYPE=WORK,VOICE:${profile.phone}
EMAIL;TYPE=PREF,INTERNET:${profile.email}
URL:${profile.website}
ADR;TYPE=WORK:;;${profile.address};;;;
END:VCARD`;
}

export default async function ProfilePage({ params }: { params: Promise<{ cedula: string }> }) {
  const { cedula } = await params;
  
  // Leemos el archivo siempre en vivo para evitar cachés del servidor y mostrar las actualizaciones al instante
  const filePath = path.join(process.cwd(), 'src/data/employees.json');
  const fileData = fs.readFileSync(filePath, 'utf8');
  const employeesData = JSON.parse(fileData);

  // Buscar el empleado instantáneamente
  const employee = employeesData.find(
    (emp: any) => String(emp.cedula) === String(cedula)
  );

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#e2e8f0]">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No encontrado</h2>
          <p className="text-gray-500">No existe una credencial asociada a la cédula {cedula}.</p>
        </div>
      </div>
    );
  }

  const profileData = {
    fullName: employee.nombre,
    jobTitle: employee.cargo || "Empleado",
    photoUrl: `/fotos/${employee.nombre}.png`,
    address: employee.area || "Oficinas WellPerf",
    phone: employee.telefono || "No registrado",
    email: employee.email || "contacto@wellperf.com",
    cedula: employee.cedula || ""
  };

  return (
    <main className="min-h-screen bg-orange-50 flex items-center justify-center p-4 sm:p-8 font-sans">
      
      {/* Contenedor tipo Credencial/Gafete */}
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col h-[650px] border border-gray-200">
        
        {/* Franja Lateral Izquierda (Naranja WellPerf) */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-[#d35c24] flex items-center justify-center overflow-hidden z-10 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)]">
          <span 
            className="text-white text-3xl font-extrabold tracking-[0.2em] uppercase whitespace-nowrap opacity-90"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {profileData.address}
          </span>
        </div>

        {/* Contenido Derecho de la Credencial */}
        <div className="ml-20 flex-1 flex flex-col items-center justify-between py-10 px-6 relative z-0">
          
          {/* Logo Top Right */}
          <div className="w-full flex justify-end mb-4">
            <img 
              src="/logo_naranja.png" 
              alt="WellPerf Logo" 
              className="h-10 object-contain"
            />
          </div>

          {/* Área de Foto y Nombre */}
          <div className="flex flex-col items-center flex-1 justify-center w-full mt-2">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#d35c24] to-orange-300 blur-md opacity-30 transform translate-y-2"></div>
              <ProfileImage 
                src={profileData.photoUrl} 
                alt={profileData.fullName}
                fallbackName={profileData.fullName}
                className="relative w-40 h-44 object-cover rounded-3xl border-4 border-white shadow-xl bg-white"
              />
            </div>

            <h1 className="text-xl font-black text-gray-800 text-center leading-tight mb-1 line-clamp-2">
              {profileData.fullName}
            </h1>
            <h2 className="text-sm font-bold text-[#d35c24] text-center px-4 py-1 bg-orange-50 rounded-full mb-4">
              {profileData.jobTitle}
            </h2>
            
            {/* Información Extra */}
            <div className="w-full space-y-2 text-center text-xs text-gray-500 font-medium bg-slate-50 rounded-xl p-3 border border-slate-100">
              {profileData.phone !== "No registrado" && <p>📞 {profileData.phone}</p>}
              {profileData.email !== "contacto@wellperf.com" && profileData.email && <p>✉️ {profileData.email}</p>}
              {profileData.cedula && <p>🆔 {profileData.cedula}</p>}
            </div>
          </div>

          {/* Botón Animado Guardar Contacto usando API real para garantizar descarga en celulares */}
          <div className="w-full mt-6">
            <AnimatedButton href={`/api/vcard/${cedula}.vcf`} />
            <p className="text-center text-[10px] text-gray-400 mt-4 font-semibold uppercase tracking-wider">
              {new Date().toISOString().split('T')[0]}
            </p>
          </div>

        </div>
      </div>
      
    </main>
  );
}
