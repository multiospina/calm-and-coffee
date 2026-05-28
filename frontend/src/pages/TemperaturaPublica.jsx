import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Wifi, WifiOff, Coffee, Droplets, Flame, Wind, Star } from 'lucide-react';
import api from '../api/axios';

const ZONAS = {
  Z_HOT:   { label:'MUY CALIENTE',  emoji:'🔥', color:'#DC2626', bg:'#FEF2F2', borde:'#FECACA', sub:'Espera a que enfríe un poco', consejo:'Libera sus aceites esenciales' },
  Z_COOL:  { label:'ENFRIANDO...',  emoji:'♨️', color:'#EA580C', bg:'#FFF7ED', borde:'#FED7AA', sub:'Ya casi llega al punto ideal', consejo:'Los aromas florales emergen' },
  Z_IDEAL: { label:'¡PERFECTO!',    emoji:'✨', color:'#16A34A', bg:'#F0FFF4', borde:'#86EFAC', sub:'Temperatura ideal SCA 55-65°C', consejo:'¡Ahora es el momento de catar!' },
  Z_WARM:  { label:'TIBIO',         emoji:'☕', color:'#D97706', bg:'#FFFBEB', borde:'#FDE68A', sub:'Bébelo pronto antes que enfríe', consejo:'El cuerpo se percibe muy bien' },
  Z_COLD:  { label:'SE ENFRIÓ',     emoji:'🧊', color:'#2563EB', bg:'#EFF6FF', borde:'#BFDBFE', sub:'Sirve otro o recalienta', consejo:'La temperatura bajó demasiado' },
  sin_datos:{ label:'CONECTANDO...', emoji:'📡', color:'#6B7280', bg:'#F9FAFB', borde:'#E5E7EB', sub:'Esperando datos del sensor', consejo:'El ESP32 se está conectando' },
  desconocida:{ label:'LEYENDO...', emoji:'🌡️', color:'#6B7280', bg:'#F9FAFB', borde:'#E5E7EB', sub:'Procesando datos', consejo:'Un momento...' },
};

