"use client";

import React, { useEffect, useState } from 'react';
import { Calendar, Users, LogOut, Loader2, Download, Plus, QrCode, X, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

interface Asistencia {
  id: string;
  title: string;
  nombres: string;
  apellidos: string;
  empresa: string;
  cedula: string;
  created: string;
  signature_url?: string;
}

interface GrupoReunion {
  title: string;
  asistentes: Asistencia[];
}

interface Meeting {
  id: string;
  name: string;
  created_at: string;
}

export default function AdminDashboardAsistencia() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [newMeetingName, setNewMeetingName] = useState('');
  const [selectedMeetingQR, setSelectedMeetingQR] = useState<Meeting | null>(null);
  
  const router = useRouter();
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resAsistencias, resMeetings, resSignatures] = await Promise.all([
        fetch('/api/asistencia'),
        fetch('/api/meetings'),
        fetch('/api/signatures')
      ]);
      
      let sigsData: any[] = [];
      if (resSignatures.ok) sigsData = await resSignatures.json();
      
      if (resAsistencias.ok) {
        let asistsData = await resAsistencias.json();
        // Mapear la URL de firma al asistente
        asistsData = asistsData.map((a: any) => {
          const s = sigsData.find((sig: any) => sig.sharepoint_id === a.id);
          return { ...a, signature_url: s ? s.blob_url : null };
        });
        setAsistencias(asistsData);
      }
      if (resMeetings.ok) setMeetings(await resMeetings.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingName.trim()) return;
    
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newMeetingName })
      });
      if (res.ok) {
        const newMeeting = await res.json();
        setMeetings([newMeeting, ...meetings]);
        setShowNewMeetingModal(false);
        setNewMeetingName('');
        setSelectedMeetingQR(newMeeting);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const descargarCSV = (grupo: GrupoReunion) => {
    const headers = "Nombres,Apellidos,Cédula,Empresa,Fecha Registro\n";
    const filas = grupo.asistentes.map(a => 
      `"${a.nombres}","${a.apellidos}","${a.cedula}","${a.empresa}","${new Date(a.created).toLocaleString()}"`
    ).join("\n");
    
    const blob = new Blob([headers + filas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Asistencia_${grupo.title}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const grupos = asistencias.reduce((acc, curr) => {
    const key = curr.title;
    if (!acc[key]) acc[key] = { title: key, asistentes: [] };
    acc[key].asistentes.push(curr);
    return acc;
  }, {} as Record<string, GrupoReunion>);

  const listaGrupos = Object.values(grupos);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NavBar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo_naranja.png" alt="WellPerf Logo" className="h-8 object-contain" />
              <span className="text-xl font-bold" style={{ color: '#D35C24' }}>Panel de Asistencia</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2 text-[#D35C24] font-semibold hover:bg-orange-50 px-4 py-2 rounded-xl transition-colors border border-orange-200">
                <ArrowLeft size={16} /> Volver a VCards
              </Link>
              <button
                onClick={() => setShowNewMeetingModal(true)}
                className="flex items-center text-white px-4 py-2 rounded-lg hover:opacity-90 font-medium transition-colors"
                style={{ backgroundColor: '#D35C24' }}
              >
                <Plus className="h-5 w-5 mr-1" /> Nueva Reunión
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-gray-700 font-medium"
              >
                <LogOut className="h-5 w-5 mr-1" /> Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Mis Reuniones (Activas para generar QR) */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Reuniones Generadas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {meetings.map(m => (
              <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
                <div className="truncate pr-2">
                  <p className="font-semibold text-gray-800 truncate">{m.name}</p>
                  <p className="text-xs text-gray-500">{new Date(m.created_at).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => setSelectedMeetingQR(m)}
                  className="p-2 rounded-full hover:bg-orange-50 text-[#D35C24] transition-colors"
                  title="Ver QR"
                >
                  <QrCode className="h-6 w-6" />
                </button>
              </div>
            ))}
            {meetings.length === 0 && !loading && (
              <p className="text-gray-500 col-span-full">No has creado reuniones todavía. Haz clic en "Nueva Reunión" para empezar.</p>
            )}
          </div>
        </section>

        {/* Registros de Asistencia */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Registros en SharePoint</h2>
            <p className="text-gray-500 mt-1">Personas que han firmado asistencia agrupadas por reunión</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 text-[#D35C24] animate-spin" />
            </div>
          ) : listaGrupos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hay registros</h3>
              <p className="text-gray-500">Aún no se ha sincronizado ninguna asistencia desde SharePoint.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {listaGrupos.map((grupo) => (
                <div key={grupo.title} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-[#D35C24]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">{grupo.title}</h2>
                        <span className="text-sm text-gray-500">{grupo.asistentes.length} asistentes</span>
                      </div>
                    </div>
                    <button
                      onClick={() => descargarCSV(grupo)}
                      className="flex items-center text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-1.5" />
                      Exportar CSV
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asistente</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Firma</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {grupo.asistentes.map((asistente) => (
                          <tr key={asistente.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{asistente.nombres} {asistente.apellidos}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {asistente.cedula}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {asistente.empresa || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(asistente.created).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {asistente.signature_url ? (
                                <div className="h-12 w-24 bg-white rounded border border-gray-200 overflow-hidden flex items-center justify-center">
                                  <img 
                                    src={asistente.signature_url} 
                                    alt="Firma" 
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                              ) : (
                                <span className="text-gray-400">Sin firma</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal Crear Reunión */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Crear Nueva Reunión</h3>
              <button onClick={() => setShowNewMeetingModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateMeeting}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Reunión</label>
                <input
                  type="text"
                  required
                  value={newMeetingName}
                  onChange={(e) => setNewMeetingName(e.target.value)}
                  placeholder="Ej. Inducción de Seguridad"
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D35C24] focus:border-[#D35C24] outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#D35C24' }}
              >
                Guardar Reunión
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mostrar QR */}
      {selectedMeetingQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center relative">
            <button 
              onClick={() => setSelectedMeetingQR(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2 mt-2">{selectedMeetingQR.name}</h3>
            <p className="text-sm text-gray-500 mb-6">Escanea el código para registrar asistencia</p>
            
            <div className="bg-white p-4 inline-block rounded-xl border border-gray-200 mx-auto">
              <QRCodeSVG 
                value={`${origin}/asistencia?reunion=${encodeURIComponent(selectedMeetingQR.name)}`} 
                size={200}
                fgColor="#D35C24" 
              />
            </div>
            
            <p className="text-xs text-gray-400 mt-6 break-all">
              {`${origin}/asistencia?reunion=${encodeURIComponent(selectedMeetingQR.name)}`}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
