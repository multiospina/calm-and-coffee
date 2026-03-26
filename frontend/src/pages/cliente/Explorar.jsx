import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function ClienteExplorar() {
  const navigate = useNavigate();
  const [cafeterias, setCafeterias]   = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [menu, setMenu]               = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [cargandoMenu, setCargandoMenu] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/cliente/cafeterias');
        setCafeterias(res.data.cafeterias);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const verMenu = async (cafeteria) => {
    setSeleccionada(cafeteria);
    setCargandoMenu(true);
    try {
      const res = await api.get(`/cliente/cafeterias/${cafeteria.id}/menu`);
      setMenu(res.data.menu);
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoMenu(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#f0fff8' }}>
      {/* Navigation */}
      <nav className="px-6 py-4 flex items-center justify-between" style={{ background: '#1D7A4E' }}>
        <button
          onClick={() => {
            if (seleccionada) {
              setSeleccionada(null);
              setMenu([]);
            } else {
              navigate('/cliente');
            }
          }}
          className="text-green-200 hover:text-white text-sm transition"
        >
          ← {seleccionada ? 'Cafeterías' : 'Dashboard'}
        </button>
        <span className="text-white font-serif font-semibold">
          {seleccionada ? seleccionada.nombre : 'Explorar'}
        </span>
        <div />
      </nav>

      {/* Content */}
      <div className="max-w-lg mx-auto px-5 py-8">
        {!seleccionada ? (
          <>
            {/* Cafeterias List */}
            <div className="mb-6">
              <h1 className="font-serif text-2xl font-bold text-stone-800">Cafeterías</h1>
              <p className="text-stone-500 text-sm mt-1">Descubre los cafés de especialidad cerca de ti</p>
            </div>

            {cargando ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {cafeterias.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => verMenu(c)}
                    className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md transition"
                    style={{ border: '1px solid #A8E8CC' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-serif font-bold text-stone-800 text-lg">{c.nombre}</h3>
                        <p className="text-stone-400 text-sm">📍 {c.municipio}</p>
                      </div>
                      {c.rating && (
                        <div className="text-center">
                          <div className="text-amber-500 font-bold">★ {c.rating}</div>
                        </div>
                      )}
                    </div>
                    {c.descripcion && (
                      <p className="text-stone-500 text-sm leading-relaxed mb-3">{c.descripcion}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ background: '#edfaf4', color: '#1D7A4E' }}
                      >
                        {c.cosechas_activas} cafés disponibles
                      </span>
                      <span className="text-green-600 text-sm font-medium">Ver menú →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Menu */}
            <div className="mb-6">
              <h2 className="font-serif text-xl font-bold text-stone-800">Menú de especialidad</h2>
              <p className="text-stone-500 text-sm mt-1">
                {seleccionada.direccion} · {seleccionada.municipio}
              </p>
            </div>

            {cargandoMenu ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {menu.map((item, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-5"
                    style={{ border: '1px solid #A8E8CC' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-stone-800">{item.nombre}</h3>
                        <p className="text-stone-400 text-xs mt-0.5 capitalize">
                          {item.variedad} · {item.proceso}
                        </p>
                        {item.nombre_finca && (
                          <p className="text-stone-400 text-xs">
                            {item.nombre_finca} · {item.municipio_finca} · {item.altitud_msnm} msnm
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-3">
                        <p className="font-bold text-stone-800">
                          ${parseInt(item.precio).toLocaleString('es-CO')}
                        </p>
                        {item.rating && <p className="text-amber-500 text-xs">★ {item.rating}</p>}
                      </div>
                    </div>

                    {item.descripcion && (
                      <p className="text-stone-500 text-sm mb-3 leading-relaxed">{item.descripcion}</p>
                    )}

                    <div className="flex gap-2">
                      {item.qr_codigo && (
                        <button
                          onClick={() => navigate(`/trazabilidad/${item.qr_codigo}`)}
                          className="flex-1 py-2 rounded-xl text-xs font-medium transition"
                          style={{ background: '#edfaf4', color: '#1D7A4E' }}
                        >
                          Ver trazabilidad ☕
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.stock > 0) {
                            navigate(`/cliente/pedido/${seleccionada.id}/${item.id}`);
                          }
                        }}
                        className="flex-1 py-2 rounded-xl text-xs font-medium transition"
                        style={{
                          background: item.stock > 0 ? '#1D7A4E' : '#e2e8f0',
                          color: item.stock > 0 ? 'white' : '#9CA3AF',
                          cursor: item.stock > 0 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {item.stock > 0 ? 'Pedir ahora →' : 'Agotado'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}