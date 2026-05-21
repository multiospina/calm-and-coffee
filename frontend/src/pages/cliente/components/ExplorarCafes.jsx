import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Coffee, Star, ChevronLeft, QrCode } from 'lucide-react';
import api from '../../../api/axios';

export default function ExplorarCafes() {
  const navigate = useNavigate();
  const [cafeterias,   setCafeterias]   = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [menu,         setMenu]         = useState([]);
  const [cargando,     setCargando]     = useState(true);
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

  if (cargando) return (
    <div className="flex justify-center py-20">
      <div className="w-7 h-7 border-2 border-green-200 border-t-green-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Header */}
      {seleccionada ? (
        <div className="flex items-center gap-3">
          <button onClick={() => { setSeleccionada(null); setMenu([]); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:'white', border:'1px solid #A8E8CC' }}>
            <ChevronLeft size={18} color="#1D7A4E" />
          </button>
          <div>
            <h2 className="font-serif font-bold text-stone-800 text-lg">{seleccionada.nombre}</h2>
            <p className="text-xs text-stone-400">{seleccionada.municipio}</p>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="font-serif font-bold text-stone-800 text-xl">Cafeterías</h2>
          <p className="text-stone-400 text-sm mt-0.5">Descubre los cafés de especialidad</p>
        </div>
      )}

      {/* Lista cafeterías */}
      {!seleccionada && (
        <div className="space-y-3">
          {cafeterias.map((c,i) => (
            <button key={i} onClick={() => verMenu(c)}
              className="w-full rounded-2xl p-5 text-left transition active:scale-95"
              style={{ background:'white', border:'1px solid #A8E8CC' }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-serif font-bold text-stone-800 text-lg">{c.nombre}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={11} color="#94A3B8" />
                    <p className="text-stone-400 text-sm">{c.municipio}</p>
                  </div>
                </div>
                {c.rating && (
                  <div className="flex items-center gap-1">
                    <Star size={13} color="#D4A847" fill="#D4A847" />
                    <span className="font-bold text-sm" style={{ color:'#8A6200' }}>{c.rating}</span>
                  </div>
                )}
              </div>
              {c.descripcion && (
                <p className="text-stone-500 text-sm leading-relaxed mb-3 line-clamp-2">
                  {c.descripcion}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background:'#EDFAF4', color:'#1D7A4E' }}>
                  {c.cosechas_activas} cafés disponibles
                </span>
                <span className="text-green-600 text-sm font-medium">Ver menú →</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Menú de cafetería */}
      {seleccionada && (
        cargandoMenu ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-2 border-green-200 border-t-green-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {menu.map((item,i) => (
              <div key={i} className="rounded-2xl p-5"
                style={{ background:'white', border:'1px solid #A8E8CC' }}>
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
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="font-bold text-stone-800">
                      ${parseInt(item.precio).toLocaleString('es-CO')}
                    </p>
                    {item.rating && (
                      <div className="flex items-center gap-0.5 justify-end">
                        <Star size={11} color="#D4A847" fill="#D4A847" />
                        <span className="text-xs" style={{ color:'#8A6200' }}>{item.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                {item.descripcion && (
                  <p className="text-stone-500 text-sm mb-3 leading-relaxed">{item.descripcion}</p>
                )}
                <div className="flex gap-2">
                  {item.qr_codigo && (
                    <button onClick={() => navigate(`/trazabilidad/${item.qr_codigo}`)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
                      style={{ background:'#EDFAF4', color:'#1D7A4E' }}>
                      <QrCode size={13} />
                      Trazabilidad
                    </button>
                  )}
                  <button
                    onClick={() => item.stock > 0 && navigate(`/cliente/pedido/${seleccionada.id}/${item.id}`)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white"
                    style={{
                      background: item.stock > 0 ? '#1D7A4E' : '#E2E8F0',
                      color:      item.stock > 0 ? 'white'   : '#9CA3AF',
                      cursor:     item.stock > 0 ? 'pointer' : 'not-allowed',
                    }}>
                    {item.stock > 0 ? 'Pedir ahora →' : 'Agotado'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