function BarraTemp({ temp }) {
  const pct = Math.min(Math.max(((temp - 20) / (95 - 20)) * 100, 0), 100);
  return (
    <div className="w-full">
      <div className="relative h-6 rounded-full overflow-hidden"
        style={{ background:'#F1F5F9' }}>
        {/* Gradiente de zonas */}
        <div className="absolute inset-0 rounded-full"
          style={{ background:'linear-gradient(90deg, #3B82F6 0%, #F59E0B 35%, #22C55E 55%, #F97316 75%, #EF4444 100%)' }} />
        {/* Marcador */}
        <motion.div
          className="absolute top-0 bottom-0 w-1 rounded-full"
          style={{ background:'white', boxShadow:'0 0 8px rgba(0,0,0,0.4)', left:`${pct}%` }}
          animate={{ left:`${pct}%` }}
          transition={{ type:'spring', stiffness:60, damping:15 }} />
      </div>
      {/* Etiquetas */}
      <div className="flex justify-between mt-1">
        {[['20°', '#3B82F6'], ['55°', '#22C55E'], ['65°', '#22C55E'], ['95°', '#EF4444']].map(([l, c]) => (
          <span key={l} className="text-xs font-bold" style={{ color: c }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function NumeroAnimado({ valor }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span key={Math.round(valor * 10)}
        initial={{ opacity:0, y:-20, scale:0.8 }}
        animate={{ opacity:1, y:0, scale:1 }}
        exit={{ opacity:0, y:20, scale:0.8 }}
        transition={{ type:'spring', stiffness:300, damping:25 }}>
        {valor !== null ? valor.toFixed(1) : '--.-'}
      </motion.span>
    </AnimatePresence>
  );
}

export default function TemperaturaPublica() {
  const [datos,     setDatos]     = useState(null);
  const [historial, setHistorial] = useState([]);
  const [parpadeo,  setParpadeo]  = useState(false);
  const intervalRef = useRef(null);

  const fetchTemp = async () => {
    try {
      const res = await api.get('/temperatura');
      const d   = res.data;
      setDatos(d);
      setParpadeo(true);
      setTimeout(() => setParpadeo(false), 400);
      if (d.temperatura !== null) {
        setHistorial(prev => {
          const nuevo = [...prev, { t: d.temperatura, ts: Date.now() }];
          return nuevo.slice(-30); // últimos 30 datos
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTemp();
    intervalRef.current = setInterval(fetchTemp, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const zona   = datos ? (ZONAS[datos.zona] || ZONAS.desconocida) : ZONAS.sin_datos;
  const temp   = datos?.temperatura;
  const online = datos?.conectado;

  // Mini gráfica últimas lecturas
  const maxH = 80;
  const minT = Math.min(...historial.map(h => h.t), 20);
  const maxT = Math.max(...historial.map(h => h.t), 95);

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background:'linear-gradient(160deg, #0c0a08 0%, #1a0f00 50%, #0c0a08 100%)' }}>

      {/* ── HEADER ── */}
      <div className="px-5 pt-8 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background:'rgba(146,64,14,0.4)', border:'1px solid rgba(146,64,14,0.6)' }}>
                <Coffee size={16} color="#D97706" />
              </div>
              <div>
                <p className="font-serif text-white text-sm font-bold">Calm and Coffee</p>
                <p className="text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>CEA · 2026</p>
              </div>
            </div>
            {/* Indicador conexión */}
            <motion.div
              animate={{ opacity: parpadeo ? 0.5 : 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: online ? 'rgba(22,163,74,0.2)' : 'rgba(107,114,128,0.2)',
                border: `1px solid ${online ? 'rgba(22,163,74,0.4)' : 'rgba(107,114,128,0.4)'}`,
              }}>
              {online
                ? <Wifi size={12} color="#22C55E" />
                : <WifiOff size={12} color="#6B7280" />
              }
              <span className="text-xs font-bold"
                style={{ color: online ? '#22C55E' : '#6B7280' }}>
                {online ? 'EN VIVO' : 'OFFLINE'}
              </span>
              {online && (
                <motion.div className="w-1.5 h-1.5 rounded-full"
                  style={{ background:'#22C55E' }}
                  animate={{ opacity:[1,0,1] }}
                  transition={{ duration:1, repeat:Infinity }} />
              )}
            </motion.div>
          </div>

          {/* Título */}
          <div className="text-center mt-4 mb-2">
            <p className="text-xs font-bold tracking-widest mb-1"
              style={{ color:'rgba(255,255,255,0.4)' }}>
              TEMPERATURA DE LA TAZA EN TIEMPO REAL
            </p>
            <h1 className="font-serif text-white text-2xl font-bold">
              V60 · Café Sumapaz
            </h1>
            <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.5)' }}>
              Sensor LM75 · ESP32 · Universidad de Cundinamarca
            </p>
          </div>
        </div>
      </div>

      {/* ── TEMPERATURA PRINCIPAL ── */}
      <div className="flex-1 px-5 pb-8">
        <div className="max-w-lg mx-auto space-y-4">

          {/* Card temperatura */}
          <motion.div
            animate={{
              borderColor: zona.borde,
              boxShadow: `0 0 40px ${zona.color}30, 0 8px 32px rgba(0,0,0,0.4)`
            }}
            transition={{ duration:0.5 }}
            className="rounded-3xl overflow-hidden"
            style={{ background:'rgba(255,255,255,0.05)', border:`2px solid ${zona.borde}` }}>

            {/* Zona banner */}
            <motion.div
              animate={{ background: zona.color }}
              className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ scale:[1,1.2,1] }}
                  transition={{ duration:1, repeat:Infinity }}
                  className="text-xl">
                  {zona.emoji}
                </motion.span>
                <div>
                  <p className="font-bold text-white text-sm">{zona.label}</p>
                  <p className="text-xs" style={{ color:'rgba(255,255,255,0.8)' }}>
                    {zona.consejo}
                  </p>
                </div>
              </div>
              <Thermometer size={24} color="rgba(255,255,255,0.8)" />
            </motion.div>

            <div className="p-6">
              {/* Número grande */}
              <div className="text-center mb-6">
                <div className="flex items-start justify-center gap-2 mb-1">
                  <motion.p
                    className="font-serif font-bold leading-none"
                    style={{ fontSize:'96px', color: zona.color,
                      textShadow:`0 0 40px ${zona.color}60` }}>
                    <NumeroAnimado valor={temp} />
                  </motion.p>
                  <div className="mt-4">
                    <p className="font-bold text-3xl" style={{ color: zona.color }}>°C</p>
                  </div>
                </div>
                <motion.p className="text-sm font-medium"
                  style={{ color:'rgba(255,255,255,0.6)' }}>
                  {zona.sub}
                </motion.p>
              </div>

              {/* Barra */}
              {temp !== null && <BarraTemp temp={temp} />}

              {/* Zona ideal */}
              <div className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl"
                style={{ background:'rgba(22,163,74,0.1)', border:'1px solid rgba(22,163,74,0.3)' }}>
                <Star size={13} color="#22C55E" fill="#22C55E" />
                <p className="text-xs font-bold" style={{ color:'#22C55E' }}>
                  Temperatura ideal SCA: 55°C — 65°C
                </p>
                <Star size={13} color="#22C55E" fill="#22C55E" />
              </div>
            </div>
          </motion.div>

          {/* Mini gráfica historial */}
          {historial.length > 2 && (
            <motion.div
              initial={{ opacity:0, y:20 }}
              animate={{ opacity:1, y:0 }}
              className="rounded-3xl p-5"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Droplets size={14} color="#60A5FA" />
                <p className="text-xs font-bold tracking-wider"
                  style={{ color:'rgba(255,255,255,0.5)' }}>
                  ÚLTIMAS LECTURAS
                </p>
              </div>
              <svg width="100%" height={maxH} style={{ overflow:'visible' }}>
                {/* Línea ideal */}
                {[55, 65].map(t => {
                  const y = maxH - ((t - minT) / (maxT - minT)) * maxH;
                  return (
                    <line key={t} x1="0" y1={y} x2="100%" y2={y}
                      stroke="#22C55E" strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
                  );
                })}
                {/* Línea temperatura */}
                <polyline
                  fill="none"
                  stroke={zona.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={historial.map((h, i) => {
                    const x = (i / (historial.length - 1)) * 100 + '%';
                    const y = maxH - ((h.t - minT) / (maxT - minT)) * maxH;
                    return `${(i / (historial.length - 1)) * 320},${y}`;
                  }).join(' ')}
                />
                {/* Punto actual */}
                {historial.length > 0 && (() => {
                  const last = historial[historial.length - 1];
                  const y = maxH - ((last.t - minT) / (maxT - minT)) * maxH;
                  return (
                    <circle cx="320" cy={y} r="5"
                      fill={zona.color} stroke="white" strokeWidth="2" />
                  );
                })()}
              </svg>
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>
                  Hace {Math.round(historial.length * 3 / 60)} min
                </span>
                <span className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>
                  Ahora
                </span>
              </div>
            </motion.div>
          )}

          {/* Métricas V60 */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Flame,       label:'Extracción', value:'92°C',   color:'#EF4444', bg:'rgba(239,68,68,0.1)'   },
              { icon: Coffee,      label:'Ratio',      value:'1:15',   color:'#D97706', bg:'rgba(217,119,6,0.1)'   },
              { icon: Wind,        label:'Tiempo',     value:'3-4min', color:'#60A5FA', bg:'rgba(96,165,250,0.1)'  },
            ].map((m,i) => (
              <motion.div key={i}
                initial={{ opacity:0, scale:0.9 }}
                animate={{ opacity:1, scale:1 }}
                transition={{ delay:i*0.1 }}
                className="rounded-2xl p-3 text-center"
                style={{ background:m.bg, border:`1px solid ${m.color}30` }}>
                <m.icon size={18} color={m.color} className="mx-auto mb-1" />
                <p className="font-bold text-sm" style={{ color:m.color }}>{m.value}</p>
                <p className="text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>{m.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Footer info */}
          <div className="text-center pt-2 pb-4">
            <p className="text-xs" style={{ color:'rgba(255,255,255,0.25)' }}>
              Actualiza cada 3 segundos · Pedro Ospina & Danna Carrillo
            </p>
            <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.2)' }}>
              Reto de Ingeniería III · Universidad de Cundinamarca · 2026
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
