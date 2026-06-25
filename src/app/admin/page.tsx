"use client";

import Link from 'next/link';
import { Contact, ClipboardCheck, ArrowRight, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminHub() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'admin_token=; Max-Age=0; path=/';
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200 rounded-full blur-[100px] opacity-40 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-300 rounded-full blur-[100px] opacity-30 mix-blend-multiply pointer-events-none"></div>

      {/* Navbar Superior */}
      <nav className="w-full bg-white/70 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <img src="/logo_naranja.png" alt="WellPerf" className="h-8 object-contain" />
          <span className="font-extrabold text-gray-800 text-lg tracking-tight">Admin Hub</span>
        </div>
        <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 flex items-center gap-2 text-sm font-semibold transition-colors">
          <LogOut size={16} /> Cerrar Sesión
        </button>
      </nav>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Panel de <span style={{ color: '#D35C24' }}>Control Integrado</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto font-medium">
            Selecciona el módulo que deseas administrar en la plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
          {/* Módulo VCards */}
          <Link href="/admin/vcards" className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-orange-200/50 border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-orange-100 text-[#D35C24] rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Contact size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-[#D35C24] transition-colors">Gestión de VCards</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Administra las credenciales digitales de los empleados, genera sus perfiles y descarga los códigos QR para identificación.
              </p>
            </div>
            <div className="relative z-10 flex items-center text-[#D35C24] font-bold gap-2 group-hover:gap-4 transition-all mt-auto">
              Ingresar al Módulo <ArrowRight size={18} />
            </div>
          </Link>

          {/* Módulo Asistencia */}
          <Link href="/admin/asistencia" className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-orange-200/50 border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-orange-100 text-[#D35C24] rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <ClipboardCheck size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-[#D35C24] transition-colors">Control de Asistencia</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Crea reuniones, distribuye los QRs de firma y visualiza la tabla en vivo sincronizada con SharePoint y las firmas.
              </p>
            </div>
            <div className="relative z-10 flex items-center text-[#D35C24] font-bold gap-2 group-hover:gap-4 transition-all mt-auto">
              Ingresar al Módulo <ArrowRight size={18} />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
