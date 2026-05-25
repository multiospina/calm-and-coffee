import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Coffee, Star, ChevronLeft, QrCode, Map, List, Phone, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../../api/axios';

// Fix iconos Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Icono personalizado verde para cafeterías
const cafeIcon = new L.DivIcon({
  html: `<div style="
    width:36px;height:36px;border-radius:50% 50% 50% 0;
    background:linear-gradient(135deg,#0F4A2E,#1D7A4E);
    border:3px solid white;
    box-shadow:0 4px 12px rgba(29,122,78,0.4);
    display:flex;align-items:center;justify-content:center;
    transform:rotate(-45deg);
  ">
    <span style="transform:rotate(45deg);font-size:16px;">☕</span>
  </div>`,
  className: '',
  iconSize:   [36, 36],
  iconAnchor: [18, 36],
  popupAnchor:[0, -36],
});

// Componente para centrar el mapa en una cafetería
function CentrarMapa({ centro }) {
  const map = useMap();
  useEffect(() => {
    if (centro) map.flyTo(centro, 16, { duration: 1.2 });
  }, [centro]);
  return null;
}

export default function ExplorarCafes() {
  const navigate = useNavigate();
  const [cafeterias,   setCafeterias]   = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [menu,         setMenu]         = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [cargandoMenu, setCargandoMenu] = useState(false);
  const [vistaActiva,  setVistaActiva]  = useState('lista'); // lista | mapa
  const [centraMapa,   setCentraMapa]   = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/cliente/cafeterias');
        setCafeterias(res.data.cafeterias || []);
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
    setVistaActiva('lista');
    try {
      const res = await api.get(`/cliente/cafeterias/${cafeteria.id}/menu`);
      setMenu(res.data.menu || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoMenu(false);
    }
  };

  const handleMarkerClick = (c) => {
    setCentraMapa([parseFloat(c.latitud), parseFloat(c.longitud)]);
    setSeleccionada(c);
    verMenu(c);
  };

  // Centro de Fusagasugá
  const centroFusa = [4.3365, -74.3644];

  // Cafeterías con coordenadas
  const conCoordenadas = cafeterias.filter(c => c.latitud && c.longitud);

  if (cargando) return (
    <div className="flex justify-center py-20">
      <div className="w-7 h-7 border-2 border-green-200 border-t-green-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">

      {/* ── HEADER ── */}
      {seleccionada ? (
        <div className="flex items-center gap-3">
          <button onClick={() => { setSeleccionada(null); setMenu([]); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:'white', border:'1px solid #A8E8CC' }}>
            <ChevronLeft size={18} color="#1D7A4E" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-serif font-bold text-stone-800 text-lg truncate">
              {seleccionada.nombre}
            </h2>
            <div className="flex items-center gap-1">
              <MapPin size={11} color="#94A3B8" />
              <p className="text-xs text-stone-400">{seleccionada.municipio}</p>
              {seleccionada.rating && (
                <>
                  <span className="text-stone-300 mx-1">·</span>
                  <Star size={11} color="#D4A847" fill="#D4A847" />
                  <span className="text-xs font-bold" style={{ color:'#8A6200' }}>{seleccionada.rating}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-stone-800 text-xl">Cafeterías</h2>
            <p className="text-stone-400 text-sm mt-0.5">
              {cafeterias.length} cafeterías disponibles
            </p>
          </div>
          {/* Toggle lista/mapa */}
          <div className="flex rounded-2xl overflow-hidden"
            style={{ border:'1.5px solid #A8E8CC' }}>
            <button onClick={() => setVistaActiva('lista')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition"
              style={{
                background: vistaActiva==='lista' ? '#1D7A4E' : 'white',
                color:      vistaActiva==='lista' ? 'white'   : '#1D7A4E',
              }}>
              <List size={13} />
              Lista
            </button>
            <button onClick={() => setVistaActiva('mapa')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition"
              style={{
                background: vistaActiva==='mapa' ? '#1D7A4E' : 'white',
                color:      vistaActiva==='mapa' ? 'white'   : '#1D7A4E',
              }}>
              <Map size={13} />
              Mapa
            </button>
          </div>
        </div>
      )}

      {/* ── MAPA INTERACTIVO ── */}
      {vistaActiva === 'mapa' && !seleccionada && (
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden"
            style={{ height:'380px', border:'1.5px solid #A8E8CC',
              boxShadow:'0 4px 24px rgba(29,122,78,0.15)' }}>
            <MapContainer
              center={centroFusa}
              zoom={14}
              style={{ height:'100%', width:'100%' }}
              zoomControl={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {centraMapa && <CentrarMapa centro={centraMapa} />}
              {conCoordenadas.map((c,i) => (
                <Marker
                  key={i}
                  position={[parseFloat(c.latitud), parseFloat(c.longitud)]}
                  icon={cafeIcon}
                  eventHandlers={{ click: () => handleMarkerClick(c) }}>
                  <Popup>
                    <div style={{ minWidth:'160px' }}>
                      <p style={{ fontWeight:'bold', marginBottom:'4px' }}>{c.nombre}</p>
                      <p style={{ fontSize:'12px', color:'#666', marginBottom:'4px' }}>
                        📍 {c.direccion}
                      </p>
                      {c.rating && (
                        <p style={{ fontSize:'12px', color:'#D4A847', marginBottom:'6px' }}>
                          ★ {c.rating}
                        </p>
                      )}
                      <button
                        onClick={() => verMenu(c)}
                        style={{
                          background:'#1D7A4E', color:'white',
                          border:'none', borderRadius:'8px',
                          padding:'6px 12px', fontSize:'12px',
                          cursor:'pointer', width:'100%', fontWeight:'bold'
                        }}>
                        Ver menú →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Cards mini debajo del mapa */}
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth:'none' }}>
            {conCoordenadas.map((c,i) => (
              <button key={i}
                onClick={() => handleMarkerClick(c)}
                className="flex-shrink-0 rounded-2xl p-3 text-left transition active:scale-95"
                style={{
                  background:'white', border:'1.5px solid #A8E8CC',
                  minWidth:'160px', maxWidth:'160px'
                }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                  style={{ background:'#EDFAF4' }}>
                  <Coffee size={15} color="#1D7A4E" />
                </div>
                <p className="font-semibold text-stone-800 text-xs leading-tight mb-0.5">
                  {c.nombre}
                </p>
                <p className="text-stone-400" style={{ fontSize:'10px' }}>{c.direccion}</p>
                {c.rating && (
                  <div className="flex items-center gap-0.5 mt-1">
                    <Star size={10} color="#D4A847" fill="#D4A847" />
                    <span style={{ fontSize:'10px', color:'#8A6200', fontWeight:'bold' }}>
                      {c.rating}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── LISTA CAFETERÍAS ── */}
      {vistaActiva === 'lista' && !seleccionada && (
        <div className="space-y-3">
          {cafeterias.map((c,i) => (
            <button key={i} onClick={() => verMenu(c)}
              className="w-full rounded-2xl p-5 text-left transition active:scale-95"
              style={{ background:'white', border:'1px solid #A8E8CC',
                boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-bold text-stone-800 text-lg">{c.nombre}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={11} color="#94A3B8" />
                    <p className="text-stone-400 text-sm">{c.municipio}</p>
                    {c.direccion && (
                      <span className="text-stone-300 text-xs">· {c.direccion}</span>
                    )}
                  </div>
                </div>
                {c.rating && (
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
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
                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ background:'#EDFAF4', color:'#1D7A4E' }}>
                    {c.cosechas_activas || 0} cafés disponibles
                  </span>
                  {c.latitud && (
                    <button
                      onClick={e => { e.stopPropagation(); setVistaActiva('mapa'); setCentraMapa([parseFloat(c.latitud), parseFloat(c.longitud)]); }}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                      style={{ background:'#EBF2FF', color:'#1B4F8A' }}>
                      <Map size={11} />
                      Ver en mapa
                    </button>
                  )}
                </div>
                <span className="text-green-600 text-sm font-bold">Ver menú →</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── MENÚ DE CAFETERÍA ── */}
      {seleccionada && (
        cargandoMenu ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-2 border-green-200 border-t-green-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">

            {/* Info cafetería */}
            {seleccionada.descripcion && (
              <div className="rounded-2xl p-4"
                style={{ background:'#EDFAF4', border:'1px solid #A8E8CC' }}>
                <p className="text-sm text-stone-600 leading-relaxed">{seleccionada.descripcion}</p>
                {seleccionada.latitud && (
                  <button
                    onClick={() => { setVistaActiva('mapa'); setCentraMapa([parseFloat(seleccionada.latitud), parseFloat(seleccionada.longitud)]); setSeleccionada(null); setMenu([]); }}
                    className="flex items-center gap-1.5 mt-2 text-xs font-bold"
                    style={{ color:'#1D7A4E' }}>
                    <Map size={12} />
                    Ver en el mapa
                  </button>
                )}
              </div>
            )}

            {menu.length === 0 ? (
              <div className="rounded-2xl py-12 text-center"
                style={{ background:'white', border:'1px solid #E2E8F0' }}>
                <Coffee size={28} color="#E2E8F0" className="mx-auto mb-3" />
                <p className="font-serif text-stone-400 font-semibold">Sin cafés disponibles</p>
                <p className="text-stone-300 text-sm mt-1">Esta cafetería aún no tiene menú activo</p>
              </div>
            ) : (
              menu.map((item,i) => (
                <div key={i} className="rounded-2xl p-5"
                  style={{ background:'white', border:'1px solid #A8E8CC',
                    boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-stone-800">{item.nombre}</h3>
                      <p className="text-stone-400 text-xs mt-0.5 capitalize">
                        {item.variedad} · {item.proceso}
                      </p>
                      {item.nombre_finca && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={10} color="#94A3B8" />
                          <p className="text-stone-400 text-xs">
                            {item.nombre_finca} · {item.altitud_msnm} msnm
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <p className="font-bold text-stone-800 text-lg">
                        ${parseInt(item.precio).toLocaleString('es-CO')}
                      </p>
                      {item.rating && (
                        <div className="flex items-center gap-0.5 justify-end mt-0.5">
                          <Star size={11} color="#D4A847" fill="#D4A847" />
                          <span className="text-xs font-bold" style={{ color:'#8A6200' }}>{item.rating}</span>
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
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                        style={{ background:'#EDFAF4', color:'#1D7A4E' }}>
                        <QrCode size={13} />
                        Trazabilidad
                      </button>
                    )}
                    <button
                      onClick={() => item.stock > 0 && navigate(`/cliente/pedido/${seleccionada.id}/${item.id}`)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold transition active:scale-95"
                      style={{
                        background: item.stock > 0 ? '#1D7A4E' : '#E2E8F0',
                        color:      item.stock > 0 ? 'white'   : '#9CA3AF',
                        cursor:     item.stock > 0 ? 'pointer' : 'not-allowed',
                      }}>
                      {item.stock > 0 ? 'Pedir ahora →' : 'Agotado'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )
      )}
    </div>
  );
}
