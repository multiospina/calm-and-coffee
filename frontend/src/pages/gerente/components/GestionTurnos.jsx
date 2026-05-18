import { useState, useEffect } from 'react';
import {
  Clock, Plus, X, Users, UserPlus,
  Check, ChevronDown, ChevronUp,
  AlertCircle, Play, Square, Trash2,
  UserMinus, Calendar
} from 'lucide-react';
import api from '../../../api/axios';

const ESTADO_INFO = {
  pendiente: { label:'Pendiente', color:'#D4A847', bg:'#FFF8E1', borde:'#FFE082' },
  activo:    { label:'Activo',    color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC' },
  cerrado:   { label:'Cerrado',   color:'#94A3B8', bg:'#F8F9FA', borde:'#E2E8F0' },
};

const FILTROS_FECHA = [
  { id:'hoy',    label:'Hoy'          },
  { id:'semana', label:'Esta semana'  },
  { id:'todos',  label:'Todos'        },
];

export default function GestionTurnos() {
  const [turnos,    setTurnos]    = useState([]);
  const [baristas,  setBaristas]  = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [creando,   setCreando]   = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [asignando, setAsignando] = useState(null);
  const [filtroFecha, setFiltroFecha] = useState('hoy');
  const [toast,     setToast]     = useState(null);
  const [form, setForm] = useState({
    nombre:'', fecha:'', hora_inicio:'', hora_fin:''
  });

  useEffect(() => {
    cargarTurnos();
    cargarBaristas();
  }, []);

  const cargarTurnos = async () => {
    setCargando(true);
    try {
      const res = await api.get('/gerente/turnos');
      setTurnos(res.data.turnos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const cargarBaristas = async () => {
    try {
      const res = await api.get('/gerente/baristas');
      setBaristas(res.data.baristas || []);
    } catch (err) {
      console.error(err);
    }
  };

  const mostrarToast = (msg, tipo='ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const crearTurno = async () => {
    if (!form.nombre || !form.fecha || !form.hora_inicio || !form.hora_fin) return;
    setGuardando(true);
    try {
      await api.post('/gerente/turnos', form);
      setCreando(false);
      setForm({ nombre:'', fecha:'', hora_inicio:'', hora_fin:'' });
      mostrarToast('Turno creado exitosamente');
      cargarTurnos();
    } catch (err) {
      mostrarToast('Error al crear turno', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (turnoId, estado, nombre) => {
    const mensajes = {
      activo:   `¿Activar turno "${nombre}"? Los demás turnos activos se cerrarán.`,
      cerrado:  `¿Cerrar turno "${nombre}"?`,
      pendiente:`¿Marcar como pendiente "${nombre}"?`,
    };
    if (!window.confirm(mensajes[estado])) return;
    try {
      await api.put(`/gerente/turnos/${turnoId}/estado`, { estado });
      mostrarToast(`Turno ${estado === 'activo' ? 'activado' : estado === 'cerrado' ? 'cerrado' : 'actualizado'}`);
      cargarTurnos();
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error', 'error');
    }
  };

  const eliminarTurno = async (turnoId, nombre) => {
    if (!window.confirm(`¿Eliminar turno "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/gerente/turnos/${turnoId}`);
      mostrarToast(`Turno "${nombre}" eliminado`);
      cargarTurnos();
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'No se puede eliminar', 'error');
    }
  };

  const asignarBarista = async (turnoId, baristaId) => {
    try {
      await api.post(`/gerente/turnos/${turnoId}/baristas`, { barista_id: baristaId });
      mostrarToast('Barista asignado');
      setAsignando(null);
      cargarTurnos();
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error', 'error');
    }
  };

  const desasignarBarista = async (turnoId, baristaId, nombre) => {
    if (!window.confirm(`¿Desasignar a ${nombre} de este turno?`)) return;
    try {
      await api.delete(`/gerente/turnos/${turnoId}/baristas/${baristaId}`);
      mostrarToast(`${nombre} desasignado del turno`);
      cargarTurnos();
    } catch (err) {
      mostrarToast('Error al desasignar', 'error');
    }
  };

  // Filtrar por fecha
  const hoy = new Date().toISOString().split('T')[0];
  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());

  const turnosFiltrados = turnos.filter(t => {
    const fechaTurno = t.fecha?.split('T')[0];
    if (filtroFecha === 'hoy')    return fechaTurno === hoy;
    if (filtroFecha === 'semana') return new Date(fechaTurno) >= inicioSemana;
    return true;
  });

  const turnoActivo = turnos.find(t => t.estado === 'activo');

  return (
    <div className="space-y-4">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium"
          style={{
            background: toast.tipo==='ok' ? '#EDFAF4' : '#FEF2F2',
            border: `1px solid ${toast.tipo==='ok' ? '#A8E8CC' : '#FECACA'}`,
            color:  toast.tipo==='ok' ? '#1D7A4E' : '#DC2626',
            boxShadow:'0 8px 30px rgba(0,0,0,0.12)'
          }}>
          {toast.tipo==='ok' ? <Check size={15}/> : <AlertCircle size={15}/>}
          {toast.msg}
        </div>
      )}

      {/* Turno activo ahora */}
      {turnoActivo ? (
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background:'#EDFAF4', border:'1.5px solid #A8E8CC' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:'#1D7A4E' }}>
            <Clock size={18} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="font-serif font-bold text-stone-800">{turnoActivo.nombre}</p>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {turnoActivo.hora_inicio} — {turnoActivo.hora_fin}
              {turnoActivo.baristas?.length > 0 && (
                <span className="ml-2" style={{ color:'#1D7A4E' }}>
                  · {turnoActivo.baristas.map(b=>b.nombre.split(' ')[0]).join(', ')}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => cambiarEstado(turnoActivo.id, 'cerrado', turnoActivo.nombre)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition"
            style={{ background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA' }}>
            <Square size={12} />
            Cerrar turno
          </button>
        </div>
      ) : (
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background:'#FFF8E1', border:'1.5px solid #FFE082' }}>
          <AlertCircle size={16} color="#D4A847" />
          <p className="text-sm font-medium" style={{ color:'#8A6200' }}>
            No hay turno activo en este momento
          </p>
        </div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Total',    value: turnos.length,                              color:'#1B4F8A', bg:'#EBF2FF', borde:'#C2D6F8' },
          { label:'Hoy',      value: turnos.filter(t=>t.fecha?.split('T')[0]===hoy).length, color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC' },
          { label:'Baristas', value: baristas.length,                            color:'#6B3A8A', bg:'#F3EEF5', borde:'#D4B8E8' },
        ].map((s,i) => (
          <div key={i} className="rounded-2xl p-3 text-center"
            style={{ background:'white', border:`1.5px solid ${s.borde}` }}>
            <p className="font-serif font-bold text-2xl" style={{ color:s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color:s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros fecha + botón crear */}
      <div className="flex gap-2 items-center">
        <div className="flex gap-1.5 flex-1">
          {FILTROS_FECHA.map(f => (
            <button key={f.id}
              onClick={() => setFiltroFecha(f.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition"
              style={{
                background: filtroFecha===f.id ? '#1B4F8A' : '#F0F6FF',
                color:      filtroFecha===f.id ? 'white'   : '#1B4F8A',
              }}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={() => setCreando(!creando)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition"
          style={{
            background: creando ? '#FEF2F2' : '#1B4F8A',
            color:      creando ? '#DC2626' : 'white',
          }}>
          {creando ? <X size={13}/> : <Plus size={13}/>}
          {creando ? 'Cancelar' : 'Crear turno'}
        </button>
      </div>

      {/* Formulario crear */}
      {creando && (
        <div className="rounded-2xl p-5 space-y-3"
          style={{ background:'#F0F6FF', border:'1.5px solid #C2D6F8' }}>
          <p className="text-xs font-bold tracking-wider" style={{ color:'#1B4F8A' }}>
            NUEVO TURNO
          </p>
          <input
            placeholder="Nombre del turno * (ej: Turno Mañana)"
            value={form.nombre}
            onChange={e => setForm(f=>({...f,nombre:e.target.value}))}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background:'white', border:'1px solid #C2D6F8' }}
          />
          <div>
            <label className="text-xs text-stone-400 mb-1 block">Fecha</label>
            <input type="date"
              value={form.fecha}
              onChange={e => setForm(f=>({...f,fecha:e.target.value}))}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background:'white', border:'1px solid #C2D6F8' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Hora inicio</label>
              <input type="time"
                value={form.hora_inicio}
                onChange={e => setForm(f=>({...f,hora_inicio:e.target.value}))}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background:'white', border:'1px solid #C2D6F8' }}
              />
            </div>
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Hora fin</label>
              <input type="time"
                value={form.hora_fin}
                onChange={e => setForm(f=>({...f,hora_fin:e.target.value}))}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background:'white', border:'1px solid #C2D6F8' }}
              />
            </div>
          </div>
          <button onClick={crearTurno}
            disabled={guardando || !form.nombre || !form.fecha || !form.hora_inicio || !form.hora_fin}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white"
            style={{ background: guardando ? '#CBD5E0' : '#1B4F8A' }}>
            {guardando ? 'Creando...' : 'Crear turno'}
          </button>
        </div>
      )}

      {/* Lista turnos */}
      {cargando ? (
        <div className="flex justify-center py-8">
          <div className="w-7 h-7 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : turnosFiltrados.length === 0 ? (
        <div className="rounded-2xl py-12 text-center"
          style={{ background:'white', border:'1px solid #E2E8F0' }}>
          <Calendar size={28} color="#E2E8F0" className="mx-auto mb-3" />
          <p className="text-stone-400 font-semibold text-sm mb-1">Sin turnos</p>
          <p className="text-stone-300 text-xs">
            {filtroFecha === 'hoy' ? 'No hay turnos para hoy' :
             filtroFecha === 'semana' ? 'No hay turnos esta semana' : 'No hay turnos registrados'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-bold text-stone-400 tracking-wider">
            {filtroFecha === 'hoy' ? 'TURNOS DE HOY' :
             filtroFecha === 'semana' ? 'TURNOS DE ESTA SEMANA' : 'TODOS LOS TURNOS'}
            {' '}— {turnosFiltrados.length}
          </p>

          {turnosFiltrados.map((t,i) => {
            const est      = ESTADO_INFO[t.estado] || ESTADO_INFO.pendiente;
            const expandido = asignando === t.id;
            const fechaF   = new Date(t.fecha).toLocaleDateString('es-CO', {
              weekday:'short', day:'numeric', month:'short'
            });

            return (
              <div key={i} className="rounded-2xl overflow-hidden"
                style={{ background:'white', border:`1.5px solid ${est.borde}` }}>

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background:est.bg }}>
                        <Clock size={17} color={est.color} />
                      </div>
                      <div>
                        <p className="font-serif font-bold text-stone-800">{t.nombre}</p>
                        <p className="text-stone-400 text-xs mt-0.5 capitalize">{fechaF}</p>
                        <p className="text-xs font-medium mt-0.5" style={{ color:'#1B4F8A' }}>
                          {t.hora_inicio} — {t.hora_fin}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize flex-shrink-0"
                      style={{ background:est.bg, color:est.color }}>
                      {est.label}
                    </span>
                  </div>

                  {/* Baristas asignados */}
                  {t.baristas?.length > 0 && (
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Users size={12} color="#94A3B8" />
                      {t.baristas.map((b,j) => (
                        <div key={j} className="flex items-center gap-1 px-2 py-1 rounded-full"
                          style={{ background:'#EBF2FF' }}>
                          <span className="text-xs font-medium" style={{ color:'#1B4F8A' }}>
                            {b.nombre.split(' ')[0]}
                          </span>
                          <button
                            onClick={() => desasignarBarista(t.id, b.id, b.nombre.split(' ')[0])}
                            className="ml-0.5 hover:opacity-70 transition">
                            <X size={10} color="#1B4F8A" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2 flex-wrap">

                    {/* Cambiar estado */}
                    {t.estado === 'pendiente' && (
                      <button
                        onClick={() => cambiarEstado(t.id, 'activo', t.nombre)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition"
                        style={{ background:'#EDFAF4', color:'#1D7A4E', border:'1px solid #A8E8CC' }}>
                        <Play size={11} />
                        Activar
                      </button>
                    )}
                    {t.estado === 'activo' && (
                      <button
                        onClick={() => cambiarEstado(t.id, 'cerrado', t.nombre)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition"
                        style={{ background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA' }}>
                        <Square size={11} />
                        Cerrar
                      </button>
                    )}
                    {t.estado === 'cerrado' && (
                      <button
                        onClick={() => cambiarEstado(t.id, 'pendiente', t.nombre)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition"
                        style={{ background:'#FFF8E1', color:'#8A6200', border:'1px solid #FFE082' }}>
                        <Clock size={11} />
                        Reabrir
                      </button>
                    )}

                    {/* Asignar barista */}
                    <button
                      onClick={() => setAsignando(expandido ? null : t.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition"
                      style={{
                        background: expandido ? '#EBF2FF' : '#F0F6FF',
                        color:'#1B4F8A',
                        border:'1px solid #C2D6F8'
                      }}>
                      <UserPlus size={11} />
                      Asignar
                      {expandido ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
                    </button>

                    {/* Eliminar */}
                    {t.estado !== 'activo' && (
                      <button
                        onClick={() => eliminarTurno(t.id, t.nombre)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ml-auto"
                        style={{ background:'#F8F9FA', color:'#94A3B8', border:'1px solid #E2E8F0' }}>
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Panel asignar */}
                {expandido && (
                  <div className="px-4 pb-4 space-y-2"
                    style={{ borderTop:'1px solid #EBF2FF', background:'#F8FAFF' }}>
                    <p className="text-xs font-bold pt-3 tracking-wider" style={{ color:'#1B4F8A' }}>
                      SELECCIONA BARISTA
                    </p>
                    {baristas.length === 0 ? (
                      <p className="text-stone-300 text-sm py-4 text-center">
                        Sin baristas disponibles
                      </p>
                    ) : baristas.map((b,j) => {
                      const yaAsignado = t.baristas?.some(tb => tb.id === b.id);
                      return (
                        <button key={j}
                          onClick={() => !yaAsignado && asignarBarista(t.id, b.id)}
                          disabled={yaAsignado}
                          className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition"
                          style={{
                            background: yaAsignado ? '#EDFAF4' : 'white',
                            border:`1.5px solid ${yaAsignado ? '#A8E8CC' : '#E2E8F0'}`,
                          }}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold flex-shrink-0"
                            style={{
                              background: yaAsignado ? '#EDFAF4' : '#EBF2FF',
                              color: yaAsignado ? '#1D7A4E' : '#1B4F8A'
                            }}>
                            {b.nombre.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-stone-700 text-sm font-semibold truncate">{b.nombre}</p>
                            <p className="text-stone-400 text-xs">{b.turnos_asignados} turnos asignados</p>
                          </div>
                          {yaAsignado ? (
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <Check size={13} color="#1D7A4E" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  desasignarBarista(t.id, b.id, b.nombre.split(' ')[0]);
                                }}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                                style={{ background:'#FEF2F2', color:'#DC2626' }}>
                                <UserMinus size={11} />
                                Quitar
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                              style={{ background:'#EBF2FF', color:'#1B4F8A' }}>
                              Asignar
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}