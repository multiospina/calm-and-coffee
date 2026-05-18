import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home, MapPin, Package, Star, User,
  RefreshCw, LogOut, Leaf, ChevronRight,
  Award, Coffee, Search, TrendingUp
} from 'lucide-react';
import api from '../../api/axios';

import MetricasCaficultor  from './components/MetricasCaficultor';
import MisFincas           from './components/MisFincas';
import MisCosechas         from './components/MisCosechas';
import FeedbackClientes    from './components/FeedbackClientes';
import PanelNotificaciones from '../../components/shared/PanelNotificaciones';

const TABS = [
  { id:'inicio',   label:'Inicio',  icon: Home    },
  { id:'fincas',   label:'Finca',   icon: MapPin  },
  { id:'cosechas', label:'Cosecha', icon: Package },
  { id:'impacto',  label:'Impacto', icon: Star    },
  { id:'perfil',   label:'Perfil',  icon: User    },
];

const LOGROS = [
  { icon: Coffee,     label:'Primer café',   desc:'Primera cosecha registrada',  check: (d) => (d?.cosechas?.total_cosechas||0) >= 1   },
  { icon: MapPin,     label:'En cafeterías', desc:'Café en cafetería activa',    check: (d) => (d?.cafeterias?.total_cafeterias||0) >= 1 },
  { icon: Star,       label:'Bien valorado', desc:'Promedio mayor a 4 estrellas',check: (d) => parseFloat(d?.satisfaccion?.promedio||0) >= 4 },
  { icon: Package,    label:'100 kg',        desc:'100 kg producidos',           check: (d) => parseInt(d?.cosechas?.kg_totales||0) >= 100  },
  { icon: Award,      label:'Multi-finca',   desc:'Más de una finca',            check: (d) => (d?.fincas?.total_fincas||0) > 1            },
  { icon: Search,     label:'Trazable',      desc:'QR de cosecha generado',      check: (d) => (d?.cosechas?.cerradas||0) >= 1             },
];

