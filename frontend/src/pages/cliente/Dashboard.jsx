import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function ClienteDashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [cargando, setCargando] = useState(true);
  const [qr, setQr]           = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/cliente/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const handleEscanear = (e) => {
    e.preventDefault();
    if (qr.trim()) navigate(`/trazabilidad/${qr.trim()}`);
  };

  const nivelInfo = {
    0: { nombre: 'Curioso',        color: '#6B7280', next: 50  },
    1: { nombre: 'Explorador',     color: '#1D7A4E', next: 150 },
    2: { nombre: 'Conocedor',      color: '#1B4F8A', next: 350 },
    3: { nombre: 'Entendido',      color: '#6B3A8A', next: 700 },
    4: { nombre: 'Maestro Catador',color: '#D4A847', next: 9999},
  };

  return (
    <div className="min-h-screen" style={{ background: '#f0fff8' }}>

      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between" style={{ background: '#1D7A4E' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#259E65' }}>
            <span className="text-white font-serif font-bold text-sm">C</span>
          </div>
          <span className="text-white font-serif font-semibold">Calm and Coffee</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/cliente/explorar')}
            className="text-green-200 hover:text-white text-sm transition">
            Explorar
          </button>
          <button onClick={() => navigate('/cliente/historial')}
            className="text-green-200 hover:text-white text-sm transition">
            Historial
          </button>
          <button onClick={() => navigate('/cliente/pasaporte')}
            className="text-green-200 hover:text-white text-sm transition">
            Pasaporte
          </button>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="text-green-300 hover:text-white text-xs transition">
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-5 py-8">

        {/* Saludo */}
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-stone-800">
            ¡Hola, {usuario?.nombre?.split(' ')[0]}! ☕
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            ¿Qué café vas a explorar hoy?
          </p>
        </div>

        {/* Escanear QR */}
        <div className="rounded-2xl p-5 mb-5" style={{ background: '#1D7A4E' }}>
          <p className="text-green-200 text-xs font-medium mb-1 tracking-wider">ESCANEAR QR</p>
          <p className="text-white font-serif text-lg font-semibold mb-4">
            Conoce la historia de tu café
          </p>
          <form onSubmit={handleEscanear} className="flex gap-2">
            <input
              value={qr}
              onChange={e => setQr(e.target.value)}
              placeholder="CEA-QR-GEISHA-2025-001"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            />
            <button type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition"
              style={{ background: 'white', color: '#1D7A4E' }}>
              Ver →
            </button>
          </form>
          <p className="text-green-300 text-xs mt-2">
            💡 Prueba con: CEA-QR-GEISHA-2025-001
          </p>
        </div>

        {cargando ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data && (
          <>
            {/* Pasaporte */}
            {data.pasaporte && (
              <div className="rounded-2xl p-5 mb-5 cursor-pointer"
                onClick={() => navigate('/cliente/pasaporte')}
                style={{ background: 'white', border: '1px solid #A8E8CC' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-stone-500 text-xs font-medium tracking-wider">MI PASAPORTE CAFETERO</p>
                  <span className="text-xs text-green-600 font-medium">Ver completo →</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#edfaf4' }}>
                    <span className="text-2xl">☕</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-stone-800">
                        {nivelInfo[data.pasaporte.nivel]?.nombre || 'Curioso'}
                      </span>
                      <span className="font-bold text-green-600">
                        {data.pasaporte.puntos} pts
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ background: '#edfaf4' }}>
                      <div className="h-2 rounded-full transition-all"
                        style={{
                          background: '#1D7A4E',
                          width: `${Math.min((data.pasaporte.puntos / (nivelInfo[data.pasaporte.nivel]?.next || 50)) * 100, 100)}%`
                        }} />
                    </div>
                    <p className="text-stone-400 text-xs mt-1">
                      {data.pasaporte.cafes_catados} cafés catados · {data.pasaporte.cafeterias_visitadas} cafeterías
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recomendaciones */}
            {data.recomendaciones?.length > 0 && (
              <div className="mb-5">
                <h2 className="font-serif text-lg font-bold text-stone-800 mb-3">
                  Para ti hoy ✨
                </h2>
                <div className="space-y-3">
                  {data.recomendaciones.map((r, i) => (
                    <div key={i}
                      onClick={() => r.qr_codigo && navigate(`/trazabilidad/${r.qr_codigo}`)}
                      className="bg-white rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
                      style={{ border: '1px solid #A8E8CC' }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#edfaf4' }}>
                        <span className="text-xl">☕</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-stone-800 text-sm">{r.nombre}</h3>
                        <p className="text-stone-400 text-xs mt-0.5">
                          {r.variedad} · {r.proceso} · {r.nombre_finca}
                        </p>
                        <p className="text-stone-400 text-xs">{r.municipio} · {r.altitud_msnm} msnm</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-stone-800 text-sm">
                          ${parseInt(r.precio).toLocaleString('es-CO')}
                        </p>
                        {r.rating && (
                          <p className="text-amber-500 text-xs">★ {r.rating}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insignias pendientes */}
            {data.insignias_pendientes?.length > 0 && (
              <div>
                <h2 className="font-serif text-lg font-bold text-stone-800 mb-3">
                  Próximas insignias 🏅
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {data.insignias_pendientes.map((ins, i) => (
                    <div key={i} className="bg-white rounded-2xl p-3 text-center"
                      style={{ border: '1px solid #e2e8f0', opacity: 0.7 }}>
                      <div className="text-2xl mb-1">🔒</div>
                      <p className="text-stone-600 text-xs font-medium">{ins.nombre}</p>
                      <p className="text-stone-400 text-xs mt-0.5">+{ins.puntos_otorga} pts</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}