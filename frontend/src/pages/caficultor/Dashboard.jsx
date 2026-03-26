import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function CaficultorDashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [fincas,   setFincas]   = useState([]);
  const [cosechas, setCosechas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [fRes, cRes] = await Promise.all([
          api.get('/caficultor/fincas'),
          api.get('/caficultor/cosechas'),
        ]);
        setFincas(fRes.data.fincas);
        setCosechas(cRes.data.cosechas);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const cosechasActivas = cosechas.filter(c => c.estado === 'activa');
  const cosechasCerradas = cosechas.filter(c => c.estado === 'cerrada' || c.estado === 'asignada');

  return (
    <div className="min-h-screen" style={{ background: '#f8f5ff' }}>

      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between" style={{ background: '#3D1A5C' }}>
        <div className="flex items-center gap-3">
  <img src="/logo.png" alt="C&C"
  className="w-9 h-9 object-contain" />
          <div>
            <span className="text-white font-serif font-semibold">Calm and Coffee</span>
            <span className="text-purple-300 text-xs ml-2">· Caficultor</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-purple-300 text-sm">{usuario?.nombre}</span>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-purple-400 hover:text-white text-xs transition"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Saludo */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-bold text-stone-800">
            Bienvenido, {usuario?.nombre?.split(' ')[0]} 👋
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Gestiona tus fincas, cosechas y genera los QR de trazabilidad
          </p>
        </div>

        {cargando ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Mis fincas',         value: fincas.length,          color: '#3D1A5C' },
                { label: 'Cosechas activas',   value: cosechasActivas.length,  color: '#6B3A8A' },
                { label: 'Cosechas cerradas',  value: cosechasCerradas.length, color: '#259E65' },
                { label: 'Total cosechas',     value: cosechas.length,         color: '#C0350F' },
              ].map((m, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
                  <div className="text-3xl font-bold font-serif mb-1" style={{ color: m.color }}>
                    {m.value}
                  </div>
                  <div className="text-stone-500 text-xs">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Mis fincas */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-bold text-stone-800">Mis fincas</h2>
                <button
                  onClick={() => navigate('/caficultor/fincas')}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium transition"
                >
                  Ver todas →
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {fincas.map(f => (
                  <div key={f.id} className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-stone-800">{f.nombre}</h3>
                        <p className="text-stone-400 text-xs mt-0.5">
                          {f.municipio}, {f.departamento} · {f.altitud_msnm} msnm
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ background: '#f3eef5', color: '#6B3A8A' }}>
                        {f.total_cosechas} cosechas
                      </span>
                    </div>
                    {f.historia && (
                      <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">{f.historia}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs px-2 py-1 rounded-lg" style={{ background: '#f8f5ff', color: '#3D1A5C' }}>
                        {f.total_lotes} lotes
                      </span>
                      {f.proceso_principal && (
                        <span className="text-xs px-2 py-1 rounded-lg" style={{ background: '#f8f5ff', color: '#3D1A5C' }}>
                          {f.proceso_principal}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cosechas */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-bold text-stone-800">Mis cosechas</h2>
                <button
                  onClick={() => navigate('/caficultor/cosechas')}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium transition"
                >
                  Ver todas →
                </button>
              </div>
              <div className="space-y-3">
                {cosechas.slice(0, 5).map(c => (
                  <div key={c.id}
                    onClick={() => navigate(`/caficultor/cosechas/${c.id}`)}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 flex items-center justify-between cursor-pointer hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: c.estado === 'activa' ? '#f3eef5' : '#edfaf4' }}>
                        <span className="text-lg">{c.estado === 'activa' ? '🌱' : '✅'}</span>
                      </div>
                      <div>
                        <p className="font-medium text-stone-800 text-sm">{c.variedad}</p>
                        <p className="text-stone-400 text-xs">
                          {c.proceso} · {c.nombre_finca} · {new Date(c.fecha_inicio).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {c.qr_codigo && (
                        <span className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ background: '#edfaf4', color: '#1D7A4E' }}>
                          QR listo
                        </span>
                      )}
                      <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{
                          background: c.estado === 'activa' ? '#f3eef5' : '#edfaf4',
                          color: c.estado === 'activa' ? '#6B3A8A' : '#1D7A4E'
                        }}>
                        {c.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}