export default function CaficultorDashboard() {
  const { usuario, logout } = useAuth();
  const navigate  = useNavigate();
  const [tab,      setTab]      = useState('inicio');
  const [data,     setData]     = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const res = await api.get('/caficultor/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const Contenido = () => (
    <>
      {/* ── INICIO ──────────────────────── */}
      {tab === 'inicio' && (
        <div className="space-y-4">

          {/* Hero */}
          <div className="rounded-3xl overflow-hidden relative"
            style={{
              background:'linear-gradient(135deg, #1A0A2E 0%, #3D1A5C 60%, #6B3A8A 100%)',
              boxShadow:'0 8px 32px rgba(61,26,92,0.4)'
            }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
              style={{ background:'white', transform:'translate(30%,-30%)' }} />
            <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full opacity-10"
              style={{ background:'white', transform:'translate(-30%,30%)' }} />
            <div className="p-6 relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background:'rgba(255,255,255,0.15)' }}>
                  <Leaf size={12} color="white" />
                </div>
                <span className="text-xs font-medium"
                  style={{ color:'rgba(255,255,255,0.6)' }}>
                  Panel del Caficultor
                </span>
              </div>
              <h1 className="font-serif text-white text-2xl font-bold mb-1">
                Hola, {usuario?.nombre?.split(' ')[0]} 👋
              </h1>
              <p className="text-sm mb-5" style={{ color:'rgba(255,255,255,0.6)' }}>
                Tu café conecta el campo con la taza
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label:'Fincas',     value: data?.fincas?.total_fincas        || 0 },
                  { label:'Cosechas',   value: data?.cosechas?.total_cosechas    || 0 },
                  { label:'Cafeterías', value: data?.cafeterias?.total_cafeterias || 0 },
                ].map((s,i) => (
                  <div key={i} className="rounded-2xl p-3 text-center"
                    style={{ background:'rgba(255,255,255,0.12)' }}>
                    <p className="font-serif font-bold text-white text-2xl">{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.5)' }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:'Nueva cosecha', sub:'Registrar bitácora',  color:'#3D1A5C', bg:'#F3EEF5', borde:'#D4B8E8', tab:'cosechas', icon: Package    },
              { label:'Mis fincas',    sub:'Datos privados',       color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC', tab:'fincas',   icon: MapPin     },
              { label:'Mi impacto',    sub:'Feedback de clientes', color:'#8A6200', bg:'#FFF8E1', borde:'#FFE082', tab:'impacto',  icon: TrendingUp },
              { label:'Mi perfil',     sub:'Mis datos y logros',   color:'#1B4F8A', bg:'#EBF2FF', borde:'#C2D6F8', tab:'perfil',   icon: User       },
            ].map((a,i) => (
              <button key={i} onClick={() => setTab(a.tab)}
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

          <MetricasCaficultor data={data} onTabChange={setTab} />

          {data?.cosechas?.activas > 0 && (
            <button onClick={() => setTab('cosechas')}
              className="w-full rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-all"
              style={{ background:'linear-gradient(135deg,#EDFAF4,#D4F5E5)', border:'1.5px solid #A8E8CC' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:'#1D7A4E' }}>
                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-serif font-bold text-stone-800">Cosecha activa en curso</p>
                <p className="text-xs text-stone-500">
                  {data.cosechas.activas} en proceso · Toca para ver
                </p>
              </div>
              <ChevronRight size={16} color="#1D7A4E" />
            </button>
          )}
        </div>
      )}

      {/* ── FINCAS ──────────────────────── */}
      {tab === 'fincas' && (
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden"
            style={{ boxShadow:'0 4px 24px rgba(61,26,92,0.15)' }}>
            <div className="px-5 py-6"
              style={{ background:'linear-gradient(135deg, #1A0A2E 0%, #3D1A5C 100%)' }}>
              <p className="text-xs font-bold tracking-widest mb-1"
                style={{ color:'rgba(255,255,255,0.5)' }}>DATOS PRIVADOS</p>
              <h2 className="font-serif text-white text-xl font-bold">Mis Fincas</h2>
              <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.6)' }}>
                Solo tú puedes ver esta información
              </p>
            </div>
          </div>
          <MisFincas />
        </div>
      )}

      {/* ── COSECHAS ────────────────────── */}
      {tab === 'cosechas' && (
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden"
            style={{ boxShadow:'0 4px 24px rgba(61,26,92,0.15)' }}>
            <div className="px-5 py-6"
              style={{ background:'linear-gradient(135deg, #3D1A5C 0%, #6B3A8A 100%)' }}>
              <p className="text-xs font-bold tracking-widest mb-1"
                style={{ color:'rgba(255,255,255,0.5)' }}>BITÁCORA DIARIA</p>
              <h2 className="font-serif text-white text-xl font-bold">Mis Cosechas</h2>
              <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.6)' }}>
                Registra, sigue y genera QR de trazabilidad
              </p>
            </div>
          </div>
          <MisCosechas />
        </div>
      )}

      {/* ── IMPACTO ─────────────────────── */}
      {tab === 'impacto' && (
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden"
            style={{ boxShadow:'0 4px 24px rgba(61,26,92,0.15)' }}>
            <div className="px-5 py-6"
              style={{ background:'linear-gradient(135deg, #6B3A8A 0%, #9B5ABE 100%)' }}>
              <p className="text-xs font-bold tracking-widest mb-1"
                style={{ color:'rgba(255,255,255,0.5)' }}>TU CONEXIÓN CON EL CONSUMIDOR</p>
              <h2 className="font-serif text-white text-xl font-bold">Tu impacto</h2>
              <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.6)' }}>
                Lo que dicen quienes toman tu café
              </p>
            </div>
          </div>
          <FeedbackClientes />
        </div>
      )}

      {/* ── PERFIL ──────────────────────── */}
      {tab === 'perfil' && (
        <div className="space-y-4">

          {/* Hero perfil */}
          <div className="rounded-3xl overflow-hidden"
            style={{ boxShadow:'0 8px 32px rgba(61,26,92,0.3)' }}>
            <div className="px-5 py-8 flex flex-col items-center text-center"
              style={{ background:'linear-gradient(135deg, #1A0A2E 0%, #3D1A5C 100%)' }}>
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4 font-serif font-bold"
                style={{
                  background:'rgba(255,255,255,0.15)',
                  color:'white', fontSize:'40px',
                  border:'3px solid rgba(255,255,255,0.2)',
                  boxShadow:'0 8px 24px rgba(0,0,0,0.3)'
                }}>
                {usuario?.nombre?.charAt(0).toUpperCase()}
              </div>
              <h2 className="font-serif text-white text-2xl font-bold">{usuario?.nombre}</h2>
              <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.6)' }}>{usuario?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs" style={{ color:'rgba(255,255,255,0.5)' }}>
                  Caficultor activo
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-6 w-full">
                {[
                  { label:'Kg totales',   value: data?.cosechas?.kg_totales ? `${parseInt(data.cosechas.kg_totales)}` : '0' },
                  { label:'Valoraciones', value: data?.satisfaccion?.total_valoraciones || '0' },
                  { label:'Promedio',     value: data?.satisfaccion?.promedio ? `${data.satisfaccion.promedio}★` : '—' },
                ].map((s,i) => (
                  <div key={i} className="rounded-2xl p-3 text-center"
                    style={{ background:'rgba(255,255,255,0.1)' }}>
                    <p className="font-serif font-bold text-white text-xl">{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.5)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info personal */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background:'white', border:'1px solid #E2E8F0' }}>
            {[
              { label:'Nombre',    value: usuario?.nombre },
              { label:'Correo',    value: usuario?.email  },
              { label:'Municipio', value: usuario?.municipio || 'No registrado' },
              { label:'Teléfono',  value: usuario?.telefono  || 'No registrado' },
            ].map((item,i,arr) => (
              <div key={i} className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: i < arr.length-1 ? '1px solid #F8F9FA' : 'none' }}>
                <p className="text-xs text-stone-400 font-medium">{item.label}</p>
                <p className="text-sm font-semibold text-stone-700">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Logros con iconos Lucide */}
          <div className="rounded-2xl p-5"
            style={{ background:'white', border:'1px solid #E2E8F0' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background:'#F3EEF5' }}>
                <Award size={15} color="#6B3A8A" />
              </div>
              <p className="font-serif font-bold text-stone-800">Mis logros</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {LOGROS.map((l,i) => {
                const ok = l.check(data);
                return (
                  <div key={i} className="rounded-2xl p-3 text-center transition-all"
                    style={{
                      background: ok ? '#FAF5FF' : '#F8F9FA',
                      border:`1.5px solid ${ok ? '#D4B8E8' : '#E2E8F0'}`,
                      opacity: ok ? 1 : 0.45,
                    }}>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2"
                      style={{ background: ok ? '#F3EEF5' : '#F1F0EE' }}>
                      <l.icon size={18} color={ok ? '#6B3A8A' : '#94A3B8'} />
                    </div>
                    <p className="text-xs font-bold leading-tight"
                      style={{ color: ok ? '#6B3A8A' : '#94A3B8' }}>
                      {l.label}
                    </p>
                    {ok && (
                      <div className="mt-1.5 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background:'#6B3A8A' }}>
                          <span className="text-white" style={{ fontSize:'9px', fontWeight:900 }}>✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cerrar sesión */}
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition active:scale-95"
            style={{ background:'#FEF2F2', color:'#DC2626', border:'1.5px solid #FECACA' }}>
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen" style={{ background:'#FAF5FF' }}>

      {/* ── NAVBAR DESKTOP ── solo md+ */}
      <nav className="hidden md:block sticky top-0 z-20"
        style={{ background:'#3D1A5C', boxShadow:'0 2px 16px rgba(61,26,92,0.3)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain rounded-lg" />
              <span className="font-serif text-white font-semibold">Calm and Coffee</span>
              <span className="text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>· Caficultor</span>
            </div>
            <div className="flex items-center gap-1">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition"
                  style={{
                    background: tab===t.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color:      tab===t.id ? 'white' : 'rgba(255,255,255,0.5)',
                  }}>
                  <t.icon size={13} />
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={cargarDatos}
                className="p-2 rounded-xl"
                style={{ background:'rgba(255,255,255,0.12)' }}>
                <RefreshCw size={13} color="white" />
              </button>
              <span className="text-purple-200 text-xs">{usuario?.nombre?.split(' ')[0]}</span>
              <PanelNotificaciones colorAccent="#6B3A8A" />
              <button onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs text-white"
                style={{ background:'rgba(255,255,255,0.12)' }}>
                <LogOut size={11} />
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── TOPBAR MÓVIL ── solo móvil */}
      <div className="md:hidden flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="logo"
            className="w-9 h-9 object-contain rounded-2xl"
            style={{ boxShadow:'0 2px 12px rgba(61,26,92,0.3)' }} />
          <div>
            <p className="font-serif font-bold text-stone-800 text-base leading-none">
              Calm and Coffee
            </p>
            <p className="text-xs mt-0.5" style={{ color:'#6B3A8A' }}>
              {usuario?.nombre?.split(' ')[0]} · Caficultor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={cargarDatos}
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background:'#F3EEF5' }}>
            <RefreshCw size={15} color="#6B3A8A" />
          </button>
          <PanelNotificaciones colorAccent="#6B3A8A" />
        </div>
      </div>

      {/* ── CONTENIDO ─────────────────────────── */}
      <div className="md:max-w-5xl md:mx-auto px-4 pt-2 pb-32 md:pb-8 space-y-4">
        {cargando ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : (
          <Contenido />
        )}
      </div>

      {/* ── NAVBAR BOTTOM MÓVIL ── solo móvil */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-4 pb-4">
        <div className="rounded-3xl px-2 py-2"
          style={{
            background:'rgba(255,255,255,0.97)',
            backdropFilter:'blur(20px)',
            boxShadow:'0 -4px 32px rgba(61,26,92,0.15), 0 8px 32px rgba(0,0,0,0.08)',
            border:'1px solid rgba(209,196,233,0.5)'
          }}>
          <div className="flex items-center justify-around">
            {TABS.map(t => {
              const activo = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all"
                  style={{
                    background: activo ? '#3D1A5C' : 'transparent',
                    minWidth:'56px'
                  }}>
                  <t.icon size={activo ? 20 : 18} color={activo ? 'white' : '#94A3B8'} />
                  <span className="font-medium"
                    style={{ fontSize:'10px', color: activo ? 'white' : '#94A3B8' }}>
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
