import { useNavigate } from 'react-router-dom';
import {
  Compass, Clock, BookOpen, User,
  QrCode, Star, MapPin, Coffee,
  Award, TrendingUp, Lock
} from 'lucide-react';
import { useState } from 'react';

const NIVEL_INFO = {
  0: { nombre:'Curioso',         color:'#6B7280', next:50   },
  1: { nombre:'Explorador',      color:'#1D7A4E', next:150  },
  2: { nombre:'Conocedor',       color:'#1B4F8A', next:350  },
  3: { nombre:'Entendido',       color:'#6B3A8A', next:700  },
  4: { nombre:'Maestro Catador', color:'#D4A847', next:9999 },
};

export default function InicioCliente({ data, usuario, onTabChange }) {
  const navigate = useNavigate();
  const [qr, setQr] = useState('');

  const handleEscanear = (e) => {
    e.preventDefault();
    if (qr.trim()) navigate(`/trazabilidad/${qr.trim()}`);
  };

  const nivel    = NIVEL_INFO[data?.pasaporte?.nivel || 0];
  const progreso = data?.pasaporte
    ? Math.min((data.pasaporte.puntos / nivel.next) * 100, 100) : 0;

  return (
    <div className="space-y-4">

      {/* Hero */}
      <div className="rounded-3xl overflow-hidden relative"
        style={{ background:'linear-gradient(135deg, #0F4A2E 0%, #1D7A4E 60%, #259E65 100%)',
          boxShadow:'0 8px 32px rgba(29,122,78,0.4)' }}>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
          style={{ background:'white', transform:'translate(30%,-30%)' }} />
        <div className="p-6 relative">
          <p className="text-xs font-medium mb-2" style={{ color:'rgba(255,255,255,0.6)' }}>
            Bienvenido de nuevo
          </p>
          <h1 className="font-serif text-white text-2xl font-bold mb-1">
            Hola, {usuario?.nombre?.split(' ')[0]}
          </h1>
          <p className="text-sm mb-5" style={{ color:'rgba(255,255,255,0.6)' }}>
            ¿Qué café vas a explorar hoy?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label:'Puntos',     value: data?.pasaporte?.puntos               || 0 },
              { label:'Cafés',      value: data?.pasaporte?.cafes_catados        || 0 },
              { label:'Cafeterías', value: data?.pasaporte?.cafeterias_visitadas || 0 },
            ].map((s,i) => (
              <div key={i} className="rounded-2xl p-3 text-center"
                style={{ background:'rgba(255,255,255,0.12)' }}>
                <p className="font-serif font-bold text-white text-xl">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.5)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Escanear QR */}
      <div className="rounded-2xl p-5"
        style={{ background:'white', border:'1.5px solid #A8E8CC' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:'#EDFAF4' }}>
            <QrCode size={15} color="#1D7A4E" />
          </div>
          <div>
            <p className="font-semibold text-stone-800 text-sm">Escanear QR</p>
            <p className="text-xs text-stone-400">Conoce la historia de tu café</p>
          </div>
        </div>
        <form onSubmit={handleEscanear} className="flex gap-2">
          <input value={qr} onChange={e => setQr(e.target.value)}
            placeholder="CEA-QR-GEISHA-2025..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background:'#F0FFF8', border:'1px solid #A8E8CC' }} />
          <button type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background:'#1D7A4E' }}>
            Ver →
          </button>
        </form>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label:'Explorar cafés',  sub:'Descubre nuevos sabores',  color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC', action:() => onTabChange('explorar'),  icon: Compass  },
          { label:'Mi historial',    sub:'Tus catas anteriores',     color:'#1B4F8A', bg:'#EBF2FF', borde:'#C2D6F8', action:() => onTabChange('historial'), icon: Clock    },
          { label:'Mi pasaporte',    sub:'Logros y nivel',           color:'#6B3A8A', bg:'#F3EEF5', borde:'#D4B8E8', action:() => onTabChange('pasaporte'), icon: BookOpen },
          { label:'Mi perfil',       sub:'Datos y configuración',    color:'#8A6200', bg:'#FFF8E1', borde:'#FFE082', action:() => onTabChange('perfil'),    icon: User     },
        ].map((a,i) => (
          <button key={i} onClick={a.action}
            className="rounded-2xl p-4 text-left flex flex-col gap-2 transition-all active:scale-95"
            style={{ background:'white', border:`1.5px solid ${a.borde}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background:a.bg }}>
              <a.icon size={18} color={a.color} />
            </div>
            <div>
              <p className="font-semibold text-stone-800 text-sm">{a.label}</p>
              <p className="text-xs text-stone-400">{a.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Pasaporte */}
      {data?.pasaporte && (
        <button onClick={() => onTabChange('pasaporte')}
          className="w-full rounded-2xl p-5 text-left"
          style={{ background:'white', border:'1.5px solid #A8E8CC' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold tracking-wider" style={{ color:'#1D7A4E' }}>
              MI PASAPORTE CAFETERO
            </p>
            <span className="text-xs font-medium" style={{ color:'#1D7A4E' }}>Ver →</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background:'#EDFAF4' }}>
              <Award size={24} color="#1D7A4E" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-serif font-bold text-stone-800">{nivel.nombre}</span>
                <span className="font-bold text-sm" style={{ color:'#1D7A4E' }}>
                  {data.pasaporte.puntos} pts
                </span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background:'#EDFAF4' }}>
                <div className="h-2 rounded-full" style={{ background:'#1D7A4E', width:`${progreso}%` }} />
              </div>
              <p className="text-stone-400 text-xs mt-1">
                {data.pasaporte.cafes_catados} cafés · {data.pasaporte.cafeterias_visitadas} cafeterías
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Recomendaciones */}
      {data?.recomendaciones?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} color="#1D7A4E" />
            <p className="font-serif font-bold text-stone-800">Para ti hoy</p>
          </div>
          {data.recomendaciones.map((r,i) => (
            <button key={i}
              onClick={() => r.qr_codigo && navigate(`/trazabilidad/${r.qr_codigo}`)}
              className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition active:scale-95"
              style={{ background:'white', border:'1px solid #A8E8CC' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:'#EDFAF4' }}>
                <Coffee size={20} color="#1D7A4E" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-800 text-sm truncate">{r.nombre}</p>
                <p className="text-stone-400 text-xs mt-0.5 truncate">
                  {r.variedad} · {r.proceso} · {r.nombre_finca}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={10} color="#94A3B8" />
                  <p className="text-stone-400 text-xs">{r.municipio} · {r.altitud_msnm} msnm</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-stone-800 text-sm">
                  ${parseInt(r.precio).toLocaleString('es-CO')}
                </p>
                {r.rating && (
                  <div className="flex items-center gap-0.5 justify-end mt-0.5">
                    <Star size={11} color="#D4A847" fill="#D4A847" />
                    <span className="text-xs font-medium" style={{ color:'#8A6200' }}>{r.rating}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Insignias pendientes */}
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
