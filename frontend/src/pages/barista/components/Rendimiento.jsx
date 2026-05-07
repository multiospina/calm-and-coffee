import { useState, useEffect } from 'react';
import { TrendingUp, Coffee, Star, Clock, Award } from 'lucide-react';
import api from '../../../api/axios';

export default function Rendimiento() {
  const [data,     setData]     = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/barista/rendimiento');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) return (
    <div className="flex justify-center py-10">
      <div className="w-7 h-7 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
    </div>
  );

  if (!data || data.turnos.length === 0) return (
    <div className="rounded-2xl p-10 text-center"
      style={{ background:'white', border:'1px solid #E2E8F0' }}>
      <TrendingUp size={32} color="#E2E8F0" className="mx-auto mb-3" />
      <p className="font-serif text-stone-500 font-semibold">Sin historial aún</p>
      <p className="text-stone-300 text-sm mt-1">Completa turnos para ver tu rendimiento</p>
    </div>
  );

  // Totales de la semana
  const totalPedidos    = data.turnos.reduce((acc, t) => acc + parseInt(t.total_pedidos || 0), 0);
  const totalEntregados = data.turnos.reduce((acc, t) => acc + parseInt(t.entregados || 0), 0);
  const satisfPromedio  = data.turnos.filter(t => t.satisfaccion_promedio)
    .reduce((acc, t, _, arr) => acc + parseFloat(t.satisfaccion_promedio) / arr.length, 0);

  return (
    <div className="space-y-4">

      {/* Resumen semanal */}
      <div className="rounded-2xl p-5"
        style={{ background:'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)' }}>
        <p className="text-xs font-bold text-gray-400 mb-3 tracking-wider">
          RESUMEN — ÚLTIMOS 7 DÍAS
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'Pedidos',     value: totalPedidos,                                    color:'#C0350F', bg:'rgba(192,53,15,0.2)',   icon: Coffee  },
            { label:'Entregados',  value: totalEntregados,                                 color:'#1D7A4E', bg:'rgba(29,122,78,0.2)',   icon: Award   },
            { label:'Satisfac.',   value: satisfPromedio ? `${satisfPromedio.toFixed(1)}★` : '—', color:'#D4A847', bg:'rgba(212,168,71,0.2)', icon: Star },
          ].map((m,i) => (
            <div key={i} className="rounded-xl p-3 text-center"
              style={{ background:m.bg }}>
              <m.icon size={14} color={m.color} className="mx-auto mb-1" />
              <p className="font-serif font-bold text-xl" style={{ color:m.color }}>{m.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top cafés preparados */}
      {data.top_cafes?.length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background:'white', border:'1px solid #E2E8F0' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} color="#C0350F" />
            <p className="font-serif font-bold text-stone-800">Tus cafés más preparados</p>
          </div>
          <div className="space-y-2">
            {data.top_cafes.map((c,i) => (
              <div key={i} className="flex items-center gap-3 py-2"
                style={{ borderBottom: i < data.top_cafes.length-1 ? '1px solid #F8F9FA' : 'none' }}>
                <span className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: i===0?'#FFF0EB':'#F8F9FA', color: i===0?'#C0350F':'#4A5568' }}>
                  {i+1}
                </span>
                <p className="flex-1 text-stone-700 text-sm font-medium truncate">{c.nombre}</p>
                <div className="text-right flex-shrink-0">
                  {c.rating && (
                    <p className="text-xs font-medium" style={{ color:'#D4A847' }}>★ {c.rating}</p>
                  )}
                  <p className="text-xs text-stone-400">{c.total} prep.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial de turnos */}
      <div>
        <p className="text-xs font-bold text-stone-400 tracking-wider mb-3">
          HISTORIAL DE TURNOS
        </p>
        <div className="space-y-2">
          {data.turnos.map((t,i) => (
            <div key={i} className="rounded-2xl p-4"
              style={{ background:'white', border:'1px solid #E2E8F0' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-serif font-bold text-stone-800 text-sm">{t.nombre_turno}</p>
                  <p className="text-stone-400 text-xs mt-0.5">
                    {new Date(t.fecha).toLocaleDateString('es-CO', {
                      weekday:'long', day:'numeric', month:'long'
                    })}
                  </p>
                </div>
                {t.satisfaccion_promedio && (
                  <span className="text-sm font-bold" style={{ color:'#D4A847' }}>
                    ★ {t.satisfaccion_promedio}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label:'Pedidos',    value: t.total_pedidos  || 0,  color:'#C0350F', bg:'#FFF0EB' },
                  { label:'Entregados', value: t.entregados     || 0,  color:'#1D7A4E', bg:'#EDFAF4' },
                  { label:'T. prom.',   value: t.tiempo_promedio_min ? `${t.tiempo_promedio_min}m` : '—', color:'#1B4F8A', bg:'#EBF2FF' },
                ].map((m,j) => (
                  <div key={j} className="rounded-xl p-2 text-center"
                    style={{ background:m.bg }}>
                    <p className="font-serif font-bold" style={{ color:m.color }}>{m.value}</p>
                    <p className="text-xs text-stone-400">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}