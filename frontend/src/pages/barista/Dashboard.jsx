import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Coffee, LogOut, RefreshCw, Bell, Flame } from 'lucide-react';
import io from 'socket.io-client';
import api from '../../api/axios';

import TurnoCard      from './components/TurnoCard';
import MetricasGrid   from './components/MetricasGrid';
import ColaPedidos    from './components/ColaPedidos';
import EntregadosList from './components/EntregadosList';
import MenuHoy        from './components/MenuHoy';
import PerfilCliente  from './components/PerfilCliente';
import StockCafeteria from './components/StockCafeteria';
import Rendimiento    from './components/Rendimiento';

const TIPS_CAFE = [
  'El café V60 requiere agua a 92°C para extraer los mejores aromas florales.',
  'Un Geisha bien preparado tiene notas de jazmín y durazno muy pronunciadas.',
  'El proceso natural intensifica el dulzor y el cuerpo del café.',
  'El proceso lavado resalta la acidez brillante y la claridad de sabor.',
  'Precalienta siempre tu taza antes de servir para mantener la temperatura.',
  'El ratio ideal para pour over es 1:15 — 1g de café por 15ml de agua.',
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
      console.log('Sin perfil del cliente', perfilErr);
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

  return (
    <div className="min-h-screen" style={{ background: '#FAF6F0' }}>

      {/* ── NAVBAR ─────────────────────────────── */}
      <nav className="sticky top-0 z-20"
        style={{ background: '#C0350F', boxShadow: '0 2px 12px rgba(192,53,15,0.25)' }}>
        <div className="max-w-2xl mx-auto px-4">

          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-2">
              <Coffee size={16} color="rgba(255,255,255,0.9)" />
              <span className="font-serif text-white text-sm font-semibold">Calm and Coffee</span>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
                Barista
              </span>
            </div>
            <div className="flex items-center gap-2">
              {nuevoPedido && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Bell size={12} color="white" />
                  <span className="text-white text-xs font-medium">Nuevo pedido</span>
                </div>
              )}
              <button onClick={cargarDatos}
                className="p-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.15)' }}>
                <RefreshCw size={13} color="white" />
              </button>
              <span className="text-red-100 text-xs hidden sm:block">
                {usuario?.nombre?.split(' ')[0]}
              </span>
              <button onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-white"
                style={{ background: 'rgba(255,255,255,0.15)' }}>
                <LogOut size={11} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>

          {/* Tabs — scroll horizontal en móvil */}
          <div className="flex gap-0 overflow-x-auto" style={{ scrollbarWidth:'none' }}>
            {[
              { id:'activos',     label:'Activos',     count: pedidosActivos.length,    urgentes: pedidosUrgentes.length },
              { id:'entregados',  label:'Entregados',  count: pedidosEntregados.length, urgentes: 0 },
              { id:'menu',        label:'Menú hoy',    count: menu.length,              urgentes: 0 },
              { id:'stock',       label:'Stock',       count: 0,                        urgentes: 0 },
              { id:'rendimiento', label:'Rendimiento', count: 0,                        urgentes: 0 },
            ].map(t => (
              <button key={t.id}
                onClick={() => setVistaTab(t.id)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium flex-shrink-0"
                style={{
                  color:        vistaTab === t.id ? 'white' : 'rgba(255,255,255,0.45)',
                  borderBottom: vistaTab === t.id ? '2px solid white' : '2px solid transparent',
                  background:   'transparent',
                }}>
                {t.label}
                {t.count > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
                    style={{
                      background: t.urgentes > 0 ? 'white' : 'rgba(255,255,255,0.25)',
                      color:      t.urgentes > 0 ? '#C0350F' : 'white',
                    }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── CONTENIDO ──────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        <TurnoCard turno={turno} />
        <MetricasGrid metricas={metricas} compacto={true} />

        {/* Alerta urgentes */}
        {pedidosUrgentes.length > 0 && vistaTab === 'activos' && (
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: '#FEF2F2', border: '1.5px solid #FECACA' }}>
            <Flame size={18} color="#C0350F" />
            <div>
              <p className="text-sm font-bold" style={{ color: '#C0350F' }}>
                {pedidosUrgentes.length} pedido{pedidosUrgentes.length > 1 ? 's' : ''} urgente{pedidosUrgentes.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs" style={{ color: '#F87171' }}>
                Llevan más de 10 minutos esperando
              </p>
            </div>
          </div>
        )}

        {/* Tip del café */}
        {vistaTab === 'activos' && pedidosActivos.length === 0 && !cargando && (
          <div className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: 'white', border: '1px solid #E8D9B8' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#FAF6F0' }}>
              <Coffee size={16} color="#92400e" />
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#92400e' }}>TIP DEL CAFÉ</p>
              <p className="text-stone-500 text-sm leading-relaxed italic">
                {TIPS_CAFE[tipIndex]}
              </p>
            </div>
          </div>
        )}

        {/* Contenido según tab */}
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
      </div>

      {/* ── MODAL PERFIL CLIENTE ────────────────── */}
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