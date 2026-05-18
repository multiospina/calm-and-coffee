import { useState, useEffect, useCallback } from 'react';
import {
  Users, Clock, Coffee, MapPin,
  CheckCircle, AlertTriangle, RefreshCw,
  Building2, Star
} from 'lucide-react';
import api from '../../../api/axios';

const ESTADO_TURNO = {
  activo:    { label:'En turno',  color:'#1D7A4E', bg:'#EDFAF4', dot:'#1D7A4E' },
  pendiente: { label:'Pendiente', color:'#D4A847', bg:'#FFF8E1', dot:'#D4A847' },
  cerrado:   { label:'Cerrado',   color:'#94A3B8', bg:'#F8F9FA', dot:'#94A3B8' },
};

export default function VisionGeneral() {
  const [empleados, setEmpleados] = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [filtro,    setFiltro]    = useState('todos');
  const [autoRef,   setAutoRef]   = useState(true);

  const cargar = useCallback(async () => {
    try {
      const res = await api.get('/gerente/vision-general');
      setEmpleados(res.data.empleados || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    if (!autoRef) return;
    const interval = setInterval(cargar, 20000);
    return () => clearInterval(interval);
  }, [cargar, autoRef]);

  const enTurno   = empleados.filter(e => e.estado_turno === 'activo');
  const sinTurno  = empleados.filter(e => !e.turno_id);
  const pendiente = empleados.filter(e => e.estado_turno === 'pendiente');

  // Agrupar por cafetería
  const porCafeteria = empleados.reduce((acc, e) => {
    const key = e.nombre_cafeteria || 'Sin cafetería asignada hoy';
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  const filtrados = filtro === 'todos'     ? empleados :
                   filtro === 'en_turno'  ? enTurno   :
                   filtro === 'sin_turno' ? sinTurno  : empleados;

  if (cargando) return (
    <div className="flex justify-center py-12">
      <div className="w-7 h-7 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Resumen global */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'En turno ahora', value: enTurno.length,   color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC', icon: CheckCircle   },
          { label:'Sin turno hoy',  value: sinTurno.length,  color:'#94A3B8', bg:'#F8F9FA', borde:'#E2E8F0', icon: Clock         },
          { label:'Total equipo',   value: empleados.length, color:'#1B4F8A', bg:'#EBF2FF', borde:'#C2D6F8', icon: Users         },
        ].map((s,i) => (
          <button key={i}
            onClick={() => setFiltro(
              s.label === 'En turno ahora' ? 'en_turno' :
              s.label === 'Sin turno hoy'  ? 'sin_turno' : 'todos'
            )}
            className="rounded-2xl p-3 text-center transition-all"
            style={{
              background: s.bg,
              border:`1.5px solid ${s.borde}`,
            }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-1"
              style={{ background:`${s.color}20` }}>
              <s.icon size={15} color={s.color} />
            </div>
            <p className="font-serif font-bold text-xl" style={{ color:s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5 leading-tight" style={{ color:s.color }}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* Alerta si hay pendientes */}
      {pendiente.length > 0 && (
        <div className="rounded-2xl p-3 flex items-center gap-3"
          style={{ background:'#FFF8E1', border:'1.5px solid #FFE082' }}>
          <AlertTriangle size={16} color="#D4A847" />
          <p className="text-sm font-medium" style={{ color:'#8A6200' }}>
            {pendiente.length} barista{pendiente.length>1?'s':''} con turno pendiente de iniciar
          </p>
        </div>
      )}

      {/* Controles */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5 flex-1 flex-wrap">
          {[
            { id:'todos',     label:'Todos'      },
            { id:'en_turno',  label:'En turno'   },
            { id:'sin_turno', label:'Sin turno'  },
          ].map(f => (
            <button key={f.id}
              onClick={() => setFiltro(f.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition"
              style={{
                background: filtro===f.id ? '#1B4F8A' : '#F0F6FF',
                color:      filtro===f.id ? 'white'   : '#1B4F8A',
              }}>
              {f.label}
            </button>
          ))}
        </div>
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

      {/* Vista por cafetería cuando filtro es todos */}
      {filtro === 'todos' ? (
        Object.entries(porCafeteria).map(([cafNombre, emps], ci) => (
          <div key={ci} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background:'#EBF2FF' }}>
                <Building2 size={13} color="#1B4F8A" />
              </div>
              <p className="font-serif font-bold text-stone-700 text-sm">{cafNombre}</p>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background:'#EBF2FF', color:'#1B4F8A' }}>
                {emps.length} baristas
              </span>
            </div>
            {emps.map((e,i) => (
              <TarjetaEmpleado key={i} empleado={e} />
            ))}
          </div>
        ))
      ) : (
        <div className="space-y-2">
          {filtrados.length === 0 ? (
            <div className="rounded-2xl py-12 text-center"
              style={{ background:'white', border:'1px solid #E2E8F0' }}>
              <Users size={28} color="#E2E8F0" className="mx-auto mb-3" />
              <p className="text-stone-300 text-sm">Sin empleados en este filtro</p>
            </div>
          ) : filtrados.map((e,i) => (
            <TarjetaEmpleado key={i} empleado={e} />
          ))}
        </div>
      )}
    </div>
  );
}

function TarjetaEmpleado({ empleado: e }) {
  const est = e.estado_turno
    ? (ESTADO_TURNO[e.estado_turno] || ESTADO_TURNO.cerrado)
    : { label:'Sin turno hoy', color:'#94A3B8', bg:'#F8F9FA', dot:'#94A3B8' };

  return (
    <div className="rounded-2xl p-4"
      style={{
        background:'white',
        border:`1.5px solid ${e.estado_turno==='activo' ? '#C2D6F8' : '#E2E8F0'}`,
      }}>
      <div className="flex items-start gap-3">

        {/* Avatar */}
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 font-serif font-bold"
          style={{
            background: e.estado_turno==='activo' ? '#EBF2FF' : '#F8F9FA',
            color:      e.estado_turno==='activo' ? '#1B4F8A' : '#94A3B8',
            fontSize:'18px'
          }}>
          {e.nombre.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-serif font-bold text-stone-800">{e.nombre}</p>
              <p className="text-stone-400 text-xs truncate">{e.email}</p>
              {e.municipio && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={9} color="#CBD5E0" />
                  <span className="text-xs text-stone-300">{e.municipio}</span>
                </div>
              )}
            </div>

            {/* Badge estado */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: est.dot }} />
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background:est.bg, color:est.color }}>
                {est.label}
              </span>
            </div>
          </div>

          {/* Info del turno */}
          {e.turno_id && (
            <div className="mt-2 p-2.5 rounded-xl flex items-center gap-3"
              style={{ background:'#F0F6FF' }}>
              <Clock size={12} color="#1B4F8A" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-stone-600 truncate">
                  {e.nombre_turno}
                </p>
                <p className="text-xs text-stone-400">
                  {e.hora_inicio} — {e.hora_fin}
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <div className="text-center">
                  <p className="font-bold text-sm" style={{ color:'#C0350F' }}>
                    {e.pedidos_hoy || 0}
                  </p>
                  <p className="text-xs text-stone-400">pedidos</p>
                </div>
                {e.satisfaccion && (
                  <div className="text-center">
                    <p className="font-bold text-sm" style={{ color:'#D4A847' }}>
                      {e.satisfaccion}★
                    </p>
                    <p className="text-xs text-stone-400">satisf.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sin turno */}
          {!e.turno_id && (
            <div className="mt-2 px-3 py-2 rounded-xl"
              style={{ background:'#F8F9FA' }}>
              <p className="text-xs text-stone-400">Sin turno asignado para hoy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}