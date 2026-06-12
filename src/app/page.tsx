import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
        <img src="/LOGOWPNARANJA.png" alt="WellPerf Logo" className="w-32 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Sistema vCard</h1>
        <p className="text-gray-500 mb-8">Administración de tarjetas digitales para empleados.</p>
        
        <Link 
          href="/admin" 
          className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          Ir al Panel de Administración
        </Link>
      </div>
    </main>
  );
}
