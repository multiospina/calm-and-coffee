import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import io from 'socket.io-client';

const ESTADOS = ['pendiente_pago','pagado','en_preparacion','listo','entregado'];
const ESTADO_LABEL = {
  pendiente_pago:  { label:'Pendiente pago', color:'#D4A847', bg:'rgba(212,168,71,0.15)'  },
  pagado:          { label:'Pagado',          color:'#1B4F8A', bg:'rgba(27,79,138,0.15)'  },
  en_preparacion:  { label:'Preparando',      color:'#C0350F', bg:'rgba(192,53,15,0.15)'  },
  listo:           { label:'Listo',           color:'#259E65', bg:'rgba(37,158,101,0.15)' },
  entregado:       { label:'Entregado',       color:'#6B7280', bg:'rgba(107,114,128,0.15)'},
};

export default function BaristaDashboard() {
  const { usuario, logout } = useAuth();
  const navigate            = useNavigate();
  const [pedidos,   setPedidos]   = useState([]);
  const [metricas,  setMetricas]  = useState(null);
  const [turno,     setTurno]     = useState(null);
  const [cargando,  setCargando]  = useState(true);
  const [actualizando, setActualizando] = useState(null);

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
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();

    // Socket.io — escuchar nuevos pedidos en tiempo real
    const socket = io('http://localhost:3000');
    socket.on('connect', () => console.log('Socket conectado'));

    socket.on(`cafeteria:pedidos`, () => {
      cargarDatos();
    });

    return () => socket.disconnect();
  }, [cargarDatos]);

  const avanzarEstado = async (pedidoId, estadoActual) => {
    const idx = ESTADOS.indexOf(estadoActual);
    if (idx >= ESTADOS.length - 1) return;
    const nuevoEstado = ESTADOS[idx + 1];
    setActualizando(pedidoId);
    try {
      await api.put(`/barista/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
      cargarDatos();
    } catch (err) {
      console.error(err);
    } finally {
      setActualizando(null);
    }
  };

  const pedidosActivos = pedidos.filter(p => p.estado !== 'entregado' && p.estado !== 'cancelado');
  const pedidosEntregados = pedidos.filter(p => p.estado === 'entregado');

  return (
    <div className="min-h-screen" style={{ background: '#1a0800' }}>

      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between"
        style={{ background: '#C0350F' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <span className="text-white font-serif font-bold text-sm">C</span>
          </div>
          <div>
            <span className="text-white font-serif font-semibold">Calm and Coffee</span>
            <span className="text-red-200 text-xs ml-2">· Barista</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-red-200 text-sm">{usuario?.nombre?.split(' ')[0]}</span>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="text-red-300 hover:text-white text-xs transition">
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-5 py-6">

        {/* Turno activo */}
        {turno ? (
          <div className="rounded-2xl p-4 mb-5 flex items-center justify-between"
            style={{ background:'rgba(192,53,15,0.15)', border:'1px solid rgba(192,53,15,0.3)' }}>
            <div>
              <p className="text-red-300 text-xs font-medium">TURNO ACTIVO</p>
              <p className="text-white font-semibold">{turno.nombre}</p>
              <p className="text-red-300 text-xs">{turno.nombre_cafeteria} · {turno.hora_inicio} — {turno.hora_fin}</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          </div>
        ) : (
          <div className="rounded-2xl p-4 mb-5"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-stone-400 text-sm text-center">No tienes turno activo hoy</p>
          </div>
        )}

        {/* Métricas */}
        {metricas && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label:'Pedidos',      value: metricas.total_pedidos_hoy  || 0 },
              { label:'Entregados',   value: metricas.entregados          || 0 },
              { label:'Satisfacción', value: metricas.satisfaccion_promedio ? `${metricas.satisfaccion_promedio}★` : '—' },
              { label:'Tiempo prom.', value: metricas.tiempo_promedio_min  ? `${metricas.tiempo_promedio_min}m` : '—' },
            ].map((m, i) => (
              <div key={i} className="rounded-2xl p-3 text-center"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-white font-bold text-lg font-serif">{m.value}</div>
                <div className="text-stone-500 text-xs mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {cargando ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Cola de pedidos activos */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-serif font-bold">
                  Cola de pedidos
                  {pedidosActivos.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-normal"
                      style={{ background:'#C0350F', color:'white' }}>
                      {pedidosActivos.length}
                    </span>
                  )}
                </h2>
                <button onClick={cargarDatos}
                  className="text-red-400 text-xs hover:text-white transition">
                  ↻ Actualizar
                </button>
              </div>

              {pedidosActivos.length === 0 ? (
                <div className="rounded-2xl p-8 text-center"
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-4xl mb-3">☕</div>
                  <p className="text-stone-400 text-sm">No hay pedidos activos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pedidosActivos.map(p => {
                    const est = ESTADO_LABEL[p.estado] || ESTADO_LABEL.pendiente_pago;
                    const idx = ESTADOS.indexOf(p.estado);
                    const siguienteEstado = ESTADOS[idx+1];
                    const minutos = Math.floor((new Date() - new Date(p.creado_en)) / 60000);

                    return (
                      <div key={p.id} className="rounded-2xl p-4"
                        style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>

                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-white font-semibold">{p.nombre_cafe}</h3>
                            <p className="text-stone-400 text-xs mt-0.5">
                              {p.nombre_cliente} · {p.mesa}
                            </p>
                            {p.notas_cliente && (
                              <p className="text-amber-400 text-xs mt-1 italic">
                                📝 {p.notas_cliente}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-xs px-2 py-1 rounded-full font-medium"
                              style={{ background: est.bg, color: est.color }}>
                              {est.label}
                            </span>
                            <p className="text-stone-600 text-xs mt-1">{minutos}m esperando</p>
                          </div>
                        </div>

                        {/* Barra de progreso del estado */}
                        <div className="flex gap-1 mb-3">
                          {ESTADOS.slice(0,4).map((e, i) => (
                            <div key={e} className="flex-1 h-1 rounded-full"
                              style={{ background: ESTADOS.indexOf(p.estado) >= i ? '#C0350F' : 'rgba(255,255,255,0.1)' }} />
                          ))}
                        </div>

                        {siguienteEstado && siguienteEstado !== 'cancelado' && (
                          <button
                            onClick={() => avanzarEstado(p.id, p.estado)}
                            disabled={actualizando === p.id}
                            className="w-full py-2.5 rounded-xl text-white text-xs font-medium transition"
                            style={{ background: actualizando === p.id ? '#44403c' : '#C0350F' }}>
                            {actualizando === p.id
                              ? 'Actualizando...'
                              : `→ Marcar como ${ESTADO_LABEL[siguienteEstado]?.label}`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pedidos entregados hoy */}
            {pedidosEntregados.length > 0 && (
              <div>
                <h2 className="text-stone-600 font-serif font-bold mb-3 text-sm">
                  Entregados hoy ({pedidosEntregados.length})
                </h2>
                <div className="space-y-2">
                  {pedidosEntregados.map(p => (
                    <div key={p.id} className="rounded-xl p-3 flex items-center justify-between"
                      style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)' }}>
                      <div>
                        <p className="text-stone-400 text-sm">{p.nombre_cafe}</p>
                        <p className="text-stone-600 text-xs">{p.mesa}</p>
                      </div>
                      <span className="text-green-600 text-xs">✓ Entregado</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}