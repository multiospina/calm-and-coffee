import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Coffee, Star, ChevronLeft, QrCode,
  Map, List, Leaf, Award, ChevronRight,
  Navigation, TrendingUp, Package, X,
  Sparkles, ArrowRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../../api/axios';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const cafeIcon = new L.DivIcon({
  html: `<div style="position:relative;width:44px;height:48px;">
    <div style="
      position:absolute;inset:0;
      border-radius:50% 50% 50% 0;
      background:linear-gradient(135deg,#0F4A2E,#1D7A4E,#259E65);
      border:3px solid white;
      box-shadow:0 6px 20px rgba(29,122,78,0.5);
      display:flex;align-items:center;justify-content:center;
      transform:rotate(-45deg);
    ">
      <span style="transform:rotate(45deg);font-size:18px;">☕</span>
    </div>
  </div>`,
  className:'', iconSize:[44,48], iconAnchor:[22,48], popupAnchor:[0,-48],
});

const cafeIconActivo = new L.DivIcon({
  html: `<div style="position:relative;width:52px;height:56px;">
    <div style="
      position:absolute;inset:0;
      border-radius:50% 50% 50% 0;
      background:linear-gradient(135deg,#0F3366,#1B4F8A);
      border:3px solid white;
      box-shadow:0 8px 24px rgba(27,79,138,0.6);
      display:flex;align-items:center;justify-content:center;
      transform:rotate(-45deg);
    ">
      <span style="transform:rotate(45deg);font-size:22px;">☕</span>
    </div>
  </div>`,
  className:'', iconSize:[52,56], iconAnchor:[26,56], popupAnchor:[0,-56],
});

function CentrarMapa({ centro }) {
  const map = useMap();
  useEffect(() => {
    if (centro) map.flyTo(centro, 16, { duration:1.5 });
  }, [centro]);
  return null;
}

const PROCESO_COLOR = {
  natural: { bg:'#FFF8E1', color:'#8A6200' },
  lavado:  { bg:'#EBF2FF', color:'#1B4F8A' },
  honey:   { bg:'#FFF0EB', color:'#C0350F' },
};

