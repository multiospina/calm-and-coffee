import { useState, useEffect } from 'react';
import { Users, ChevronDown, ChevronUp, MapPin, Check } from 'lucide-react';
import api from '../../../api/axios';

export default function BaristasDisponibles() {
  const [baristas, setBaristas] = useState([]);
  const [visible,  setVisible]  = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => { if (visible) cargar(); }, [visible]);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await api.get('/gerente/baristas');
      setBaristas(res.data.baristas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background:'white', border:'1px solid #E2E8F0' }}>

      <button onClick={() => setVisible(!visible)}
        className="w-full px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:'#EBF2FF' }}>
            <Users size={16} color="#1B4F8A" />
          </div>
          <div className="text-left">
            <p className="font-serif font-bold text-stone-800">Baristas disponibles</p>
            <p className="text-xs text-stone-400">{baristas.length} registrados en la plataforma</p>
          </div>
        </div>
        {visible ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
      </button>

      {visible && (
        <div className="px-5 pb-5 space-y-2" style={{ borderTop:'1px solid #F8F9FA' }}>
          {cargando ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-400 rounded-full animate-spin" />
            </div>
          ) : baristas.length === 0 ? (
            <div className="py-8 text-center">
              <Users size={28} color="#E2E8F0" className="mx-auto mb-2" />
              <p className="text-stone-300 text-sm">Sin baristas registrados</p>
            </div>
          ) : baristas.map((b,i) => (
            <div key={i} className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background:'#F8F9FA', border:'1px solid #E2E8F0' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-serif font-bold"
                style={{ background:'#EBF2FF', color:'#1B4F8A' }}>
                {b.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-800 text-sm">{b.nombre}</p>
                <p className="text-stone-400 text-xs truncate">{b.email}</p>
                {b.municipio && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={9} color="#CBD5E0" />
                    <span className="text-xs text-stone-300">{b.municipio}</span>
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 justify-end">
                  <Check size={11} color="#1D7A4E" />
                  <span className="text-xs font-medium" style={{ color:'#1D7A4E' }}>Activo</span>
                </div>
                <p className="text-xs text-stone-300 mt-0.5">
                  {b.turnos_asignados} turno{b.turnos_asignados !== '1' ? 's' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}