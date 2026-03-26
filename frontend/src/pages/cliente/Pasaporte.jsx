import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const NIVELES = [
  { nivel:0, nombre:'Curioso',         min:0,   max:50,   emoji:'🌱' },
  { nivel:1, nombre:'Explorador',      min:51,  max:150,  emoji:'🗺️' },
  { nivel:2, nombre:'Conocedor',       min:151, max:350,  emoji:'📚' },
  { nivel:3, nombre:'Entendido',       min:351, max:700,  emoji:'🎯' },
  { nivel:4, nombre:'Maestro Catador', min:701, max:9999, emoji:'🏆' },
];

export default function ClientePasaporte() {
  const navigate = useNavigate();
  const [data, setData]         = useState(null);
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0fff8' }}>
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
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
    ? Math.max(nivel_siguiente.puntos_min - pasaporte.puntos, 0)
    : 0;

  return (
    <div className="min-h-screen" style={{ background: '#f0fff8' }}>

      <nav className="px-6 py-4 flex items-center justify-between" style={{ background: '#1D7A4E' }}>
        <button onClick={() => navigate('/cliente')}
          className="text-green-200 hover:text-white text-sm transition">
          ← Dashboard
        </button>
        <span className="text-white font-serif font-semibold">Mi Pasaporte</span>
        <div />
      </nav>

      <div className="max-w-lg mx-auto px-5 py-8 space-y-5">

        {/* Card principal */}
        <div className="rounded-2xl p-6 text-center"
          style={{ background: 'linear-gradient(135deg, #1D7A4E 0%, #0F4A2E 100%)' }}>
          <div className="text-5xl mb-3">{nivelActual.emoji}</div>
          <h1 className="text-white font-serif text-2xl font-bold mb-1">
            {nivelActual.nombre}
          </h1>
          <p className="text-green-300 text-sm mb-5">
            {pasaporte.nombre_cliente}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label:'Puntos',     value: pasaporte.puntos              },
              { label:'Catados',    value: pasaporte.cafes_catados       },
              { label:'Cafeterías', value: pasaporte.cafeterias_visitadas },
            ].map((m, i) => (
              <div key={i} className="rounded-xl py-3"
                style={{ background: 'rgba(255,255,255,0.12)' }}>
                <div className="text-white font-bold text-xl font-serif">{m.value}</div>
                <div className="text-green-300 text-xs">{m.label}</div>
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
              <div className="w-full h-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)' }}>
                <div className="h-2 rounded-full transition-all"
                  style={{ background: '#6DD4A8', width: `${progreso}%` }} />
              </div>
            </div>
          ) : (
            <p className="text-green-300 text-sm">🏆 ¡Nivel máximo alcanzado!</p>
          )}
        </div>

        {/* Puntos actuales */}
        <div className="bg-white rounded-2xl p-4 flex items-center justify-between"
          style={{ border: '1px solid #A8E8CC' }}>
          <div>
            <p className="text-stone-500 text-xs">Puntos acumulados</p>
            <p className="text-green-600 font-bold text-2xl font-serif">{pasaporte.puntos}</p>
          </div>
          <div className="text-right">
            <p className="text-stone-500 text-xs">Nivel actual</p>
            <p className="text-stone-700 font-semibold text-sm">{nivelActual.nombre}</p>
            {nivel_siguiente && (
              <p className="text-stone-400 text-xs mt-0.5">
                Siguiente: {nivel_siguiente.nombre}
              </p>
            )}
          </div>
        </div>

        {/* Procesos y variedades */}
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #A8E8CC' }}>
          <p className="text-stone-500 text-xs font-medium mb-3 tracking-wider">MI EXPERIENCIA</p>
          <div className="space-y-3">
            {pasaporte.procesos_catados?.length > 0 && (
              <div>
                <p className="text-stone-400 text-xs mb-2">Procesos explorados</p>
                <div className="flex flex-wrap gap-2">
                  {pasaporte.procesos_catados.map((p, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full capitalize font-medium"
                      style={{ background: '#edfaf4', color: '#1D7A4E' }}>
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
                  {pasaporte.variedades_catadas.map((v, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ background: '#f3eef5', color: '#6B3A8A' }}>
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Camino del catador */}
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #A8E8CC' }}>
          <p className="text-stone-500 text-xs font-medium mb-4 tracking-wider">CAMINO DEL CATADOR</p>
          <div className="space-y-3">
            {NIVELES.map((n, i) => {
              const desbloqueado = pasaporte.nivel >= n.nivel;
              const esActual     = pasaporte.nivel === n.nivel;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: desbloqueado ? '#edfaf4' : '#f5f5f5',
                      border: esActual ? '2px solid #1D7A4E' : '1px solid #e2e8f0'
                    }}>
                    <span className="text-lg"
                      style={{ filter: desbloqueado ? 'none' : 'grayscale(1) opacity(0.4)' }}>
                      {n.emoji}
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
                      style={{ background: '#edfaf4', color: '#1D7A4E' }}>
                      Actual
                    </span>
                  )}
                  {desbloqueado && !esActual && (
                    <span className="text-xs" style={{ color: '#1D7A4E' }}>✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Insignias */}
        {todas_las_insignias?.length > 0 && (
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #A8E8CC' }}>
            <p className="text-stone-500 text-xs font-medium mb-4 tracking-wider">INSIGNIAS</p>
            <div className="grid grid-cols-3 gap-3">
              {todas_las_insignias.map((ins, i) => (
                <div key={i} className="text-center p-3 rounded-xl"
                  style={{
                    background: ins.desbloqueada ? '#edfaf4' : '#f8f8f8',
                    border: ins.desbloqueada ? '1px solid #A8E8CC' : '1px solid #e2e8f0',
                    opacity: ins.desbloqueada ? 1 : 0.5
                  }}>
                  <div className="text-2xl mb-1">{ins.desbloqueada ? '🏅' : '🔒'}</div>
                  <p className="text-xs font-medium"
                    style={{ color: ins.desbloqueada ? '#1D7A4E' : '#9CA3AF' }}>
                    {ins.nombre}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#A8E8CC' }}>
                    +{ins.puntos_otorga} pts
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}