// Skeleton card
const SkeletonCard = () => (
  <div className="rounded-3xl overflow-hidden animate-pulse"
    style={{ background:'white', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
    <div className="h-1.5" style={{ background:'#E2E8F0' }} />
    <div className="p-5 space-y-3">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-2xl" style={{ background:'#F0F2F5' }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded-xl w-3/4" style={{ background:'#F0F2F5' }} />
          <div className="h-3 rounded-xl w-1/2" style={{ background:'#F0F2F5' }} />
        </div>
      </div>
      <div className="h-3 rounded-xl" style={{ background:'#F0F2F5' }} />
      <div className="h-3 rounded-xl w-4/5" style={{ background:'#F0F2F5' }} />
    </div>
  </div>
);

export default function ExplorarCafes() {
  const navigate = useNavigate();
  const [cafeterias,     setCafeterias]     = useState([]);
  const [seleccionada,   setSeleccionada]   = useState(null);
  const [menu,           setMenu]           = useState([]);
  const [cargando,       setCargando]       = useState(true);
  const [cargandoMenu,   setCargandoMenu]   = useState(false);
  const [vistaActiva,    setVistaActiva]    = useState('lista');
  const [centraMapa,     setCentraMapa]     = useState(null);
  const [marcadorActivo, setMarcadorActivo] = useState(null);
  const [modalCafe,      setModalCafe]      = useState(null);

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
    setModalCafe(null);
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
    setModalCafe(c);
  };

  const volver = () => {
    setSeleccionada(null);
    setMenu([]);
    setMarcadorActivo(null);
  };

  const centroFusa     = [4.3365, -74.3644];
  const conCoordenadas = cafeterias.filter(c => c.latitud && c.longitud);

  // Variantes de animación
  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } }
  };
  const cardVariants = {
    hidden: { opacity:0, y:24, scale:0.97 },
    show:   { opacity:1, y:0,  scale:1, transition:{ type:'spring', stiffness:260, damping:22 } },
    exit:   { opacity:0, y:-16, scale:0.97, transition:{ duration:0.2 } }
  };
  const slideUp = {
    hidden: { opacity:0, y:40 },
    show:   { opacity:1, y:0,  transition:{ type:'spring', stiffness:280, damping:25 } },
    exit:   { opacity:0, y:40, transition:{ duration:0.2 } }
  };

  return (
    <div className="space-y-4">

      {/* ── HEADER HERO ── */}
      <AnimatePresence mode="wait">
        {seleccionada ? (
          <motion.div key="header-detail"
            variants={slideUp} initial="hidden" animate="show" exit="exit"
            className="rounded-3xl overflow-hidden"
            style={{ boxShadow:'0 8px 32px rgba(29,122,78,0.25)' }}>
            <div className="px-5 py-5 relative overflow-hidden"
              style={{ background:'linear-gradient(135deg,#0F4A2E 0%,#1D7A4E 100%)' }}>
              <motion.div
                className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10"
                style={{ background:'white' }}
                animate={{ scale:[1,1.1,1], rotate:[0,10,0] }}
                transition={{ duration:8, repeat:Infinity }} />
              <div className="flex items-start gap-3 relative">
                <motion.button onClick={volver}
                  whileTap={{ scale:0.9 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:'rgba(255,255,255,0.15)' }}>
                  <ChevronLeft size={18} color="white" />
                </motion.button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold tracking-widest mb-0.5"
                    style={{ color:'rgba(255,255,255,0.5)' }}>MENÚ DE ESPECIALIDAD</p>
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
                      <motion.div
                        initial={{ scale:0 }} animate={{ scale:1 }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{ background:'rgba(212,168,71,0.25)' }}>
                        <Star size={11} color="#D4A847" fill="#D4A847" />
                        <span className="text-xs font-bold" style={{ color:'#D4A847' }}>
                          {seleccionada.rating}
                        </span>
                      </motion.div>
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
          </motion.div>
        ) : (
          <motion.div key="header-list"
            variants={slideUp} initial="hidden" animate="show" exit="exit"
            className="rounded-3xl overflow-hidden"
            style={{ boxShadow:'0 8px 32px rgba(29,122,78,0.3)' }}>
            <div className="px-5 py-5 relative overflow-hidden"
              style={{ background:'linear-gradient(135deg,#0F4A2E 0%,#1D7A4E 100%)' }}>
              <motion.div
                className="absolute -top-8 -right-8 w-44 h-44 rounded-full opacity-10"
                style={{ background:'white' }}
                animate={{ scale:[1,1.15,1], rotate:[0,15,0] }}
                transition={{ duration:10, repeat:Infinity }} />
              <motion.div
                className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-8"
                style={{ background:'white' }}
                animate={{ scale:[1,1.2,1] }}
                transition={{ duration:7, repeat:Infinity, delay:1 }} />
              <div className="flex items-center justify-between relative">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={12} color="rgba(255,255,255,0.6)" />
                    <p className="text-xs font-bold tracking-widest"
                      style={{ color:'rgba(255,255,255,0.5)' }}>DESCUBRE</p>
                  </div>
                  <h2 className="font-serif font-bold text-white text-xl">
                    Cafeterías de especialidad
                  </h2>
                  <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.6)' }}>
                    {cafeterias.length} lugares en Fusagasugá
                  </p>
                </div>
                {/* Toggle animado */}
                <div className="flex rounded-2xl overflow-hidden flex-shrink-0"
                  style={{ border:'1.5px solid rgba(255,255,255,0.2)', background:'rgba(0,0,0,0.15)' }}>
                  {['lista','mapa'].map(v => (
                    <motion.button key={v}
                      onClick={() => setVistaActiva(v)}
                      whileTap={{ scale:0.93 }}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all relative"
                      style={{ color:'white' }}>
                      {vistaActiva === v && (
                        <motion.div layoutId="tabIndicator"
                          className="absolute inset-0 rounded-xl"
                          style={{ background:'rgba(255,255,255,0.2)' }}
                          transition={{ type:'spring', stiffness:400, damping:30 }} />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        {v === 'lista' ? <List size={13} /> : <Map size={13} />}
                        {v === 'lista' ? 'Lista' : 'Mapa'}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAPA ── */}
      <AnimatePresence>
        {vistaActiva === 'mapa' && !seleccionada && (
          <motion.div key="mapa"
            initial={{ opacity:0, scale:0.97 }}
            animate={{ opacity:1, scale:1 }}
            exit={{ opacity:0, scale:0.97 }}
            transition={{ type:'spring', stiffness:260, damping:24 }}
            className="space-y-3">
            <div className="rounded-3xl overflow-hidden"
              style={{ height:'400px', border:'2px solid #A8E8CC',
                boxShadow:'0 8px 32px rgba(29,122,78,0.2)' }}>
              <MapContainer center={centroFusa} zoom={14}
                style={{ height:'100%', width:'100%' }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {centraMapa && <CentrarMapa centro={centraMapa} />}
                {conCoordenadas.map((c,i) => (
                  <Marker key={i}
                    position={[parseFloat(c.latitud), parseFloat(c.longitud)]}
                    icon={marcadorActivo===c.id ? cafeIconActivo : cafeIcon}
                    eventHandlers={{ click:() => handleMarkerClick(c) }}>
                    <Popup>
                      <div style={{ minWidth:'180px', fontFamily:'sans-serif' }}>
                        <div style={{
                          background:'linear-gradient(135deg,#0F4A2E,#1D7A4E)',
                          margin:'-8px -12px 10px', padding:'12px',
                          borderRadius:'8px 8px 0 0'
                        }}>
                          <p style={{ color:'white', fontWeight:'bold', fontSize:'14px', margin:0 }}>
                            {c.nombre}
                          </p>
                        </div>
                        <p style={{ fontSize:'11px', color:'#666', marginBottom:'6px' }}>
                          📍 {c.direccion || c.municipio}
                        </p>
                        {c.rating && (
                          <p style={{ fontSize:'12px', color:'#D4A847', marginBottom:'8px' }}>
                            ★ {c.rating} · {c.cosechas_activas||0} cafés
                          </p>
                        )}
                        <button onClick={() => verMenu(c)}
                          style={{
                            background:'linear-gradient(135deg,#0F4A2E,#1D7A4E)',
                            color:'white', border:'none', borderRadius:'10px',
                            padding:'8px 14px', fontSize:'12px',
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

            {/* Cards horizontales */}
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth:'none' }}>
              {conCoordenadas.map((c,i) => (
                <motion.button key={i}
                  onClick={() => handleMarkerClick(c)}
                  initial={{ opacity:0, x:20 }}
                  animate={{ opacity:1, x:0 }}
                  transition={{ delay:i*0.07 }}
                  whileTap={{ scale:0.95 }}
                  className="flex-shrink-0 rounded-2xl overflow-hidden text-left"
                  style={{
                    background:'white', minWidth:'170px', maxWidth:'170px',
                    border: marcadorActivo===c.id ? '2px solid #1D7A4E' : '1.5px solid #E2E8F0',
                    boxShadow: marcadorActivo===c.id
                      ? '0 4px 20px rgba(29,122,78,0.25)' : '0 2px 8px rgba(0,0,0,0.06)',
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
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Modal bottom sheet al clickear marcador */}
            <AnimatePresence>
              {modalCafe && (
                <motion.div
                  initial={{ opacity:0, y:60 }}
                  animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, y:60 }}
                  transition={{ type:'spring', stiffness:300, damping:28 }}
                  className="rounded-3xl overflow-hidden"
                  style={{ background:'white', border:'2px solid #A8E8CC',
                    boxShadow:'0 -4px 32px rgba(29,122,78,0.2)' }}>
                  <div className="h-1.5"
                    style={{ background:'linear-gradient(90deg,#0F4A2E,#1D7A4E,#259E65)' }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-serif font-bold text-stone-800 text-lg">
                          {modalCafe.nombre}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin size={11} color="#94A3B8" />
                          <p className="text-xs text-stone-400">
                            {modalCafe.direccion || modalCafe.municipio}
                          </p>
                          {modalCafe.rating && (
                            <>
                              <span className="text-stone-300">·</span>
                              <Star size={11} color="#D4A847" fill="#D4A847" />
                              <span className="text-xs font-bold" style={{ color:'#8A6200' }}>
                                {modalCafe.rating}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <motion.button onClick={() => setModalCafe(null)}
                        whileTap={{ scale:0.9 }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background:'#F8F9FA' }}>
                        <X size={14} color="#94A3B8" />
                      </motion.button>
                    </div>
                    {modalCafe.descripcion && (
                      <p className="text-stone-500 text-sm leading-relaxed mb-4 line-clamp-2">
                        {modalCafe.descripcion}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale:0.95 }}
                        onClick={() => verMenu(modalCafe)}
                        className="flex-1 py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
                        style={{ background:'linear-gradient(135deg,#0F4A2E,#1D7A4E)' }}>
                        <Coffee size={15} />
                        Ver menú completo
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LISTA CAFETERÍAS ── */}
      <AnimatePresence>
        {vistaActiva === 'lista' && !seleccionada && (
          cargando ? (
            <motion.div key="skeletons"
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="space-y-3">
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </motion.div>
          ) : (
            <motion.div key="lista"
              variants={containerVariants}
              initial="hidden" animate="show"
              className="space-y-3">
              {cafeterias.map((c,i) => (
                <motion.button key={c.id}
                  variants={cardVariants}
                  whileHover={{ y:-3, boxShadow:'0 12px 32px rgba(29,122,78,0.15)' }}
                  whileTap={{ scale:0.98 }}
                  onClick={() => verMenu(c)}
                  className="w-full rounded-3xl overflow-hidden text-left"
                  style={{ background:'white', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
                  <div className="h-1.5"
                    style={{ background:'linear-gradient(90deg,#0F4A2E,#1D7A4E,#259E65)' }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <motion.div
                          whileHover={{ rotate:[0,-5,5,0] }}
                          transition={{ duration:0.4 }}
                          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background:'linear-gradient(135deg,#EDFAF4,#D4F5E5)' }}>
                          <Coffee size={20} color="#1D7A4E" />
                        </motion.div>
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
                      {c.rating && (
                        <motion.div
                          initial={{ scale:0, rotate:-10 }}
                          animate={{ scale:1, rotate:0 }}
                          transition={{ delay:i*0.08+0.2, type:'spring' }}
                          className="flex flex-col items-center flex-shrink-0 ml-2">
                          <div className="w-11 h-11 rounded-2xl flex flex-col items-center justify-center"
                            style={{ background:'linear-gradient(135deg,#FFF8E1,#FFE082)' }}>
                            <Star size={13} color="#D4A847" fill="#D4A847" />
                            <span className="text-xs font-bold leading-none mt-0.5"
                              style={{ color:'#8A6200' }}>
                              {c.rating}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {c.descripcion && (
                      <p className="text-stone-500 text-sm leading-relaxed mb-3 line-clamp-2">
                        {c.descripcion}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3"
                      style={{ borderTop:'1px solid #F0FFF8' }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <motion.span
                          whileHover={{ scale:1.05 }}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background:'#EDFAF4', color:'#1D7A4E' }}>
                          <Coffee size={10} />
                          {c.cosechas_activas || 0} cafés
                        </motion.span>
                        {c.latitud && (
                          <motion.button
                            whileTap={{ scale:0.93 }}
                            onClick={e => {
                              e.stopPropagation();
                              setVistaActiva('mapa');
                              setCentraMapa([parseFloat(c.latitud), parseFloat(c.longitud)]);
                              setMarcadorActivo(c.id);
                            }}
                            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{ background:'#EBF2FF', color:'#1B4F8A' }}>
                            <Navigation size={10} />
                            Ubicación
                          </motion.button>
                        )}
                      </div>
                      <motion.div
                        className="flex items-center gap-1"
                        style={{ color:'#1D7A4E' }}
                        whileHover={{ x:3 }}>
                        <span className="text-xs font-bold">Ver menú</span>
                        <ArrowRight size={14} />
                      </motion.div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* ── MENÚ CAFETERÍA ── */}
      <AnimatePresence>
        {seleccionada && (
          <motion.div key="menu"
            initial="hidden" animate="show"
            variants={containerVariants}
            className="space-y-3">

            {/* Info cafetería */}
            {seleccionada.descripcion && (
              <motion.div variants={cardVariants}
                className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background:'#F0FFF8', border:'1px solid #A8E8CC' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:'#EDFAF4' }}>
                  <Award size={15} color="#1D7A4E" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-stone-600 leading-relaxed">{seleccionada.descripcion}</p>
                  {seleccionada.latitud && (
                    <motion.button
                      whileTap={{ scale:0.95 }}
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
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}

            {cargandoMenu ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : menu.length === 0 ? (
              <motion.div variants={cardVariants}
                className="rounded-3xl py-14 text-center"
                style={{ background:'white', border:'1px solid #E2E8F0' }}>
                <motion.div
                  animate={{ rotate:[0,-10,10,0] }}
                  transition={{ duration:2, repeat:Infinity }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background:'#F0FFF8' }}>
                  <Coffee size={24} color="#A8E8CC" />
                </motion.div>
                <p className="font-serif text-stone-400 font-semibold mb-1">Sin menú activo</p>
                <p className="text-stone-300 text-sm">Esta cafetería aún no ha publicado su carta</p>
              </motion.div>
            ) : (
              <>
                <motion.div variants={cardVariants}
                  className="flex items-center gap-2 px-1">
                  <TrendingUp size={14} color="#1D7A4E" />
                  <p className="text-xs font-bold tracking-wider" style={{ color:'#1D7A4E' }}>
                    CAFÉS DE ESPECIALIDAD — {menu.length} disponibles
                  </p>
                </motion.div>

                {menu.map((item,i) => {
                  const proceso = PROCESO_COLOR[item.proceso] || PROCESO_COLOR.lavado;
                  return (
                    <motion.div key={i}
                      variants={cardVariants}
                      whileHover={{ y:-2, boxShadow:'0 12px 28px rgba(0,0,0,0.1)' }}
                      className="rounded-3xl overflow-hidden"
                      style={{ background:'white', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
                      <div className="h-1"
                        style={{ background:'linear-gradient(90deg,#0F4A2E,#1D7A4E,#259E65)' }} />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <motion.div
                              whileHover={{ scale:1.1, rotate:-5 }}
                              transition={{ type:'spring', stiffness:300 }}
                              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                              style={{ background:'linear-gradient(135deg,#EDFAF4,#D4F5E5)' }}>
                              <Coffee size={20} color="#1D7A4E" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-serif font-bold text-stone-800 text-base leading-tight">
                                {item.nombre}
                              </h3>
                              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                {item.variedad && (
                                  <motion.span
                                    initial={{ scale:0 }} animate={{ scale:1 }}
                                    transition={{ delay:i*0.05+0.1 }}
                                    className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                                    style={{ background:'#F3EEF5', color:'#6B3A8A' }}>
                                    {item.variedad}
                                  </motion.span>
                                )}
                                {item.proceso && (
                                  <motion.span
                                    initial={{ scale:0 }} animate={{ scale:1 }}
                                    transition={{ delay:i*0.05+0.15 }}
                                    className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                                    style={{ background:proceso.bg, color:proceso.color }}>
                                    {item.proceso}
                                  </motion.span>
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
                              {item.nombre_finca}{item.altitud_msnm && ` · ${item.altitud_msnm} msnm`}
                            </p>
                          </div>
                        )}

                        {item.descripcion && (
                          <p className="text-stone-500 text-sm mb-3 leading-relaxed line-clamp-2">
                            {item.descripcion}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 mb-3">
                          <Package size={11} color={item.stock > 0 ? '#1D7A4E' : '#DC2626'} />
                          <span className="text-xs font-medium"
                            style={{ color: item.stock > 0 ? '#1D7A4E' : '#DC2626' }}>
                            {item.stock > 0 ? `${item.stock} tazas disponibles` : 'Agotado'}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {item.qr_codigo && (
                            <motion.button
                              whileTap={{ scale:0.95 }}
                              onClick={() => navigate(`/trazabilidad/${item.qr_codigo}`)}
                              className="flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5"
                              style={{ background:'#F0FFF8', color:'#1D7A4E', border:'1.5px solid #A8E8CC' }}>
                              <QrCode size={13} />
                              Ver historia
                            </motion.button>
                          )}
                          <motion.button
                            whileTap={{ scale: item.stock > 0 ? 0.95 : 1 }}
                            onClick={() => item.stock > 0 && navigate(`/cliente/pedido/${seleccionada.id}/${item.id}`)}
                            className="flex-1 py-3 rounded-2xl text-xs font-bold"
                            style={{
                              background: item.stock > 0
                                ? 'linear-gradient(135deg,#0F4A2E,#1D7A4E)'
                                : '#F1F5F9',
                              color:  item.stock > 0 ? 'white' : '#94A3B8',
                              cursor: item.stock > 0 ? 'pointer' : 'not-allowed',
                            }}>
                            {item.stock > 0 ? 'Pedir ahora →' : 'No disponible'}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
