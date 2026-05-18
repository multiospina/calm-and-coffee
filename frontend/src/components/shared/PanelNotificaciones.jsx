import { useState, useEffect, useRef } from 'react';
import {
  Bell, X, Check, CheckCheck,
  Star, Leaf, AlertTriangle, Info,
  Coffee, TrendingUp
} from 'lucide-react';
import api from '../../api/axios';

const TIPO_INFO = {
  impacto:  { color:'#6B3A8A', bg:'#F3EEF5', icon: TrendingUp    },
  feedback: { color:'#8A6200', bg:'#FFF8E1', icon: Star          },
  alerta:   { color:'#C0350F', bg:'#FFF0EB', icon: AlertTriangle },
  info:     { color:'#1B4F8A', bg:'#EBF2FF', icon: Info          },
  cosecha:  { color:'#1D7A4E', bg:'#EDFAF4', icon: Leaf          },
  cafe:     { color:'#92400e', bg:'#FEF3C7', icon: Coffee        },
};

export default function PanelNotificaciones({ colorAccent = '#6B3A8A' }) {
  const [abierto,       setAbierto]       = useState(false);
  const [notifs,        setNotifs]        = useState([]);
  const [noLeidas,      setNoLeidas]      = useState(0);
  const [cargando,      setCargando]      = useState(false);
  const [marcandoTodas, setMarcandoTodas] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const cargar = async () => {
    try {
      const res = await api.get('/notificaciones');
      setNotifs(res.data.notificaciones || []);
      setNoLeidas(res.data.no_leidas || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const marcarLeida = async (id) => {
    try {
      await api.put(`/notificaciones/${id}/leer`);
      setNotifs(prev => prev.map(n => n.id===id ? {...n,leida:true} : n));
      setNoLeidas(prev => Math.max(0, prev-1));
    } catch (err) {
      console.error(err);
    }
  };

  const marcarTodas = async () => {
    setMarcandoTodas(true);
    try {
      await api.put('/notificaciones/leer/todas');
      setNotifs(prev => prev.map(n => ({...n, leida:true})));
      setNoLeidas(0);
    } catch (err) {
      console.error(err);
    } finally {
      setMarcandoTodas(false);
    }
  };

  const tiempoRelativo = (fecha) => {
    const diff = Math.floor((new Date() - new Date(fecha)) / 1000);
    if (diff < 60)    return 'Ahora';
    if (diff < 3600)  return `${Math.floor(diff/60)}m`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h`;
    return `${Math.floor(diff/86400)}d`;
  };

  return (
    <div ref={panelRef} className="relative">

      {/* Botón campana */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-9 h-9 rounded-2xl flex items-center justify-center relative transition-all"
        style={{ background: abierto ? colorAccent : '#F3EEF5' }}>
        <Bell size={16} color={abierto ? 'white' : colorAccent} />
        {noLeidas > 0 && (
          <div className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full flex items-center justify-center px-1"
            style={{ background:'#C0350F', boxShadow:'0 2px 8px rgba(192,53,15,0.4)' }}>
            <span className="text-white font-bold" style={{ fontSize:'10px' }}>
              {noLeidas > 9 ? '9+' : noLeidas}
            </span>
          </div>
        )}
      </button>

      {/* Panel */}
      {abierto && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-3xl overflow-hidden"
          style={{
            boxShadow:'0 20px 60px rgba(0,0,0,0.2)',
            border:'1px solid #E8D4F8',
            background:'white'
          }}>

          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ background:`linear-gradient(135deg, #1A0A2E, ${colorAccent})` }}>
            <div>
              <p className="font-serif font-bold text-white">Notificaciones</p>
              <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.6)' }}>
                {noLeidas > 0 ? `${noLeidas} sin leer` : 'Todo al día'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {noLeidas > 0 && (
                <button onClick={marcarTodas} disabled={marcandoTodas}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium"
                  style={{ background:'rgba(255,255,255,0.15)', color:'white' }}>
                  <CheckCheck size={12} />
                  {marcandoTodas ? '...' : 'Leer todas'}
                </button>
              )}
              <button onClick={() => setAbierto(false)}
                className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background:'rgba(255,255,255,0.15)' }}>
                <X size={13} color="white" />
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="overflow-y-auto" style={{ maxHeight:'380px' }}>
            {notifs.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={28} color="#E2E8F0" className="mx-auto mb-3" />
                <p className="text-stone-400 text-sm font-semibold">Sin notificaciones</p>
                <p className="text-stone-300 text-xs mt-1">Todo está en calma</p>
              </div>
            ) : notifs.map((n,i) => {
              const info = TIPO_INFO[n.tipo] || TIPO_INFO.info;
              return (
                <div key={i}
                  onClick={() => !n.leida && marcarLeida(n.id)}
                  className="flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all"
                  style={{
                    background:      n.leida ? 'white' : `${info.bg}80`,
                    borderBottom:    '1px solid #F8F9FA',
                    borderLeft:      n.leida ? 'none' : `3px solid ${info.color}`,
                  }}>

                  {/* Icono */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background:info.bg }}>
                    <info.icon size={16} color={info.color} />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 leading-tight">
                      {n.titulo}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                      {n.mensaje}
                    </p>
                    <p className="text-xs mt-1.5" style={{ color:info.color }}>
                      {tiempoRelativo(n.creado_en)}
                    </p>
                  </div>

                  {/* Indicador no leída */}
                  {!n.leida ? (
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background:info.color }} />
                  ) : (
                    <Check size={13} color="#CBD5E0" className="flex-shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div className="px-4 py-3 text-center"
              style={{ borderTop:'1px solid #F8F9FA' }}>
              <p className="text-xs text-stone-300">
                {notifs.length} notificacion{notifs.length!==1?'es':''} en total
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}