import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Coffee, LogOut, RefreshCw,
  Flame, ShoppingBag, Package,
  BarChart2, Layers, User,
  MapPin, Clock, Award
} from 'lucide-react';
import io from 'socket.io-client';
import api from '../../api/axios';

import TurnoCard           from './components/TurnoCard';
import MetricasGrid        from './components/MetricasGrid';
import ColaPedidos         from './components/ColaPedidos';
import EntregadosList      from './components/EntregadosList';
import MenuHoy             from './components/MenuHoy';
import PerfilCliente       from './components/PerfilCliente';
import StockCafeteria      from './components/StockCafeteria';
import Rendimiento         from './components/Rendimiento';
import PanelNotificaciones from '../../components/shared/PanelNotificaciones';

const TIPS_CAFE = [
  'El café V60 requiere agua a 92°C para extraer los mejores aromas florales.',
  'Un Geisha bien preparado tiene notas de jazmín y durazno muy pronunciadas.',
  'El proceso natural intensifica el dulzor y el cuerpo del café.',
  'El proceso lavado resalta la acidez brillante y la claridad de sabor.',
  'Precalienta siempre tu taza antes de servir para mantener la temperatura.',
  'El ratio ideal para pour over es 1:15 — 1g de café por 15ml de agua.',
];

const TABS_MOVIL = [
  { id:'activos',    label:'Activos',  icon: ShoppingBag },
  { id:'entregados', label:'Listos',   icon: Coffee      },
  { id:'menu',       label:'Menú',     icon: Layers      },
  { id:'stock',      label:'Stock',    icon: Package     },
  { id:'perfil',     label:'Perfil',   icon: User        },
];

