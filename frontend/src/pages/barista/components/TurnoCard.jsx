import { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export function HoraActual() {
  const [hora, setHora] = useState('');
  useEffect(() => {
    const actualizar = () => {
      const now = new Date();
      setHora(now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }));
    };
    actualizar();
    const interval = setInterval(actualizar, 1000);
    return () => clearInterval(interval);
  }, []);
  return <span>{hora}</span>;
}

export default function TurnoCard({ turno }) {
  return turno ? (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'white', border: '1.5px solid #A8E8CC' }}>
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#EDFAF4' }}>
            <Clock size={18} color="#1D7A4E" />
          </div>
          <div>
            <p className="font-serif font-bold text-stone-800">{turno.nombre}</p>
            <p className="text-stone-400 text-xs mt-0.5">
              {turno.nombre_cafeteria} · {turno.hora_inicio} — {turno.hora_fin}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-serif font-bold text-stone-800 text-xl">
            <HoraActual />
          </p>
          <div className="flex items-center gap-1.5 justify-end mt-0.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-600 font-medium">Turno activo</span>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="rounded-2xl p-4 flex items-center justify-between"
      style={{ background: 'white', border: '1px solid #E2E8F0' }}>
      <div className="flex items-center gap-3">
        <AlertCircle size={16} color="#94A3B8" />
        <p className="text-stone-400 text-sm">No tienes turno activo hoy</p>
      </div>
      <p className="font-serif font-bold text-stone-600 text-lg">
        <HoraActual />
      </p>
    </div>
  );
}