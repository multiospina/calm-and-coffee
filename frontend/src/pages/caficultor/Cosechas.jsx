import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function CaficultorCosechas() {
  const navigate = useNavigate();
  const [cosechas, setCosechas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cerrando, setCerrando] = useState(null);

  useEffect(() => {
    cargarCosechas();
  }, []);

  const cargarCosechas = async () => {
    try {
      const res = await api.get('/caficultor/cosechas');
      setCosechas(res.data.cosechas);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const cerrarCosecha = async (id) => {
    if (!window.confirm('¿Cerrar esta cosecha y generar el QR? Esta acción es irreversible.')) return;
    setCerrando(id);
    try {
      const res = await api.post(`/caficultor/cosechas/${id}/cerrar`);
      alert(`✅ QR generado: ${res.data.qr_codigo}`);
      cargarCosechas();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cerrar cosecha');
    } finally {
      setCerrando(null);
    }
  };

  const estadoColor = {
    activa:   { bg: '#f3eef5', text: '#6B3A8A' },
    cerrada:  { bg: '#edfaf4', text: '#1D7A4E' },
    asignada: { bg: '#ebf2ff', text: '#1B4F8A' },
  };

  return (
    <div className="min-h-screen" style={{ background: '#f8f5ff' }}>

      <nav className="px-6 py-4 flex items-center justify-between" style={{ background: '#3D1A5C' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/caficultor')}
            className="text-purple-300 hover:text-white text-sm transition">
            ← Dashboard
          </button>
          <span className="text-purple-600">|</span>
          <span className="text-white font-serif font-semibold">Mis Cosechas</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-stone-800">Mis cosechas</h1>
            <p className="text-stone-500 text-sm mt-1">Gestiona y genera los QR de trazabilidad</p>
          </div>
        </div>

        {cargando ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {cosechas.map(c => (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: estadoColor[c.estado]?.bg || '#f8f5ff' }}>
                        <span className="text-xl">
                          {c.estado === 'activa' ? '🌱' : c.estado === 'cerrada' ? '✅' : '🏪'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-800">{c.variedad}</h3>
                        <p className="text-stone-400 text-xs mt-0.5">
                          {c.nombre_finca} · {c.proceso} · {new Date(c.fecha_inicio).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ background: estadoColor[c.estado]?.bg, color: estadoColor[c.estado]?.text }}>
                      {c.estado}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 rounded-xl" style={{ background: '#f8f5ff' }}>
                      <div className="font-bold text-stone-700">{c.total_etapas || 0}</div>
                      <div className="text-stone-400 text-xs">Etapas</div>
                    </div>
                    <div className="text-center p-3 rounded-xl" style={{ background: '#f8f5ff' }}>
                      <div className="font-bold text-stone-700">{c.kg_producidos || c.kg_estimados || '—'}</div>
                      <div className="text-stone-400 text-xs">Kg</div>
                    </div>
                    <div className="text-center p-3 rounded-xl" style={{ background: '#f8f5ff' }}>
                      <div className="font-bold text-stone-700">{c.total_cafeterias || 0}</div>
                      <div className="text-stone-400 text-xs">Cafeterías</div>
                    </div>
                  </div>

                  {/* QR si existe */}
                  {c.qr_codigo && (
                    <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl"
                      style={{ background: '#edfaf4', border: '1px solid #A8E8CC' }}>
                      <span className="text-green-600 text-sm">✅</span>
                      <span className="text-green-700 text-xs font-medium font-mono">{c.qr_codigo}</span>
                      <button
                        onClick={() => navigate(`/trazabilidad/${c.qr_codigo}`)}
                        className="ml-auto text-xs text-green-600 hover:text-green-800 font-medium transition">
                        Ver trazabilidad →
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/caficultor/cosechas/${c.id}`)}
                      className="flex-1 py-2 rounded-xl text-xs font-medium transition"
                      style={{ background: '#f3eef5', color: '#6B3A8A' }}>
                      Ver detalle
                    </button>
                    {c.estado === 'activa' && (
                      <button
                        onClick={() => cerrarCosecha(c.id)}
                        disabled={cerrando === c.id}
                        className="flex-1 py-2 rounded-xl text-xs font-medium text-white transition"
                        style={{ background: cerrando === c.id ? '#9CA3AF' : '#1D7A4E' }}>
                        {cerrando === c.id ? 'Generando QR...' : '✅ Cerrar y generar QR'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}