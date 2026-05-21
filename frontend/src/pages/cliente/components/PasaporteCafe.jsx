import { useState, useEffect } from 'react';
import { Award, Lock, Star, TrendingUp } from 'lucide-react';
import api from '../../../api/axios';

const NIVELES = [
  { nivel:0, nombre:'Curioso',         min:0,   max:50,   icon:'🌱' },
  { nivel:1, nombre:'Explorador',      min:51,  max:150,  icon:'🗺️' },
  { nivel:2, nombre:'Conocedor',       min:151, max:350,  icon:'📚' },
  { nivel:3, nombre:'Entendido',       min:351, max:700,  icon:'🎯' },
  { nivel:4, nombre:'Maestro Catador', min:701, max:9999, icon:'🏆' },
];

export default function PasaporteCafe() {
  const [data,     setData]     = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/cliente/pasaporte');
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
    <div className="flex justify-center py-20">
      <div className="w-7 h-7 border-2 border-green-200 border-t-green-500 rounded-full animate-spin" />
    </div>
  );

  if (!data) return null;

  const { pasaporte, nivel_siguiente, todas_las_insignias } = data;
  const nivelActual = NIVELES[pasaporte.nivel] || NIVELES[0];
  const nivelMin    = nivelActual?.min || 0;
  const nivelMax    = nivel_siguiente?.puntos_min || nivelActual?.max || 100;
  const progreso    = nivel_siguiente
    ? Math.min(Math.max(((pasaporte.puntos - nivelMin) / (nivelMax - nivelMin)) * 100, 0), 100)
    : 100;
  const puntosParaSiguiente = nivel_siguiente
    ? Math.max(nivel_siguiente.puntos_min - pasaporte.puntos, 0) : 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif font-bold text-stone-800 text-xl">Mi Pasaporte</h2>
        <p className="text-stone-400 text-sm mt-0.5">Tu historia cafetera</p>
      </div>

      {/* Card principal */}
      <div className="rounded-3xl overflow-hidden"
        style={{ boxShadow:'0 8px 32px rgba(29,122,78,0.3)' }}>
        <div className="p-6 text-center"
          style={{ background:'linear-gradient(135deg, #0F4A2E 0%, #1D7A4E 100%)' }}>
          <div className="text-5xl mb-3">{nivelActual.icon}</div>
          <h1 className="text-white font-serif text-2xl font-bold mb-1">{nivelActual.nombre}</h1>
          <p className="text-green-300 text-sm mb-5">{pasaporte.nombre_cliente}</p>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label:'Puntos',     value: pasaporte.puntos               },
              { label:'Catados',    value: pasaporte.cafes_catados        },
              { label:'Cafeterías', value: pasaporte.cafeterias_visitadas },
            ].map((m,i) => (
              <div key={i} className="rounded-xl py-3"
                style={{ background:'rgba(255,255,255,0.12)' }}>
                <p className="text-white font-bold text-xl font-serif">{m.value}</p>
                <p className="text-green-300 text-xs">{m.label}</p>
              </div>
            ))}
          </div>
          {nivel_siguiente ? (
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-green-300">{nivelActual.nombre}</span>
                <span className="text-green-300">
                  {puntosParaSiguiente} pts para {nivel_siguiente.nombre}
                </span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }}>
                <div className="h-2 rounded-full" style={{ background:'#6DD4A8', width:`${progreso}%` }} />
              </div>
            </div>
          ) : (
            <p className="text-green-300 text-sm">¡Nivel máximo alcanzado!</p>
          )}
        </div>
      </div>

      {/* Mi experiencia */}
      <div className="rounded-2xl p-5"
        style={{ background:'white', border:'1px solid #A8E8CC' }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={15} color="#1D7A4E" />
          <p className="font-serif font-bold text-stone-800">Mi experiencia</p>
        </div>
        <div className="space-y-3">
          {pasaporte.procesos_catados?.length > 0 && (
            <div>
              <p className="text-stone-400 text-xs mb-2">Procesos explorados</p>
              <div className="flex flex-wrap gap-2">
                {pasaporte.procesos_catados.map((p,i) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-full capitalize font-medium"
                    style={{ background:'#EDFAF4', color:'#1D7A4E' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
          {pasaporte.variedades_catadas?.length > 0 && (
            <div>
              <p className="text-stone-400 text-xs mb-2">Variedades catadas</p>
              <div className="flex flex-wrap gap-2">
                {pasaporte.variedades_catadas.map((v,i) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ background:'#F3EEF5', color:'#6B3A8A' }}>
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Camino del catador */}
      <div className="rounded-2xl p-5"
        style={{ background:'white', border:'1px solid #A8E8CC' }}>
        <div className="flex items-center gap-2 mb-4">
          <Award size={15} color="#1D7A4E" />
          <p className="font-serif font-bold text-stone-800">Camino del catador</p>
        </div>
        <div className="space-y-3">
          {NIVELES.map((n,i) => {
            const desbloqueado = pasaporte.nivel >= n.nivel;
            const esActual     = pasaporte.nivel === n.nivel;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: desbloqueado ? '#EDFAF4' : '#F5F5F5',
                    border: esActual ? '2px solid #1D7A4E' : '1px solid #E2E8F0'
                  }}>
                  <span style={{ fontSize:'18px', filter: desbloqueado ? 'none' : 'grayscale(1) opacity(0.4)' }}>
                    {n.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium"
                    style={{ color: desbloqueado ? '#1D7A4E' : '#9CA3AF' }}>
                    {n.nombre}
                  </p>
                  <p className="text-stone-400 text-xs">
                    {n.min} — {n.max === 9999 ? '∞' : n.max} puntos
                  </p>
                </div>
                {esActual && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ background:'#EDFAF4', color:'#1D7A4E' }}>
                    Actual
                  </span>
                )}
                {desbloqueado && !esActual && (
                  <span className="text-xs" style={{ color:'#1D7A4E' }}>✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Insignias */}
      {todas_las_insignias?.length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background:'white', border:'1px solid #A8E8CC' }}>
          <div className="flex items-center gap-2 mb-4">
            <Star size={15} color="#D4A847" />
            <p className="font-serif font-bold text-stone-800">Insignias</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {todas_las_insignias.map((ins,i) => (
              <div key={i} className="text-center p-3 rounded-2xl"
                style={{
                  background: ins.desbloqueada ? '#EDFAF4' : '#F8F8F8',
                  border: ins.desbloqueada ? '1px solid #A8E8CC' : '1px solid #E2E8F0',
                  opacity: ins.desbloqueada ? 1 : 0.5
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ background: ins.desbloqueada ? '#D4F5E5' : '#F1F0EE' }}>
                  {ins.desbloqueada
                    ? <Award size={18} color="#1D7A4E" />
                    : <Lock size={18} color="#94A3B8" />
                  }
                </div>
                <p className="text-xs font-medium"
                  style={{ color: ins.desbloqueada ? '#1D7A4E' : '#9CA3AF' }}>
                  {ins.nombre}
                </p>
                <p className="text-xs mt-0.5" style={{ color:'#A8E8CC' }}>
                  +{ins.puntos_otorga} pts
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
