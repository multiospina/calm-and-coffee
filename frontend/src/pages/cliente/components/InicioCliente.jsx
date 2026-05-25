import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  Compass, Clock, BookOpen, User,
  QrCode, Star, MapPin, Coffee,
  Award, TrendingUp, Lock, Camera, X,
  Zap, ChevronRight
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const NIVEL_INFO = {
  0: { nombre:'Curioso',         color:'#6B7280', bg:'#F8F9FA', next:50   },
  1: { nombre:'Explorador',      color:'#1D7A4E', bg:'#EDFAF4', next:150  },
  2: { nombre:'Conocedor',       color:'#1B4F8A', bg:'#EBF2FF', next:350  },
  3: { nombre:'Entendido',       color:'#6B3A8A', bg:'#F3EEF5', next:700  },
  4: { nombre:'Maestro Catador', color:'#D4A847', bg:'#FFF8E1', next:9999 },
};

export default function InicioCliente({ data, usuario, onTabChange }) {
  const navigate   = useNavigate();
  const [qr,        setQr]        = useState('');
  const [escaner,   setEscaner]   = useState(false);
  const [scanError, setScanError] = useState('');
  const scannerRef  = useRef(null);
  const html5QrRef  = useRef(null);

  const nivel    = NIVEL_INFO[data?.pasaporte?.nivel || 0];
  const progreso = data?.pasaporte
    ? Math.min((data.pasaporte.puntos / nivel.next) * 100, 100) : 0;

  // Inicia escáner de cámara
  useEffect(() => {
    if (!escaner) return;
    setScanError('');

    const timer = setTimeout(() => {
      if (!scannerRef.current) return;
      const html5 = new Html5Qrcode('qr-scanner-region');
      html5QrRef.current = html5;

      html5.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Extrae el código QR del texto
          let codigo = decodedText;
          if (decodedText.includes('/trazabilidad/')) {
            codigo = decodedText.split('/trazabilidad/').pop();
          }
          cerrarEscaner();
          navigate(`/trazabilidad/${codigo}`);
        },
        () => {} // error silencioso por frame
      ).catch(err => {
        setScanError('No se pudo acceder a la cámara. Verifica los permisos.');
        console.error(err);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [escaner]);

  const cerrarEscaner = () => {
    if (html5QrRef.current) {
      html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
    setEscaner(false);
    setScanError('');
  };

  const handleEscanear = (e) => {
    e.preventDefault();
    if (qr.trim()) navigate(`/trazabilidad/${qr.trim()}`);
  };

  return (
    <div className="space-y-5">

      {/* ── MODAL ESCÁNER ── */}
      {escaner && (
        <div className="fixed inset-0 z-50 flex flex-col"
          style={{ background:'#0c0a08' }}>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="font-serif font-bold text-white text-lg">Escanear QR</p>
              <p className="text-xs" style={{ color:'rgba(255,255,255,0.5)' }}>
                Apunta la cámara al código QR del café
              </p>
            </div>
            <button onClick={cerrarEscaner}
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background:'rgba(255,255,255,0.1)' }}>
              <X size={20} color="white" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-5">
            {scanError ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background:'rgba(220,38,38,0.2)' }}>
                  <Camera size={28} color="#F87171" />
                </div>
                <p className="text-white font-semibold mb-2">Sin acceso a cámara</p>
                <p className="text-sm mb-6" style={{ color:'rgba(255,255,255,0.5)' }}>{scanError}</p>
                <button onClick={cerrarEscaner}
                  className="px-6 py-3 rounded-2xl text-sm font-bold"
                  style={{ background:'#1D7A4E', color:'white' }}>
                  Ingresar código manualmente
                </button>
              </div>
            ) : (
              <div className="w-full max-w-sm">
                {/* Marco del escáner */}
                <div className="relative rounded-3xl overflow-hidden mb-6"
                  style={{ border:'2px solid #1D7A4E' }}>
                  <div id="qr-scanner-region" ref={scannerRef} />
                  {/* Esquinas decorativas */}
                  {[
                    'top-2 left-2 border-t-2 border-l-2',
                    'top-2 right-2 border-t-2 border-r-2',
                    'bottom-2 left-2 border-b-2 border-l-2',
                    'bottom-2 right-2 border-b-2 border-r-2',
                  ].map((pos,i) => (
                    <div key={i} className={`absolute w-6 h-6 ${pos}`}
                      style={{ borderColor:'#1D7A4E', borderRadius:'2px' }} />
                  ))}
                </div>
                <p className="text-center text-sm" style={{ color:'rgba(255,255,255,0.5)' }}>
                  Centra el código QR en el recuadro
                </p>
              </div>
            )}
          </div>

          {/* Input manual como alternativa */}
          <div className="px-5 pb-8">
            <div className="rounded-2xl p-4"
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-xs mb-2" style={{ color:'rgba(255,255,255,0.4)' }}>
                O ingresa el código manualmente:
              </p>
              <form onSubmit={handleEscanear} className="flex gap-2">
                <input value={qr} onChange={e => setQr(e.target.value)}
                  placeholder="CEA-QR-GEISHA-2025..."
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background:'rgba(255,255,255,0.1)', color:'white', border:'1px solid rgba(255,255,255,0.15)' }} />
                <button type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background:'#1D7A4E' }}>
                  Ver →
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <div className="rounded-3xl overflow-hidden relative"
        style={{
          background:'linear-gradient(135deg, #0F4A2E 0%, #1D7A4E 60%, #259E65 100%)',
          boxShadow:'0 8px 40px rgba(29,122,78,0.5)'
        }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10"
          style={{ background:'white' }} />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full opacity-10"
          style={{ background:'white' }} />

        <div className="p-6 relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color:'rgba(255,255,255,0.6)' }}>
                Bienvenido de nuevo
              </p>
              <h1 className="font-serif text-white text-2xl font-bold">
                Hola, {usuario?.nombre?.split(' ')[0]}
              </h1>
              {data?.pasaporte && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full" style={{ background:nivel.color }} />
                  <span className="text-xs font-medium" style={{ color:'rgba(255,255,255,0.7)' }}>
                    {nivel.nombre}
                  </span>
                </div>
              )}
            </div>
            {/* Botón escáner QR destacado */}
            <button onClick={() => setEscaner(true)}
              className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition active:scale-95"
              style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)' }}>
              <Camera size={22} color="white" />
              <span className="text-xs font-bold text-white">Escanear</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label:'Puntos',     value: data?.pasaporte?.puntos               || 0 },
              { label:'Cafés',      value: data?.pasaporte?.cafes_catados        || 0 },
              { label:'Cafeterías', value: data?.pasaporte?.cafeterias_visitadas || 0 },
            ].map((s,i) => (
              <div key={i} className="rounded-2xl p-3 text-center"
                style={{ background:'rgba(255,255,255,0.12)' }}>
                <p className="font-serif font-bold text-white text-2xl">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.5)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Barra de progreso nivel */}
          {data?.pasaporte && nivel.next < 9999 && (
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color:'rgba(255,255,255,0.5)' }}>
                <span>{nivel.nombre}</span>
                <span>{nivel.next - (data.pasaporte.puntos || 0)} pts para siguiente nivel</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }}>
                <div className="h-1.5 rounded-full transition-all"
                  style={{ background:'rgba(255,255,255,0.8)', width:`${progreso}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ACCESO RÁPIDO QR (si no tiene cámara) ── */}
      <div className="rounded-2xl p-4"
        style={{ background:'white', border:'1.5px solid #A8E8CC' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:'#EDFAF4' }}>
            <QrCode size={18} color="#1D7A4E" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-stone-800 text-sm">Conoce tu café</p>
            <p className="text-xs text-stone-400">Escanea el QR de tu taza</p>
          </div>
          <button onClick={() => setEscaner(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition active:scale-95"
            style={{ background:'#1D7A4E' }}>
            <Camera size={13} />
            Abrir cámara
          </button>
        </div>
        {/* Input manual */}
        <form onSubmit={handleEscanear} className="flex gap-2 mt-3">
          <input value={qr} onChange={e => setQr(e.target.value)}
            placeholder="O escribe el código: CEA-QR-..."
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background:'#F0FFF8', border:'1px solid #A8E8CC' }} />
          <button type="submit"
            className="px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background:'#1D7A4E' }}>
            Ver
          </button>
        </form>
      </div>

      {/* ── ACCESOS RÁPIDOS ── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label:'Explorar cafés',  sub:'Descubre nuevos sabores', color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC', action:() => onTabChange('explorar'),  icon: Compass,  acento:'#0F4A2E' },
          { label:'Mi historial',    sub:'Tus catas anteriores',    color:'#1B4F8A', bg:'#EBF2FF', borde:'#C2D6F8', action:() => onTabChange('historial'), icon: Clock,    acento:'#0F3366' },
          { label:'Mi pasaporte',    sub:'Logros y nivel',          color:'#6B3A8A', bg:'#F3EEF5', borde:'#D4B8E8', action:() => onTabChange('pasaporte'), icon: BookOpen, acento:'#3D1A5C' },
          { label:'Mi perfil',       sub:'Datos y ajustes',         color:'#8A6200', bg:'#FFF8E1', borde:'#FFE082', action:() => onTabChange('perfil'),    icon: User,     acento:'#5C4000' },
        ].map((a,i) => (
          <button key={i} onClick={a.action}
            className="rounded-2xl p-4 text-left flex flex-col gap-3 transition-all active:scale-95"
            style={{ background:'white', border:`1.5px solid ${a.borde}` }}>
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background:a.bg }}>
                <a.icon size={18} color={a.color} />
              </div>
              <ChevronRight size={14} color={a.borde} />
            </div>
            <div>
              <p className="font-semibold text-stone-800 text-sm">{a.label}</p>
              <p className="text-xs text-stone-400 mt-0.5">{a.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── PASAPORTE ── */}
      {data?.pasaporte && (
        <button onClick={() => onTabChange('pasaporte')}
          className="w-full rounded-2xl overflow-hidden text-left transition active:scale-95"
          style={{ boxShadow:'0 4px 20px rgba(29,122,78,0.15)' }}>
          <div className="h-1.5"
            style={{ background:`linear-gradient(90deg, ${nivel.color}, #259E65)` }} />
          <div className="p-5" style={{ background:'white' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold tracking-wider" style={{ color:nivel.color }}>
                MI PASAPORTE CAFETERO
              </p>
              <span className="text-xs font-bold px-2 py-1 rounded-full"
                style={{ background:nivel.bg, color:nivel.color }}>
                {nivel.nombre}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background:nivel.bg }}>
                <Award size={26} color={nivel.color} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif font-bold text-stone-800 text-lg">
                    {data.pasaporte.puntos} pts
                  </span>
                  <span className="text-xs text-stone-400">
                    {data.pasaporte.cafes_catados} cafés · {data.pasaporte.cafeterias_visitadas} cafeterías
                  </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background:nivel.bg }}>
                  <div className="h-2 rounded-full transition-all"
                    style={{ background:nivel.color, width:`${progreso}%` }} />
                </div>
              </div>
            </div>
          </div>
        </button>
      )}

      {/* ── RECOMENDACIONES ── */}
      {data?.recomendaciones?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={15} color="#1D7A4E" fill="#1D7A4E" />
              <p className="font-serif font-bold text-stone-800">Para ti hoy</p>
            </div>
            <button onClick={() => onTabChange('explorar')}
              className="text-xs font-medium" style={{ color:'#1D7A4E' }}>
              Ver todo →
            </button>
          </div>
          {data.recomendaciones.map((r,i) => (
            <button key={i}
              onClick={() => r.qr_codigo && navigate(`/trazabilidad/${r.qr_codigo}`)}
              className="w-full rounded-2xl overflow-hidden text-left transition active:scale-95"
              style={{ background:'white', border:'1px solid #A8E8CC',
                boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
              <div className="p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background:'#EDFAF4' }}>
                  <Coffee size={22} color="#1D7A4E" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-bold text-stone-800 text-sm truncate">{r.nombre}</p>
                  <p className="text-stone-400 text-xs mt-0.5 truncate capitalize">
                    {r.variedad} · {r.proceso}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} color="#94A3B8" />
                    <p className="text-stone-400 text-xs truncate">{r.nombre_finca} · {r.municipio}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-stone-800 text-sm">
                    ${parseInt(r.precio).toLocaleString('es-CO')}
                  </p>
                  {r.rating && (
                    <div className="flex items-center gap-0.5 justify-end mt-1">
                      <Star size={11} color="#D4A847" fill="#D4A847" />
                      <span className="text-xs font-bold" style={{ color:'#8A6200' }}>{r.rating}</span>
                    </div>
                  )}
                  <p className="text-xs mt-1" style={{ color:'#1D7A4E' }}>Ver →</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── INSIGNIAS PENDIENTES ── */}
      {data?.insignias_pendientes?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Award size={15} color="#1D7A4E" />
            <p className="font-serif font-bold text-stone-800">Próximas insignias</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {data.insignias_pendientes.map((ins,i) => (
              <div key={i} className="rounded-2xl p-3 text-center"
                style={{ background:'white', border:'1px solid #E2E8F0', opacity:0.7 }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ background:'#F8F9FA' }}>
                  <Lock size={16} color="#94A3B8" />
                </div>
                <p className="text-stone-600 text-xs font-medium leading-tight">{ins.nombre}</p>
                <p className="text-stone-400 text-xs mt-0.5">+{ins.puntos_otorga} pts</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
