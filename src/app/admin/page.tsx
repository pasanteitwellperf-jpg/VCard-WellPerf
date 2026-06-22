"use client";

import React, { useEffect, useState, useRef } from "react";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import { Edit2, Save, X, Download, ImageIcon, Upload, Trash2 } from "lucide-react";
import html2canvas from "html2canvas";


interface Employee {
  item: string;
  nombre: string;
  cedula: string;
  area: string;
  cargo: string;
  telefono: string;
  email: string;
}

export default function AdminPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});
  const [newPhotoBase64, setNewPhotoBase64] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const getMissingFields = (emp: Employee) => {
    const missing = [];
    if (!emp.cedula || emp.cedula === 'nan') missing.push('Cédula');
    if (!emp.telefono || emp.telefono.toString().trim() === '' || emp.telefono === 'nan') missing.push('Teléfono');
    if (!emp.email || !emp.email.includes('@')) missing.push('Email');
    if (!emp.area || emp.area.toString().trim() === '' || emp.area === 'nan') missing.push('Área');
    if (!emp.cargo || emp.cargo.toString().trim() === '' || emp.cargo === 'nan') missing.push('Cargo');
    return missing;
  };

  useEffect(() => {
    setBaseUrl(window.location.origin);
    
    // Fetch live data from Vercel Postgres
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees');
        if (res.ok) {
          const data = await res.json();
          setEmployees(data);
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleEditClick = (emp: Employee) => {
    setEditingId(emp.cedula);
    setEditForm({ ...emp });
    setNewPhotoBase64(null);
    setIsAddingNew(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setNewPhotoBase64(null);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setEditForm({
      item: (employees.length + 1).toString(),
      nombre: '',
      cedula: '',
      area: '',
      cargo: '',
      telefono: '',
      email: ''
    });
    setNewPhotoBase64(null);
    setIsAddingNew(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewPhotoBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (cedula: string) => {
    try {
      const payload = {
        ...editForm,
        photoBase64: newPhotoBase64 // Se enviara al endpoint para guardarse
      };

      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (isAddingNew) {
          setEmployees([{ ...editForm } as Employee, ...employees]);
          setIsAddingNew(false);
        } else {
          setEmployees(employees.map(emp => emp.cedula === cedula ? { ...emp, ...editForm } as Employee : emp));
        }
        setEditingId(null);
        setNewPhotoBase64(null);
      } else {
        alert("Error al guardar los datos");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error de conexión al guardar");
    }
  };

  const handleDelete = async (cedula: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar al empleado con cédula ${cedula}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch('/api/employees', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cedula }),
      });

      if (response.ok) {
        setEmployees(employees.filter(emp => emp.cedula !== cedula));
        setEditingId(null);
      } else {
        alert("Error al eliminar los datos");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Error de conexión al eliminar");
    }
  };

  const downloadImage = async (cedula: string, type: 'qr' | 'barcode') => {
    const elementId = `${type}-${cedula}`;
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 5 });
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `${type}_${cedula}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error downloading image:", err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight text-center md:text-left">Panel de Administración</h1>
            <p className="mt-2 text-lg text-gray-600 text-center md:text-left">Gestiona las credenciales y descarga los códigos de acceso.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4 items-center">
            <button 
              onClick={handleAddNew}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-xl shadow-sm transition-colors"
            >
              + Nuevo Empleado
            </button>
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-700">{employees.length} Empleados</span>
            </div>
          </div>
        </div>
        
        {/* Cambiamos el grid para que en modo de edición se vea mejor y en normal sea de 1 columna larga o grid */}
        <div className="flex flex-col gap-8">
          
          {isLoading && (
            <div className="text-center py-10 text-gray-500 font-semibold animate-pulse">
              Cargando base de datos en vivo...
            </div>
          )}
          
          {/* Formulario de Nuevo Empleado */}
          {isAddingNew && (
            <div className="bg-white rounded-3xl shadow-2xl ring-2 ring-orange-500 overflow-hidden flex flex-col transition-all duration-300">
              <div className="flex flex-col lg:flex-row">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 flex flex-col items-center justify-center lg:w-1/3 relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                     <button onClick={() => handleSave(editForm.cedula || '')} className="bg-white text-orange-600 hover:bg-green-50 px-4 py-2 rounded-full font-bold shadow-md transition-colors flex items-center gap-2">
                       <Save size={18} /> Crear
                     </button>
                     <button onClick={handleCancelEdit} className="bg-black/20 text-white hover:bg-black/30 p-2 rounded-full transition-colors" title="Cancelar">
                       <X size={18} />
                     </button>
                  </div>
                  
                  <div className="relative group mb-6 mt-8">
                    <img 
                      src={newPhotoBase64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(editForm.nombre || 'Nuevo')}&background=ffffff&color=ea580c&size=256`} 
                      alt="Nuevo Empleado"
                      className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                    />
                    <label className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Upload size={24} className="mb-1" />
                      <span className="text-xs font-bold">Subir Foto</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </div>
                  
                  <div className="w-full space-y-3">
                    <div>
                      <label className="text-orange-100 text-xs font-bold uppercase mb-1 block">Nombre Completo</label>
                      <input 
                        type="text" 
                        value={editForm.nombre || ''} 
                        onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                        className="bg-white border-0 rounded-lg px-3 py-2 text-gray-900 font-bold w-full focus:ring-2 focus:ring-white shadow-inner"
                        placeholder="Ej. Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="text-orange-100 text-xs font-bold uppercase mb-1 block">Cargo</label>
                      <input 
                        type="text" 
                        value={editForm.cargo || ''} 
                        onChange={(e) => setEditForm({...editForm, cargo: e.target.value})}
                        className="bg-white border-0 rounded-lg px-3 py-2 text-gray-900 font-medium w-full focus:ring-2 focus:ring-white shadow-inner"
                        placeholder="Ej. Desarrollador"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Información de Contacto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cédula</label>
                      <input type="text" value={editForm.cedula || ''} onChange={(e) => setEditForm({...editForm, cedula: e.target.value})} className="w-full bg-slate-50 text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Teléfono</label>
                      <input type="text" value={editForm.telefono || ''} onChange={(e) => setEditForm({...editForm, telefono: e.target.value})} className="w-full bg-slate-50 text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Área (Texto Lateral Izquierdo)</label>
                      <input type="text" value={editForm.area || ''} onChange={(e) => setEditForm({...editForm, area: e.target.value})} className="w-full bg-slate-50 text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Ej. Operaciones" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                      <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full bg-slate-50 text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {employees.map((emp, index) => {
            const vCardUrl = `${baseUrl}/${emp.cedula}`;
            const isEditing = editingId === emp.cedula;
            
            return (
              <div key={`${emp.cedula}-${index}`} className={`bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col transition-all duration-300 ${isEditing ? 'ring-2 ring-orange-500 shadow-2xl' : 'hover:shadow-2xl hover:-translate-y-1'}`}>
                
                {isEditing ? (
                  /* VISTA DE EDICIÓN (Horizontal extendida) */
                  <div className="flex flex-col lg:flex-row">
                    {/* Panel Izquierdo: Foto y Nombres */}
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 flex flex-col items-center justify-center lg:w-1/3 relative">
                      <div className="absolute top-4 right-4 flex gap-2">
                         <button onClick={() => handleSave(emp.cedula)} className="bg-white text-orange-600 hover:bg-green-50 px-4 py-2 rounded-full font-bold shadow-md transition-colors flex items-center gap-2">
                           <Save size={18} /> Guardar
                         </button>
                         <button onClick={handleCancelEdit} className="bg-black/20 text-white hover:bg-black/30 p-2 rounded-full transition-colors" title="Cancelar">
                           <X size={18} />
                         </button>
                      </div>
                      
                      <div className="relative group mb-6 mt-8">
                        <img 
                          src={newPhotoBase64 || `/fotos/${emp.nombre}.png`} 
                          alt={emp.nombre}
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(emp.nombre) + '&background=ffffff&color=ea580c&size=256' }}
                          className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                        />
                        <label className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                          <Upload size={24} className="mb-1" />
                          <span className="text-xs font-bold">Cambiar</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                      </div>
                      
                      <div className="w-full space-y-3">
                        <div>
                          <label className="text-orange-100 text-xs font-bold uppercase mb-1 block">Nombre Completo</label>
                          <input 
                            type="text" 
                            value={editForm.nombre || ''} 
                            onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                            className="bg-white border-0 rounded-lg px-3 py-2 text-gray-900 font-bold w-full focus:ring-2 focus:ring-white shadow-inner"
                          />
                        </div>
                        <div>
                          <label className="text-orange-100 text-xs font-bold uppercase mb-1 block">Cargo</label>
                          <input 
                            type="text" 
                            value={editForm.cargo || ''} 
                            onChange={(e) => setEditForm({...editForm, cargo: e.target.value})}
                            className="bg-white border-0 rounded-lg px-3 py-2 text-gray-900 font-medium w-full focus:ring-2 focus:ring-white shadow-inner"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Panel Derecho: Datos Extra y Códigos */}
                    <div className="p-8 flex-1 flex flex-col justify-center">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Información de Contacto</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cédula</label>
                          <input type="text" value={editForm.cedula || ''} onChange={(e) => setEditForm({...editForm, cedula: e.target.value})} className="w-full bg-slate-50 text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Teléfono</label>
                          <input type="text" value={editForm.telefono || ''} onChange={(e) => setEditForm({...editForm, telefono: e.target.value})} className="w-full bg-slate-50 text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Área (Texto Lateral Izquierdo)</label>
                          <input type="text" value={editForm.area || ''} onChange={(e) => setEditForm({...editForm, area: e.target.value})} className="w-full bg-slate-50 text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Ej. Operaciones" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                          <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full bg-slate-50 text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* VISTA NORMAL (Solo visualización) */
                  <div className="flex flex-col lg:flex-row">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 flex items-center justify-between lg:w-1/3 relative">
                      <div className="flex items-center gap-4">
                        <img 
                          src={`/fotos/${emp.nombre}.png`} 
                          alt={emp.nombre}
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(emp.nombre) + '&background=ffffff&color=ea580c&size=128' }}
                          className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover bg-white"
                        />
                        <div className="text-white">
                          <h2 className="text-lg font-bold leading-tight line-clamp-2">{emp.nombre}</h2>
                          <p className="text-orange-100 text-sm font-medium">{emp.cargo}</p>
                          
                          {/* Indicador de campos faltantes */}
                          {!isEditing && getMissingFields(emp).length > 0 && (
                            <div className="mt-2 text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded shadow-sm inline-block border border-red-200">
                              Falta: {getMissingFields(emp).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4 shrink-0">
                        <button onClick={() => handleEditClick(emp)} className="p-2 text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors" title="Editar Datos">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(emp.cedula)} className="p-2 text-white bg-red-500/80 hover:bg-red-600 backdrop-blur-sm rounded-lg transition-colors" title="Eliminar Empleado">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col md:flex-row items-center gap-8 justify-center bg-white">
                      
                      {/* Barcode Column */}
                      <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">Control Acceso</p>
                        <div id={`barcode-${emp.cedula}`} className="bg-white p-3 rounded-xl shadow-sm inline-block w-full flex justify-center">
                          {emp.cedula && emp.cedula !== 'nan' ? (
                            <div className="scale-75 origin-center">
                              <Barcode value={emp.cedula} displayValue={true} height={50} width={2} margin={0} background="#ffffff" />
                            </div>
                          ) : (
                            <p className="text-red-500 text-xs py-4">Sin Cédula</p>
                          )}
                        </div>
                        <button 
                          onClick={() => downloadImage(emp.cedula, 'barcode')}
                          className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-orange-600 bg-white border border-slate-200 hover:border-orange-200 px-3 py-2 rounded-lg transition-all w-full justify-center shadow-sm hover:shadow"
                        >
                          <Download size={14} /> Descargar
                        </button>
                      </div>

                      {/* QR Column */}
                      <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-between bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                        <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 text-center">vCard Perfil</p>
                        <div id={`qr-${emp.cedula}`} className="bg-white p-2 rounded-xl shadow-sm inline-block">
                          {emp.cedula && emp.cedula !== 'nan' ? (
                            <div className="relative inline-flex items-center justify-center">
                              <QRCodeSVG
                                value={vCardUrl}
                                size={120}
                                bgColor={"#ffffff"}
                                fgColor={"#000000"}
                                level={"H"}
                                includeMargin={false}
                              />
                              <div className="absolute inset-0 m-auto bg-white flex items-center justify-center" style={{ width: 64, height: 24 }}>
                                <img src="/logo_naranja.png" alt="Logo WP" style={{ width: 56, height: "auto", display: "block" }} />
                              </div>
                            </div>
                          ) : (
                            <div className="w-[120px] h-[120px] bg-slate-100 flex items-center justify-center text-slate-400 text-xs text-center px-2">No disponible</div>
                          )}
                        </div>
                        <div className="w-full flex gap-2 mt-4">
                          <button 
                            onClick={() => downloadImage(emp.cedula, 'qr')}
                            className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-orange-700 hover:text-white bg-white hover:bg-orange-600 border border-orange-200 px-2 py-2 rounded-lg transition-all shadow-sm"
                          >
                            <Download size={14} /> PNG
                          </button>
                          <a 
                            href={vCardUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-2 py-2 rounded-lg transition-all shadow-sm"
                          >
                            Ver
                          </a>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
