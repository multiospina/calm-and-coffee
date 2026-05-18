import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag, Clock, CheckCircle, XCircle,
  Coffee, RefreshCw, AlertTriangle, Users,
  TrendingUp, Zap
} from 'lucide-react';
import api from '../../../api/axios';

const ESTADO_INFO = {
  pendiente_pago: { label:'Pendiente pago', color:'#D4A847', bg:'#FFF8E1', borde:'#FFE082' },
  pagado:         { label:'Pagado',          color:'#1B4F8A', bg:'#EBF2FF', borde:'#C2D6F8' },
  en_preparacion: { label:'Preparando',      color:'#C0350F', bg:'#FFF0EB', borde:'#FECACA' },
  listo:          { label:'Listo',           color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC' },
  entregado:      { label:'Entregado',       color:'#94A3B8', bg:'#F8F9FA', borde:'#E2E8F0' },
  cancelado:      { label:'Cancelado',       color:'#DC2626', bg:'#FEF2F2', borde:'#FECACA' },
};

function TimerVivo({ fecha, estado }) {
  const [mins, setMins] = useState(0);
  const [segs, setSegs] = useState(0);

  useEffect(() => {
    const calc = () => {
      const diff = Math.floor((new Date() - new Date(fecha)) / 1000);
      setMins(Math.floor(diff / 60));
      setSegs(diff % 60);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [fecha]);

  const urgente = mins >= 10 && !['entregado','cancelado'].includes(estado);
  return (
    <span className="font-mono text-xs font-bold"
      style={{ color: urgente ? '#C0350F' : '#94A3B8' }}>
      {String(mins).padStart(2,'0')}:{String(segs).padStart(2,'0')}
      {urgente && ' ⚠'}
    </span>
  );
}

export default function PedidosHoy() {
  const [data,       setData]       = useState(null);
  const [cargando,   setCargando]   = useState(true);
  const [filtroEst,  setFiltroEst]  = useState('todos');
  const [filtroMesa, setFiltroMesa] = useState('Todas');
  const [autoRef,    setAutoRef]    = useState(true);
  const [ultimaAct,  setUltimaAct]  = useState(null);

  const cargar = useCallback(async () => {
    try {
      const res = await api.get('/gerente/pedidos/hoy');
      setData(res.data);
      setUltimaAct(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    if (!autoRef) return;
    const interval = setInterval(cargar, 15000);
    return () => clearInterval(interval);
  }, [cargar, autoRef]);

  const pedidos = data?.pedidos || [];
  const resumen = data?.resumen  || {};

  const filtrados = pedidos.filter(p => {
    const porEst  = filtroEst === 'todos'   ? true :
                    filtroEst === 'activos' ? !['entregado','cancelado'].includes(p.estado) :
                    p.estado === filtroEst;
    const porMesa = filtroMesa === 'Todas' ? true : p.mesa === filtroMesa;
    return porEst && porMesa;
  });

  const urgentes = pedidos.filter(p =>
    !['entregado','cancelado'].includes(p.estado) &&
    Math.floor(parseFloat(p.minutos_esperando)||0) >= 10
  );

  const tasaEntrega = resumen.total > 0
    ? Math.round((resumen.entregados / resumen.total) * 100) : 0;

  if (cargando) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Alerta urgentes */}
      {urgentes.length > 0 && (
        <div className="rounded-2xl p-4 flex items-center gap-3 animate-pulse"
          style={{ background:'#FEF2F2', border:'2px solid #FECACA' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:'#FEE2E2' }}>
            <AlertTriangle size={20} color="#C0350F" />
          </div>
          <div>
            <p className="font-serif font-bold" style={{ color:'#C0350F' }}>
              {urgentes.length} pedido{urgentes.length>1?'s':''} urgente{urgentes.length>1?'s':''}
            </p>
            <p className="text-xs mt-0.5" style={{ color:'#F87171' }}>
              {urgentes.map(u => u.mesa).join(' · ')} — llevan más de 10 minutos
            </p>
          </div>
        </div>
      )}

      {/* Métricas grandes */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label:'Total hoy',    value: resumen.total      || 0, color:'#1B4F8A', bg:'#EBF2FF', borde:'#C2D6F8', icon: ShoppingBag, sub:'pedidos registrados' },
          { label:'Activos',      value: resumen.activos    || 0, color:'#C0350F', bg:'#FFF0EB', borde:'#FECACA', icon: Zap,         sub:'en proceso ahora'    },
          { label:'Entregados',   value: resumen.entregados || 0, color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC', icon: CheckCircle, sub:'completados hoy'     },
          { label:'Tasa entrega', value: `${tasaEntrega}%`, color:'#8A6200', bg:'#FFF8E1', borde:'#FFE082', icon: TrendingUp,  sub:'de pedidos'          },
        ].map((m,i) => (
          <div key={i} className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background:'white', border:`1.5px solid ${m.borde}`, boxShadow:'0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background:m.bg }}>
              <m.icon size={20} color={m.color} />
            </div>
            <div>
              <p className="font-serif font-bold text-2xl leading-none" style={{ color:m.color }}>
                {m.value}
              </p>
              <p className="text-stone-600 text-xs font-medium mt-0.5">{m.label}</p>
              <p className="text-stone-300 text-xs">{m.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mapa de mesas */}
      <div className="rounded-2xl p-4"
        style={{ background:'white', border:'1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-stone-400 tracking-wider">MESAS EN VIVO</p>
          <div className="flex items-center gap-3">
            {[
              { color:'#C0350F', bg:'#FFF0EB', label:'Activo'    },
              { color:'#1D7A4E', bg:'#EDFAF4', label:'Listo'     },
              { color:'#94A3B8', bg:'#F8F9FA', label:'Libre'     },
            ].map((l,i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background:l.color }} />
                <span className="text-xs text-stone-400">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {['Mesa-1','Mesa-2','Mesa-3','Mesa-4','Mesa-5'].map(mesa => {
            const pMesa   = pedidos.filter(p => p.mesa === mesa);
            const activo  = pMesa.find(p => !['entregado','cancelado'].includes(p.estado));
            const listo   = activo?.estado === 'listo';
            const entregado = !activo && pMesa.some(p => p.estado === 'entregado');
            const urgente = activo && Math.floor(parseFloat(activo?.minutos_esperando)||0) >= 10;
            const seleccionada = filtroMesa === mesa;

            return (
              <button key={mesa}
                onClick={() => setFiltroMesa(filtroMesa === mesa ? 'Todas' : mesa)}
                className="rounded-2xl transition-all"
                style={{
                  background: urgente   ? '#FEF2F2' :
                              listo     ? '#EDFAF4' :
                              activo    ? '#FFF0EB' :
                              entregado ? '#F8F9FA' : '#F8F9FA',
                  border: `2px solid ${
                    seleccionada ? '#1B4F8A' :
                    urgente      ? '#FECACA' :
                    listo        ? '#A8E8CC' :
                    activo       ? '#FECACA' : '#E2E8F0'
                  }`,
                  transform: seleccionada ? 'scale(1.08)' : 'scale(1)',
                  padding: '10px 4px',
                }}>

                {/* Icono de mesa */}
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-1"
                  style={{
                    background: urgente ? '#C0350F' : listo ? '#1D7A4E' : activo ? '#FFF0EB' : '#E2E8F0'
                  }}>
                  <Coffee size={14} color={
                    urgente ? 'white' : listo ? 'white' : activo ? '#C0350F' : '#94A3B8'
                  } />
                </div>

                <p className="text-xs font-bold text-center" style={{
                  color: urgente ? '#C0350F' : listo ? '#1D7A4E' : activo ? '#C0350F' : '#94A3B8'
                }}>
                  {mesa.replace('Mesa-','M')}
                </p>

                {activo && (
                  <p className="text-center font-mono" style={{ fontSize:'9px', color: urgente ? '#C0350F' : '#94A3B8' }}>
                    {Math.floor(parseFloat(activo.minutos_esperando)||0)}m
                  </p>
                )}

                {!activo && !entregado && (
                  <p className="text-center text-stone-300" style={{ fontSize:'9px' }}>libre</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-refresh + filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1.5 flex-1 flex-wrap">
          {[
            { id:'todos',     label:'Todos'     },
            { id:'activos',   label:'Activos'   },
            { id:'entregado', label:'Entregados'},
            { id:'cancelado', label:'Cancelados'},
          ].map(f => (
            <button key={f.id}
              onClick={() => setFiltroEst(f.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition"
              style={{
                background: filtroEst === f.id ? '#1B4F8A' : '#F0F6FF',
                color:      filtroEst === f.id ? 'white'   : '#1B4F8A',
              }}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {ultimaAct && (
            <span className="text-xs text-stone-300">
              {ultimaAct.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' })}
            </span>
          )}
          <button onClick={cargar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{ background:'#F8F9FA', color:'#4A5568' }}>
            <RefreshCw size={11} />
            Actualizar
          </button>
          <button onClick={() => setAutoRef(!autoRef)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{
              background: autoRef ? '#EDFAF4' : '#F8F9FA',
              color:      autoRef ? '#1D7A4E' : '#4A5568',
              border:     autoRef ? '1px solid #A8E8CC' : '1px solid #E2E8F0'
            }}>
            {autoRef ? 'Auto ✓' : 'Auto'}
          </button>
        </div>
      </div>

      {/* Lista pedidos */}
      {filtrados.length === 0 ? (
        <div className="rounded-2xl py-14 text-center"
          style={{ background:'white', border:'1px solid #E2E8F0' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background:'#F8F9FA' }}>
            <Coffee size={24} color="#E2E8F0" />
          </div>
          <p className="font-serif font-semibold text-stone-400 mb-1">Sin pedidos</p>
          <p className="text-stone-300 text-sm">No hay pedidos en este filtro</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map((p,i) => {
            const est     = ESTADO_INFO[p.estado] || ESTADO_INFO.pendiente_pago;
            const urgente = Math.floor(parseFloat(p.minutos_esperando)||0) >= 10
                           && !['entregado','cancelado'].includes(p.estado);
            return (
              <div key={i} className="rounded-2xl overflow-hidden transition-all"
                style={{
                  background:'white',
                  border:`1.5px solid ${urgente ? '#FECACA' : est.borde}`,
                  boxShadow: urgente ? '0 0 0 3px rgba(254,202,202,0.2)' : '0 1px 8px rgba(0,0,0,0.04)'
                }}>

                {/* Barra de estado arriba */}
                <div className="h-1" style={{ background: est.color, opacity:0.6 }} />

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background:est.bg }}>
                        {p.estado === 'entregado'
                          ? <CheckCircle size={16} color={est.color} />
                          : p.estado === 'cancelado'
                          ? <XCircle size={16} color={est.color} />
                          : <Coffee size={16} color={est.color} />}
                      </div>
                      <div>
                        <p className="font-serif font-bold text-stone-800">
                          {p.nombre_cafe}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                            style={{ background:'#F1F0EE', color:'#4A5568' }}>
                            {p.mesa}
                          </span>
                          <div className="flex items-center gap-1">
                            <Users size={10} color="#CBD5E0" />
                            <span className="text-xs text-stone-400">{p.nombre_cliente}</span>
                          </div>
                        </div>
                        {p.notas_cliente && (
                          <p className="text-xs italic mt-1.5 px-2 py-1 rounded-lg"
                            style={{ background:'#FFF8E1', color:'#8A6200' }}>
                            {p.notas_cliente}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium block"
                        style={{ background:est.bg, color:est.color }}>
                        {est.label}
                      </span>
                      <div className="mt-1.5">
                        <TimerVivo fecha={p.creado_en} estado={p.estado} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}