export default function BaristaDashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [pedidos,            setPedidos]            = useState([]);
  const [metricas,           setMetricas]           = useState(null);
  const [turno,              setTurno]              = useState(null);
  const [menu,               setMenu]               = useState([]);
  const [cargando,           setCargando]           = useState(true);
  const [actualizando,       setActualizando]       = useState(null);
  const [vistaTab,           setVistaTab]           = useState('activos');
  const [nuevoPedido,        setNuevoPedido]        = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [perfilCliente,      setPerfilCliente]      = useState(null);
  const [cargandoPerfil,     setCargandoPerfil]     = useState(false);

  const tipIndex = Math.floor(Math.random() * TIPS_CAFE.length);

  const cargarDatos = useCallback(async () => {
    try {
      const [tRes, pRes, mRes] = await Promise.all([
        api.get('/barista/turno'),
        api.get('/barista/pedidos'),
        api.get('/barista/metricas'),
      ]);
      setTurno(tRes.data.turno);
      setPedidos(pRes.data.pedidos || []);
      setMetricas(mRes.data.metricas);
      if (tRes.data.turno?.cafeteria_id) {
        try {
          const menuRes = await api.get(`/cliente/cafeterias/${tRes.data.turno.cafeteria_id}/menu`);
          setMenu(menuRes.data.menu || []);
        } catch (menuErr) {
          console.log('Sin menú disponible', menuErr);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
    const socket = io('http://localhost:3000');
    socket.on('cafeteria:pedidos', () => {
      setNuevoPedido(true);
      setTimeout(() => setNuevoPedido(false), 3000);
      cargarDatos();
    });
    return () => socket.disconnect();
  }, [cargarDatos]);

  const avanzarEstado = async (pedidoId, estadoActual) => {
    const ESTADOS = ['pendiente_pago', 'pagado', 'en_preparacion', 'listo', 'entregado'];
    const idx = ESTADOS.indexOf(estadoActual);
    if (idx >= ESTADOS.length - 1) return;
    setActualizando(pedidoId);
    try {
      await api.put(`/barista/pedidos/${pedidoId}/estado`, { estado: ESTADOS[idx + 1] });
      cargarDatos();
    } catch (err) {
      console.error(err);
    } finally {
      setActualizando(null);
    }
  };

  const verPerfilCliente = async (pedido) => {
    setPedidoSeleccionado(pedido);
    setPerfilCliente(null);
    setCargandoPerfil(true);
    try {
      const res = await api.get(`/barista/clientes/${pedido.cliente_id}/perfil`);
      setPerfilCliente(res.data);
    } catch (perfilErr) {
      setPerfilCliente(null);
    } finally {
      setCargandoPerfil(false);
    }
  };

  const pedidosActivos    = pedidos.filter(p => p.estado !== 'entregado' && p.estado !== 'cancelado');
  const pedidosEntregados = pedidos.filter(p => p.estado === 'entregado');
  const pedidosUrgentes   = pedidosActivos.filter(p =>
    Math.floor((new Date() - new Date(p.creado_en)) / 60000) >= 10 && p.estado !== 'listo'
  );

  const TABS_DESKTOP = [
    { id:'activos',     label:'Activos',     count: pedidosActivos.length,    urgentes: pedidosUrgentes.length },
    { id:'entregados',  label:'Entregados',  count: pedidosEntregados.length, urgentes: 0 },
    { id:'menu',        label:'Menú hoy',    count: menu.length,              urgentes: 0 },
    { id:'stock',       label:'Stock',       count: 0,                        urgentes: 0 },
    { id:'rendimiento', label:'Rendimiento', count: 0,                        urgentes: 0 },
  ];

  return (
    <div className="min-h-screen" style={{ background:'#FAF6F0' }}>

      {/* ── NAVBAR DESKTOP ── */}
      <nav className="hidden md:block sticky top-0 z-20"
        style={{ background:'#C0350F', boxShadow:'0 2px 12px rgba(192,53,15,0.25)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain rounded-lg" />
              <span className="font-serif text-white font-semibold">Calm and Coffee</span>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background:'rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.8)' }}>
                Barista
              </span>
            </div>
            <div className="flex items-center gap-1">
              {TABS_DESKTOP.map(t => (
                <button key={t.id} onClick={() => setVistaTab(t.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition"
                  style={{
                    background: vistaTab===t.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                    color:      vistaTab===t.id ? 'white' : 'rgba(255,255,255,0.5)',
                  }}>
                  {t.label}
                  {t.count > 0 && (
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: t.urgentes>0 ? 'white' : 'rgba(255,255,255,0.25)',
                        color:      t.urgentes>0 ? '#C0350F' : 'white',
                      }}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {nuevoPedido && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full animate-pulse"
                  style={{ background:'rgba(255,255,255,0.2)' }}>
                  <Flame size={12} color="white" />
                  <span className="text-white text-xs font-medium">Nuevo pedido</span>
                </div>
              )}
              <button onClick={cargarDatos} className="p-2 rounded-xl"
                style={{ background:'rgba(255,255,255,0.15)' }}>
                <RefreshCw size={13} color="white" />
              </button>
              <span className="text-red-100 text-xs">{usuario?.nombre?.split(' ')[0]}</span>
              <PanelNotificaciones colorAccent="#C0350F" />
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
        style={{ background:'#C0350F', boxShadow:'0 2px 12px rgba(192,53,15,0.25)' }}>
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain rounded-lg" />
            <div>
              <p className="font-serif text-white text-sm font-semibold leading-none">Calm and Coffee</p>
              <p className="text-xs" style={{ color:'rgba(255,255,255,0.6)' }}>
                {usuario?.nombre?.split(' ')[0]} · Barista
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {nuevoPedido && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full animate-pulse"
                style={{ background:'rgba(255,255,255,0.2)' }}>
                <Flame size={11} color="white" />
                <span className="text-white text-xs">Nuevo</span>
              </div>
            )}
            <button onClick={cargarDatos} className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background:'rgba(255,255,255,0.15)' }}>
              <RefreshCw size={13} color="white" />
            </button>
            <PanelNotificaciones colorAccent="#C0350F" />
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="md:max-w-5xl md:mx-auto px-4 pt-4 pb-32 md:pb-8 space-y-4">

        {/* ── PERFIL (solo móvil) ── */}
        {vistaTab === 'perfil' && (
          <div className="space-y-4">
            <div className="rounded-3xl overflow-hidden"
              style={{ boxShadow:'0 8px 32px rgba(192,53,15,0.3)' }}>
              <div className="px-5 py-8 flex flex-col items-center text-center"
                style={{ background:'linear-gradient(135deg, #7A1A05 0%, #C0350F 100%)' }}>
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4 font-serif font-bold"
                  style={{
                    background:'rgba(255,255,255,0.15)', color:'white', fontSize:'40px',
                    border:'3px solid rgba(255,255,255,0.2)',
                    boxShadow:'0 8px 24px rgba(0,0,0,0.3)'
                  }}>
                  {usuario?.nombre?.charAt(0).toUpperCase()}
                </div>
                <h2 className="font-serif text-white text-2xl font-bold">{usuario?.nombre}</h2>
                <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.6)' }}>{usuario?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs" style={{ color:'rgba(255,255,255,0.5)' }}>Barista activo</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-6 w-full">
                  {[
                    { label:'Entregados hoy', value: pedidosEntregados.length },
                    { label:'Activos',         value: pedidosActivos.length    },
                    { label:'Satisfacción',    value: metricas?.satisfaccion_promedio ? `${metricas.satisfaccion_promedio}★` : '—' },
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

            {/* Info */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background:'white', border:'1px solid #E2E8F0' }}>
              {[
                { label:'Nombre',    value: usuario?.nombre,                       icon: User   },
                { label:'Correo',    value: usuario?.email,                        icon: Coffee },
                { label:'Municipio', value: usuario?.municipio || 'No registrado', icon: MapPin },
                { label:'Rol',       value: 'Barista',                             icon: Award  },
              ].map((item,i,arr) => (
                <div key={i} className="flex items-center gap-3 px-5 py-4"
                  style={{ borderBottom: i < arr.length-1 ? '1px solid #F8F9FA':'none' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:'#FFF0EB' }}>
                    <item.icon size={14} color="#C0350F" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-400 font-medium">{item.label}</p>
                    <p className="text-sm font-semibold text-stone-700 truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Turno activo */}
            {turno && (
              <div className="rounded-2xl p-4"
                style={{ background:'#FFF0EB', border:'1.5px solid #FECACA' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} color="#C0350F" />
                  <p className="font-semibold text-sm" style={{ color:'#C0350F' }}>Turno activo</p>
                </div>
                <p className="text-stone-700 font-serif font-bold">{turno.nombre_cafeteria}</p>
                <p className="text-xs text-stone-500 mt-0.5">{turno.hora_inicio} — {turno.hora_fin}</p>
              </div>
            )}

            {/* Cerrar sesión */}
            <button onClick={() => { logout(); navigate('/login'); }}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition active:scale-95"
              style={{ background:'#FEF2F2', color:'#DC2626', border:'1.5px solid #FECACA' }}>
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        )}

        {/* ── CONTENIDO NORMAL ── */}
        {vistaTab !== 'perfil' && (
          <>
            <TurnoCard turno={turno} />
            <MetricasGrid metricas={metricas} compacto={true} />

            {pedidosUrgentes.length > 0 && vistaTab === 'activos' && (
              <div className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background:'#FEF2F2', border:'1.5px solid #FECACA' }}>
                <Flame size={18} color="#C0350F" />
                <div>
                  <p className="text-sm font-bold" style={{ color:'#C0350F' }}>
                    {pedidosUrgentes.length} pedido{pedidosUrgentes.length>1?'s':''} urgente{pedidosUrgentes.length>1?'s':''}
                  </p>
                  <p className="text-xs" style={{ color:'#F87171' }}>Llevan más de 10 minutos</p>
                </div>
              </div>
            )}

            {vistaTab === 'activos' && pedidosActivos.length === 0 && !cargando && (
              <div className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background:'white', border:'1px solid #E8D9B8' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:'#FAF6F0' }}>
                  <Coffee size={16} color="#92400e" />
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color:'#92400e' }}>TIP DEL CAFÉ</p>
                  <p className="text-stone-500 text-sm leading-relaxed italic">{TIPS_CAFE[tipIndex]}</p>
                </div>
              </div>
            )}

            {cargando ? (
              <div className="flex justify-center py-10">
                <div className="w-7 h-7 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
              </div>
            ) : vistaTab === 'activos' ? (
              <ColaPedidos
                pedidos={pedidosActivos}
                onAvanzar={avanzarEstado}
                onVerPerfil={verPerfilCliente}
                actualizando={actualizando}
                onReportado={cargarDatos}
              />
            ) : vistaTab === 'entregados' ? (
              <EntregadosList pedidos={pedidosEntregados} />
            ) : vistaTab === 'menu' ? (
              <MenuHoy menu={menu} />
            ) : vistaTab === 'stock' ? (
              <StockCafeteria />
            ) : (
              <Rendimiento />
            )}
          </>
        )}
      </div>

      {/* ── NAVBAR BOTTOM MÓVIL ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-4 pb-4">
        <div className="rounded-3xl px-2 py-2"
          style={{
            background:'rgba(255,255,255,0.97)',
            backdropFilter:'blur(20px)',
            boxShadow:'0 -4px 32px rgba(192,53,15,0.15), 0 8px 32px rgba(0,0,0,0.08)',
            border:'1px solid rgba(255,200,180,0.5)'
          }}>
          <div className="flex items-center justify-around">
            {TABS_MOVIL.map(t => {
              const activo = vistaTab === t.id;
              const count  = t.id==='activos'    ? pedidosActivos.length :
                             t.id==='entregados' ? pedidosEntregados.length :
                             t.id==='menu'       ? menu.length : 0;
              return (
                <button key={t.id} onClick={() => setVistaTab(t.id)}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl relative transition-all"
                  style={{ background: activo ? '#C0350F' : 'transparent', minWidth:'56px' }}>
                  <t.icon size={activo?20:18} color={activo?'white':'#94A3B8'} />
                  {count > 0 && !activo && (
                    <div className="absolute -top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background:'#C0350F' }}>
                      <span className="text-white font-bold" style={{ fontSize:'9px' }}>{count}</span>
                    </div>
                  )}
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

      {/* Modal perfil cliente */}
      {pedidoSeleccionado && (
        <PerfilCliente
          pedido={pedidoSeleccionado}
          perfil={perfilCliente}
          cargando={cargandoPerfil}
          onCerrar={() => { setPedidoSeleccionado(null); setPerfilCliente(null); }}
        />
      )}
    </div>
  );
}
