import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home, ClipboardList, Clock,
  User, LogOut, RefreshCw, Star
} from 'lucide-react';
import api from '../../api/axios';
import PanelNotificaciones    from '../../components/shared/PanelNotificaciones';
import InicioCatador          from './components/InicioCatador';
import SolicitudesCata        from './components/SolicitudesCata';
import HistorialCata          from './components/HistorialCata';
import PerfilCatador          from './components/PerfilCatador';

const TABS = [
  { id:'inicio',      label:'Inicio',      icon: Home          },
  { id:'solicitudes', label:'Solicitudes', icon: ClipboardList },
  { id:'historial',   label:'Historial',   icon: Clock         },
  { id:'perfil',      label:'Perfil',      icon: User          },
];

export default function CatadorDashboard() {
  const { usuario, logout } = useAuth();
  const navigate  = useNavigate();
  const [tab,      setTab]      = useState('inicio');
  const [data,     setData]     = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await api.get('/catador/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background:'#FFFBF0' }}>

      {/* ── NAVBAR DESKTOP ── */}
      <nav className="hidden md:block sticky top-0 z-20"
        style={{ background:'#8A6200', boxShadow:'0 2px 12px rgba(138,98,0,0.25)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain rounded-lg" />
              <span className="font-serif text-white font-semibold">Calm and Coffee</span>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background:'rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.8)' }}>
                Catador
              </span>
            </div>
            <div className="flex items-center gap-1">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition"
                  style={{
                    background: tab===t.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                    color:      tab===t.id ? 'white' : 'rgba(255,255,255,0.6)',
                  }}>
                  <t.icon size={13} />
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={cargar} className="p-2 rounded-xl"
                style={{ background:'rgba(255,255,255,0.15)' }}>
                <RefreshCw size={13} color="white" />
              </button>
              <span className="text-amber-100 text-xs">{usuario?.nombre?.split(' ')[0]}</span>
              <PanelNotificaciones colorAccent="#8A6200" />
              <button onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs text-white"
                style={{ background:'rgba(255,255,255,0.15)' }}>
                <LogOut size={11} />
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── TOPBAR MÓVIL ── */}
      <div className="md:hidden sticky top-0 z-20"
        style={{ background:'#8A6200', boxShadow:'0 2px 12px rgba(138,98,0,0.25)' }}>
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain rounded-lg" />
            <div>
              <p className="font-serif text-white text-sm font-semibold leading-none">Calm and Coffee</p>
              <p className="text-xs" style={{ color:'rgba(255,255,255,0.6)' }}>
                {usuario?.nombre?.split(' ')[0]} · Catador
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={cargar} className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background:'rgba(255,255,255,0.15)' }}>
              <RefreshCw size={13} color="white" />
            </button>
            <PanelNotificaciones colorAccent="#8A6200" />
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="md:max-w-5xl md:mx-auto px-4 pt-4 pb-32 md:pb-8 space-y-4">
        {cargando ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {tab === 'inicio'      && <InicioCatador   data={data} usuario={usuario} onTabChange={setTab} />}
            {tab === 'solicitudes' && <SolicitudesCata onCatacionCreada={cargar} />}
            {tab === 'historial'   && <HistorialCata />}
            {tab === 'perfil'      && <PerfilCatador   usuario={usuario} data={data} logout={logout} />}
          </>
        )}
      </div>

      {/* ── NAVBAR BOTTOM MÓVIL ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-4 pb-4">
        <div className="rounded-3xl px-2 py-2"
          style={{
            background:'rgba(255,255,255,0.97)',
            backdropFilter:'blur(20px)',
            boxShadow:'0 -4px 32px rgba(138,98,0,0.15), 0 8px 32px rgba(0,0,0,0.08)',
            border:'1px solid rgba(255,224,130,0.5)'
          }}>
          <div className="flex items-center justify-around">
            {TABS.map(t => {
              const activo = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all"
                  style={{ background: activo ? '#8A6200' : 'transparent', minWidth:'60px' }}>
                  <t.icon size={activo?20:18} color={activo?'white':'#94A3B8'} />
                  <span className="font-medium"
                    style={{ fontSize:'10px', color: activo?'white':'#94A3B8' }}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
