import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Coffee, Star, ChevronLeft, QrCode,
  Map, List, Clock, Leaf, Award, ChevronRight,
  Navigation, TrendingUp, Package
} from 'lucide-react';
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

// Icono premium para marcadores
const cafeIcon = new L.DivIcon({
  html: `<div style="
    position:relative;
    width:44px;height:44px;
  ">
    <div style="
      position:absolute;inset:0;
      border-radius:50% 50% 50% 0;
      background:linear-gradient(135deg,#0F4A2E 0%,#1D7A4E 50%,#259E65 100%);
      border:3px solid white;
      box-shadow:0 6px 20px rgba(29,122,78,0.5), 0 2px 8px rgba(0,0,0,0.2);
      display:flex;align-items:center;justify-content:center;
      transform:rotate(-45deg);
    ">
      <span style="transform:rotate(45deg);font-size:18px;line-height:1;">☕</span>
    </div>
    <div style="
      position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);
      width:8px;height:8px;border-radius:50%;
      background:#1D7A4E;opacity:0.3;
    "></div>
  </div>`,
  className: '',
  iconSize:   [44, 48],
  iconAnchor: [22, 48],
  popupAnchor:[0, -48],
});

// Icono seleccionado — más grande y animado
const cafeIconActivo = new L.DivIcon({
  html: `<div style="position:relative;width:52px;height:56px;">
    <div style="
      position:absolute;inset:0;
      border-radius:50% 50% 50% 0;
      background:linear-gradient(135deg,#0F3366 0%,#1B4F8A 100%);
      border:3px solid white;
      box-shadow:0 8px 24px rgba(27,79,138,0.6), 0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      transform:rotate(-45deg);
      animation:pulse 1.5s infinite;
    ">
      <span style="transform:rotate(45deg);font-size:22px;line-height:1;">☕</span>
    </div>
  </div>`,
  className: '',
  iconSize:   [52, 56],
  iconAnchor: [26, 56],
  popupAnchor:[0, -56],
});

function CentrarMapa({ centro }) {
  const map = useMap();
  useEffect(() => {
    if (centro) map.flyTo(centro, 16, { duration: 1.5, easeLinearity: 0.25 });
  }, [centro]);
  return null;
}

const PROCESO_COLOR = {
  natural: { bg:'#FFF8E1', color:'#8A6200', label:'Natural' },
  lavado:  { bg:'#EBF2FF', color:'#1B4F8A', label:'Lavado'  },
  honey:   { bg:'#FFF0EB', color:'#C0350F', label:'Honey'   },
};

