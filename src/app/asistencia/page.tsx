"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { CheckCircle, AlertCircle, Building2, User, CreditCard, Calendar } from 'lucide-react';
import SignaturePad, { SignaturePadRef } from '@/components/SignaturePad';
import { useSearchParams } from 'next/navigation';

function AsistenciaForm() {
  const searchParams = useSearchParams();
  const reunionNombreParam = searchParams.get('reunion') || 'Reunión General';

  const [formData, setFormData] = useState({
    title: reunionNombreParam, // Nombre de la Reunión ya asignado
    nombres: '',
    apellidos: '',
    empresa: '',
    cedula: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const signatureRef = useRef<SignaturePadRef>(null);

  // Si cambia el parametro de la URL, actualizamos el estado
  useEffect(() => {
    if (reunionNombreParam) {
      setFormData(prev => ({ ...prev, title: reunionNombreParam }));
    }
  }, [reunionNombreParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (signatureRef.current?.isEmpty()) {
      setError('Por favor, ingresa tu firma digital antes de enviar.');
      return;
    }

    setLoading(true);

    try {
      const signatureDataUrl = signatureRef.current?.toDataURL();
      
      const payload = {
        ...formData,
        firmaBase64: signatureDataUrl?.split(',')[1],
      };

      const response = await fetch('/api/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(result.error || 'Ocurrió un error al registrar la asistencia.');
      }
    } catch (err) {
      setError('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-500">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Asistencia Registrada!</h2>
          <p className="text-gray-600 mb-6">Gracias por registrar tu asistencia en <strong>{formData.title}</strong>.</p>
          <button
            onClick={() => {
              setFormData({ title: reunionNombreParam, nombres: '', apellidos: '', empresa: '', cedula: '' });
              setSuccess(false);
            }}
            className="w-full text-white font-medium py-3 px-4 rounded-xl hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#D35C24' }}
          >
            Registrar Otra Asistencia
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Cabecera con Color Corporativo y Logo */}
        <div className="px-6 py-8 text-white text-center flex flex-col items-center" style={{ backgroundColor: '#D35C24' }}>
          <div className="bg-white p-3 rounded-xl mb-4 shadow-md inline-block">
            <img src="/logo_naranja.png" alt="WellPerf Logo" className="h-12 object-contain" />
          </div>
          <h1 className="text-3xl font-bold">Registro de Asistencia</h1>
          <p className="mt-2 text-orange-100 opacity-90">Reunión: {formData.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="shrink-0 h-5 w-5 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="nombres"
                  required
                  value={formData.nombres}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-xl border border-gray-300 py-3 text-gray-900 focus:ring-2 focus:ring-[#D35C24] focus:border-[#D35C24] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="apellidos"
                  required
                  value={formData.apellidos}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-xl border border-gray-300 py-3 text-gray-900 focus:ring-2 focus:ring-[#D35C24] focus:border-[#D35C24] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="cedula"
                  required
                  value={formData.cedula}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-xl border border-gray-300 py-3 text-gray-900 focus:ring-2 focus:ring-[#D35C24] focus:border-[#D35C24] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="empresa"
                  required
                  value={formData.empresa}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-xl border border-gray-300 py-3 text-gray-900 focus:ring-2 focus:ring-[#D35C24] focus:border-[#D35C24] outline-none transition-all"
                />
              </div>
            </div>

            <div className="sm:col-span-2 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Firma Digital</label>
              <SignaturePad ref={signatureRef} />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 rounded-xl shadow-md text-base font-medium text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: '#D35C24' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Procesando...
                </span>
              ) : (
                'Confirmar Asistencia'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AsistenciaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-[#D35C24]">Cargando formulario...</div>}>
      <AsistenciaForm />
    </Suspense>
  );
}
