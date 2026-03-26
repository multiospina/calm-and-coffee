import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function ClienteHistorial() {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando]   = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/cliente/historial');
        setHistorial(res.data.historial);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#f0fff8' }}>

      <nav className="px-6 py-4 flex items-center justify-between" style={{ background: '#1D7A4E' }}>
        <button onClick={() => navigate('/cliente')}
          className="text-green-200 hover:text-white text-sm transition">
          ← Dashboard
        </button>
        <span className="text-white font-serif font-semibold">Mi Historial</span>
        <div />
      </nav>

      <div className="max-w-lg mx-auto px-5 py-8">

        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-stone-800">Mis cafés catados</h1>
          <p className="text-stone-500 text-sm mt-1">{historial.length} experiencias registradas</p>
        </div>

        {cargando ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : historial.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">☕</div>
            <h2 className="font-serif text-xl text-stone-600 mb-2">Aún no has catado ningún café</h2>
            <p className="text-stone-400 text-sm mb-6">Escanea el QR de tu próximo café para empezar</p>
            <button onClick={() => navigate('/cliente')}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-medium"
              style={{ background: '#1D7A4E' }}>
              Ir al dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {historial.map((h, i) => (
              <div key={i}
                onClick={() => h.qr_codigo && navigate(`/trazabilidad/${h.qr_codigo}`)}
                className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md transition"
                style={{ border: '1px solid #A8E8CC' }}>

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#edfaf4' }}>
                      <span className="text-xl">☕</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800">{h.variedad}</h3>
                      <p className="text-stone-400 text-xs mt-0.5 capitalize">
                        {h.proceso} · {h.nombre_finca}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full capitalize"
                    style={{ background: '#edfaf4', color: '#1D7A4E' }}>
                    {h.tipo_qr}
                  </span>
                </div>

                {h.nombre_cafeteria && (
                  <p className="text-stone-400 text-xs mb-3">
                    📍 {h.nombre_cafeteria} · {h.municipio}
                  </p>
                )}

                {/* Valoración si existe */}
                {h.cafe_experiencia && (
                  <div className="flex items-center gap-3 pt-3"
                    style={{ borderTop: '1px solid #edfaf4' }}>
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className="text-sm"
                          style={{ color: s <= h.cafe_experiencia ? '#D4A847' : '#e2e8f0' }}>
                          ★
                        </span>
                      ))}
                    </div>
                    {h.comentario && (
                      <p className="text-stone-400 text-xs italic line-clamp-1">&quot;{h.comentario}&quot;</p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <p className="text-stone-300 text-xs">
                    {new Date(h.escaneado_en).toLocaleDateString('es-CO', {
                      day:'numeric', month:'long', year:'numeric'
                    })}
                  </p>
                  {h.puntos_ganados > 0 && (
                    <span className="text-xs font-medium" style={{ color: '#1D7A4E' }}>
                      +{h.puntos_ganados} pts ✨
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}