export default function ExplorarCafes() {
  const navigate = useNavigate();
  const [cafeterias,   setCafeterias]   = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [menu,         setMenu]         = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [cargandoMenu, setCargandoMenu] = useState(false);
  const [vistaActiva,  setVistaActiva]  = useState('lista');
  const [centraMapa,   setCentraMapa]   = useState(null);
  const [marcadorActivo, setMarcadorActivo] = useState(null);

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
    setMarcadorActivo(cafeteria.id);
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
    setMarcadorActivo(c.id);
    verMenu(c);
  };

  const volver = () => {
    setSeleccionada(null);
    setMenu([]);
    setMarcadorActivo(null);
  };

  const centroFusa   = [4.3365, -74.3644];
  const conCoordenadas = cafeterias.filter(c => c.latitud && c.longitud);

  if (cargando) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-2 border-green-100 border-t-green-500 rounded-full animate-spin" />
      <p className="text-stone-400 text-sm">Cargando cafeterías...</p>
    </div>
  );

  return (
    <div className="space-y-4">

      {/* ── HEADER ── */}
      {seleccionada ? (
        <div className="rounded-3xl overflow-hidden"
          style={{ boxShadow:'0 8px 32px rgba(29,122,78,0.25)' }}>
          <div className="px-5 py-5 relative overflow-hidden"
            style={{ background:'linear-gradient(135deg, #0F4A2E 0%, #1D7A4E 100%)' }}>
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10"
              style={{ background:'white' }} />
            <div className="flex items-start gap-3 relative">
              <button onClick={volver}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background:'rgba(255,255,255,0.15)' }}>
                <ChevronLeft size={18} color="white" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold tracking-widest mb-0.5"
                  style={{ color:'rgba(255,255,255,0.5)' }}>
                  MENÚ DE ESPECIALIDAD
                </p>
                <h2 className="font-serif font-bold text-white text-xl leading-tight">
                  {seleccionada.nombre}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <div className="flex items-center gap-1">
                    <MapPin size={11} color="rgba(255,255,255,0.6)" />
                    <p className="text-xs" style={{ color:'rgba(255,255,255,0.6)' }}>
                      {seleccionada.direccion || seleccionada.municipio}
                    </p>
                  </div>
                  {seleccionada.rating && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ background:'rgba(212,168,71,0.2)' }}>
                      <Star size={11} color="#D4A847" fill="#D4A847" />
                      <span className="text-xs font-bold" style={{ color:'#D4A847' }}>
                        {seleccionada.rating}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background:'rgba(255,255,255,0.12)' }}>
                    <Coffee size={10} color="rgba(255,255,255,0.7)" />
                    <span className="text-xs" style={{ color:'rgba(255,255,255,0.7)' }}>
                      {menu.length} cafés
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Hero explorar */}
          <div className="rounded-3xl overflow-hidden mb-4"
            style={{ background:'linear-gradient(135deg, #0F4A2E 0%, #1D7A4E 100%)',
              boxShadow:'0 8px 32px rgba(29,122,78,0.3)' }}>
            <div className="px-5 py-5 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10"
                style={{ background:'white' }} />
              <div className="flex items-center justify-between relative">
                <div>
                  <p className="text-xs font-bold tracking-widest mb-1"
                    style={{ color:'rgba(255,255,255,0.5)' }}>
                    DESCUBRE
                  </p>
                  <h2 className="font-serif font-bold text-white text-xl">
                    Cafeterías de especialidad
                  </h2>
                  <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.6)' }}>
                    {cafeterias.length} lugares en Fusagasugá
                  </p>
                </div>
                {/* Toggle */}
                <div className="flex rounded-2xl overflow-hidden flex-shrink-0"
                  style={{ border:'1.5px solid rgba(255,255,255,0.2)' }}>
                  <button onClick={() => setVistaActiva('lista')}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition"
                    style={{
                      background: vistaActiva==='lista' ? 'rgba(255,255,255,0.2)' : 'transparent',
                      color:      'white',
                    }}>
                    <List size={13} />
                    Lista
                  </button>
                  <button onClick={() => setVistaActiva('mapa')}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition"
                    style={{
                      background: vistaActiva==='mapa' ? 'rgba(255,255,255,0.2)' : 'transparent',
                      color:      'white',
                    }}>
                    <Map size={13} />
                    Mapa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MAPA ── */}
      {vistaActiva === 'mapa' && !seleccionada && (
        <div className="space-y-3">
          <div className="rounded-3xl overflow-hidden"
            style={{ height:'400px', border:'2px solid #A8E8CC',
              boxShadow:'0 8px 32px rgba(29,122,78,0.2)' }}>
            <MapContainer center={centroFusa} zoom={14}
              style={{ height:'100%', width:'100%' }} zoomControl={true}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {centraMapa && <CentrarMapa centro={centraMapa} />}
              {conCoordenadas.map((c,i) => (
                <Marker
                  key={i}
                  position={[parseFloat(c.latitud), parseFloat(c.longitud)]}
                  icon={marcadorActivo === c.id ? cafeIconActivo : cafeIcon}
                  eventHandlers={{ click: () => handleMarkerClick(c) }}>
                  <Popup>
                    <div style={{ minWidth:'180px', fontFamily:'sans-serif' }}>
                      <div style={{
                        background:'linear-gradient(135deg,#0F4A2E,#1D7A4E)',
                        margin:'-8px -12px 10px',
                        padding:'12px',borderRadius:'8px 8px 0 0'
                      }}>
                        <p style={{ color:'white', fontWeight:'bold', fontSize:'14px', margin:0 }}>
                          {c.nombre}
                        </p>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'4px', marginBottom:'6px' }}>
                        <span style={{ fontSize:'11px', color:'#666' }}>📍 {c.direccion || c.municipio}</span>
                      </div>
                      {c.rating && (
                        <div style={{ display:'flex', alignItems:'center', gap:'4px', marginBottom:'8px' }}>
                          <span style={{ color:'#D4A847', fontSize:'12px' }}>★</span>
                          <span style={{ fontSize:'12px', fontWeight:'bold', color:'#8A6200' }}>{c.rating}</span>
                          <span style={{ fontSize:'11px', color:'#999' }}>· {c.cosechas_activas || 0} cafés</span>
                        </div>
                      )}
                      {c.descripcion && (
                        <p style={{ fontSize:'11px', color:'#555', marginBottom:'8px', lineHeight:'1.4' }}>
                          {c.descripcion.slice(0,80)}...
                        </p>
                      )}
                      <button onClick={() => verMenu(c)}
                        style={{
                          background:'linear-gradient(135deg,#0F4A2E,#1D7A4E)',
                          color:'white', border:'none',
                          borderRadius:'10px', padding:'8px 14px',
                          fontSize:'12px', cursor:'pointer',
                          width:'100%', fontWeight:'bold'
                        }}>
                        Ver menú →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Cards horizontales */}
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth:'none' }}>
            {conCoordenadas.map((c,i) => (
              <button key={i} onClick={() => handleMarkerClick(c)}
                className="flex-shrink-0 rounded-2xl overflow-hidden text-left transition active:scale-95"
                style={{
                  background:'white',
                  border: marcadorActivo===c.id ? '2px solid #1D7A4E' : '1.5px solid #E2E8F0',
                  minWidth:'170px', maxWidth:'170px',
                  boxShadow: marcadorActivo===c.id
                    ? '0 4px 20px rgba(29,122,78,0.25)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                <div className="h-1.5"
                  style={{ background:'linear-gradient(90deg,#0F4A2E,#259E65)' }} />
                <div className="p-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                    style={{ background:'#EDFAF4' }}>
                    <Coffee size={15} color="#1D7A4E" />
                  </div>
                  <p className="font-serif font-bold text-stone-800 text-xs leading-tight mb-1">
                    {c.nombre}
                  </p>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin size={9} color="#94A3B8" />
                    <p style={{ fontSize:'10px' }} className="text-stone-400 truncate">
                      {c.direccion || c.municipio}
                    </p>
                  </div>
                  {c.rating && (
                    <div className="flex items-center gap-0.5">
                      <Star size={10} color="#D4A847" fill="#D4A847" />
                      <span style={{ fontSize:'10px', color:'#8A6200', fontWeight:'bold' }}>
                        {c.rating}
                      </span>
                      <span style={{ fontSize:'9px' }} className="text-stone-300 ml-1">
                        · {c.cosechas_activas||0} cafés
                      </span>
                    </div>
                  )}
                </div>
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
              className="w-full rounded-3xl overflow-hidden text-left transition active:scale-95"
              style={{ background:'white', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
              {/* Barra superior gradiente */}
              <div className="h-1.5"
                style={{ background:'linear-gradient(90deg, #0F4A2E, #1D7A4E, #259E65)' }} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background:'linear-gradient(135deg,#EDFAF4,#D4F5E5)' }}>
                      <Coffee size={20} color="#1D7A4E" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-bold text-stone-800 text-base leading-tight">
                        {c.nombre}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={10} color="#94A3B8" />
                        <p className="text-stone-400 text-xs truncate">
                          {c.direccion || c.municipio}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Rating */}
                  {c.rating && (
                    <div className="flex flex-col items-center flex-shrink-0 ml-2">
                      <div className="w-10 h-10 rounded-2xl flex flex-col items-center justify-center"
                        style={{ background:'#FFF8E1' }}>
                        <Star size={13} color="#D4A847" fill="#D4A847" />
                        <span className="text-xs font-bold leading-none mt-0.5"
                          style={{ color:'#8A6200' }}>
                          {c.rating}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {c.descripcion && (
                  <p className="text-stone-500 text-sm leading-relaxed mb-3 line-clamp-2">
                    {c.descripcion}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3"
                  style={{ borderTop:'1px solid #F0FFF8' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background:'#EDFAF4', color:'#1D7A4E' }}>
                      <Coffee size={10} />
                      {c.cosechas_activas || 0} cafés
                    </span>
                    {c.latitud && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setVistaActiva('mapa');
                          setCentraMapa([parseFloat(c.latitud), parseFloat(c.longitud)]);
                          setMarcadorActivo(c.id);
                        }}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background:'#EBF2FF', color:'#1B4F8A' }}>
                        <Navigation size={10} />
                        Mapa
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1"
                    style={{ color:'#1D7A4E' }}>
                    <span className="text-xs font-bold">Ver menú</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── MENÚ CAFETERÍA ── */}
      {seleccionada && (
        cargandoMenu ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-2 border-green-100 border-t-green-500 rounded-full animate-spin" />
            <p className="text-stone-400 text-sm">Cargando menú...</p>
          </div>
        ) : (
          <div className="space-y-3">

            {/* Descripción cafetería */}
            {seleccionada.descripcion && (
              <div className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background:'#F0FFF8', border:'1px solid #A8E8CC' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:'#EDFAF4' }}>
                  <Award size={15} color="#1D7A4E" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-stone-600 leading-relaxed">{seleccionada.descripcion}</p>
                  {seleccionada.latitud && (
                    <button
                      onClick={() => {
                        setVistaActiva('mapa');
                        setCentraMapa([parseFloat(seleccionada.latitud), parseFloat(seleccionada.longitud)]);
                        setSeleccionada(null);
                        setMenu([]);
                      }}
                      className="flex items-center gap-1.5 mt-2 text-xs font-bold"
                      style={{ color:'#1D7A4E' }}>
                      <Navigation size={12} />
                      Cómo llegar
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Label menú */}
            {menu.length > 0 && (
              <div className="flex items-center gap-2 px-1">
                <TrendingUp size={14} color="#1D7A4E" />
                <p className="text-xs font-bold tracking-wider" style={{ color:'#1D7A4E' }}>
                  CAFÉS DE ESPECIALIDAD — {menu.length} disponibles
                </p>
              </div>
            )}

            {menu.length === 0 ? (
              <div className="rounded-3xl py-14 text-center"
                style={{ background:'white', border:'1px solid #E2E8F0' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background:'#F0FFF8' }}>
                  <Coffee size={24} color="#A8E8CC" />
                </div>
                <p className="font-serif text-stone-400 font-semibold mb-1">Sin menú activo</p>
                <p className="text-stone-300 text-sm">Esta cafetería aún no ha publicado su carta</p>
              </div>
            ) : (
              menu.map((item,i) => {
                const proceso = PROCESO_COLOR[item.proceso] || PROCESO_COLOR.lavado;
                return (
                  <div key={i} className="rounded-3xl overflow-hidden"
                    style={{ background:'white', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
                    <div className="h-1"
                      style={{ background:'linear-gradient(90deg, #0F4A2E, #1D7A4E, #259E65)' }} />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background:'linear-gradient(135deg,#EDFAF4,#D4F5E5)' }}>
                            <Coffee size={20} color="#1D7A4E" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-serif font-bold text-stone-800 text-base leading-tight">
                              {item.nombre}
                            </h3>
                            <div className="flex gap-1.5 mt-1.5 flex-wrap">
                              {item.variedad && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                                  style={{ background:'#F3EEF5', color:'#6B3A8A' }}>
                                  {item.variedad}
                                </span>
                              )}
                              {item.proceso && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                                  style={{ background:proceso.bg, color:proceso.color }}>
                                  {proceso.label}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="font-serif font-bold text-stone-800 text-xl">
                            ${parseInt(item.precio).toLocaleString('es-CO')}
                          </p>
                          {item.rating && (
                            <div className="flex items-center gap-0.5 justify-end mt-0.5">
                              <Star size={12} color="#D4A847" fill="#D4A847" />
                              <span className="text-xs font-bold" style={{ color:'#8A6200' }}>
                                {item.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {item.nombre_finca && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Leaf size={11} color="#1D7A4E" />
                          <p className="text-xs text-stone-400">
                            {item.nombre_finca}
                            {item.altitud_msnm && ` · ${item.altitud_msnm} msnm`}
                          </p>
                        </div>
                      )}

                      {item.descripcion && (
                        <p className="text-stone-500 text-sm mb-3 leading-relaxed line-clamp-2">
                          {item.descripcion}
                        </p>
                      )}

                      {/* Stock */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <Package size={11} color={item.stock > 0 ? '#1D7A4E' : '#DC2626'} />
                        <span className="text-xs font-medium"
                          style={{ color: item.stock > 0 ? '#1D7A4E' : '#DC2626' }}>
                          {item.stock > 0 ? `${item.stock} tazas disponibles` : 'Agotado'}
                        </span>
                      </div>

                      {/* Botones */}
                      <div className="flex gap-2">
                        {item.qr_codigo && (
                          <button onClick={() => navigate(`/trazabilidad/${item.qr_codigo}`)}
                            className="flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                            style={{ background:'#F0FFF8', color:'#1D7A4E',
                              border:'1.5px solid #A8E8CC' }}>
                            <QrCode size={13} />
                            Ver historia
                          </button>
                        )}
                        <button
                          onClick={() => item.stock > 0 && navigate(`/cliente/pedido/${seleccionada.id}/${item.id}`)}
                          className="flex-1 py-3 rounded-2xl text-xs font-bold transition active:scale-95"
                          style={{
                            background: item.stock > 0
                              ? 'linear-gradient(135deg,#0F4A2E,#1D7A4E)'
                              : '#F1F5F9',
                            color:  item.stock > 0 ? 'white' : '#94A3B8',
                            cursor: item.stock > 0 ? 'pointer' : 'not-allowed',
                          }}>
                          {item.stock > 0 ? 'Pedir ahora →' : 'No disponible'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )
      )}
    </div>
  );
}
