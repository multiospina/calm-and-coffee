import { useState, useEffect } from 'react';
import {
  MapPin, Plus, Edit2, X, Check,
  Leaf, Thermometer, Droplets, Sun,
  ChevronDown, ChevronUp, AlertCircle,
  Trees, Sprout, Calendar, Layers,
  Mountain, Wind, Info
} from 'lucide-react';
import api from '../../../api/axios';

const PROCESO_INFO = {
  lavado:    { color:'#1B4F8A', bg:'#EBF2FF' },
  honey:     { color:'#8A6200', bg:'#FFF8E1' },
  natural:   { color:'#1D7A4E', bg:'#EDFAF4' },
  anaerobico:{ color:'#6B3A8A', bg:'#F3EEF5' },
};

const ESTADO_LOTE = {
  siembra:    { label:'En siembra',    color:'#1D7A4E', bg:'#EDFAF4' },
  crecimiento:{ label:'Crecimiento',   color:'#8A6200', bg:'#FFF8E1' },
  produccion: { label:'En producción', color:'#6B3A8A', bg:'#F3EEF5' },
  descanso:   { label:'Descanso',      color:'#94A3B8', bg:'#F8F9FA' },
};

export default function MisFincas() {
  const [fincas,      setFincas]      = useState([]);
  const [lotes,       setLotes]       = useState({});
  const [cargando,    setCargando]    = useState(true);
  const [creando,     setCreando]     = useState(false);
  const [editando,    setEditando]    = useState(null);
  const [expandida,   setExpandida]   = useState(null);
  const [addLote,     setAddLote]     = useState(null);
  const [guardando,   setGuardando]   = useState(false);
  const [toast,       setToast]       = useState(null);
  const [vistaFinca,  setVistaFinca]  = useState('info'); // info | lotes | ambiente
  const [formLote,    setFormLote]    = useState({
    nombre:'', variedad:'', proceso_base:'lavado',
    fecha_siembra:'', num_arboles:'', area_hectareas:'',
    origen_semilla:'', parcela_ubicacion:'', notas_siembra:''
  });
  const [form, setForm] = useState({
    nombre:'', municipio:'', departamento:'Cundinamarca',
    altitud_msnm:'', area_hectareas:'', num_arboles:'',
    historia:'', proceso_principal:'lavado',
    temporada_cosecha:'', temp_promedio:'',
    precipitacion_mm:'', tipo_suelo:''
  });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await api.get('/caficultor/fincas');
      setFincas(res.data.fincas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const cargarLotes = async (fincaId) => {
    try {
      const res = await api.get(`/caficultor/fincas/${fincaId}/lotes`);
      setLotes(prev => ({ ...prev, [fincaId]: res.data.lotes || [] }));
    } catch (err) {
      console.error(err);
    }
  };

  const mostrarToast = (msg, tipo='ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const crearFinca = async () => {
    if (!form.nombre || !form.municipio || !form.altitud_msnm) return;
    setGuardando(true);
    try {
      await api.post('/caficultor/fincas', {
        ...form,
        altitud_msnm:    parseInt(form.altitud_msnm),
        area_hectareas:  parseFloat(form.area_hectareas)  || null,
        num_arboles:     parseInt(form.num_arboles)        || null,
        temp_promedio:   parseFloat(form.temp_promedio)    || null,
        precipitacion_mm:parseFloat(form.precipitacion_mm) || null,
      });
      mostrarToast(`Finca "${form.nombre}" creada`);
      setCreando(false);
      setForm({ nombre:'', municipio:'', departamento:'Cundinamarca', altitud_msnm:'', area_hectareas:'', num_arboles:'', historia:'', proceso_principal:'lavado', temporada_cosecha:'', temp_promedio:'', precipitacion_mm:'', tipo_suelo:'' });
      cargar();
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const guardarEdicion = async () => {
    if (!editando) return;
    setGuardando(true);
    try {
      await api.put(`/caficultor/fincas/${editando.id}`, form);
      mostrarToast('Finca actualizada');
      setEditando(null);
      cargar();
    } catch (err) {
      mostrarToast('Error al actualizar', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const crearLote = async (fincaId) => {
    if (!formLote.nombre || !formLote.variedad) return;
    setGuardando(true);
    try {
      await api.post(`/caficultor/fincas/${fincaId}/lotes`, {
        ...formLote,
        num_arboles:    parseInt(formLote.num_arboles)    || null,
        area_hectareas: parseFloat(formLote.area_hectareas) || null,
      });
      mostrarToast(`Lote "${formLote.nombre}" creado`);
      setAddLote(null);
      setFormLote({ nombre:'', variedad:'', proceso_base:'lavado', fecha_siembra:'', num_arboles:'', area_hectareas:'', origen_semilla:'', parcela_ubicacion:'', notas_siembra:'' });
      cargarLotes(fincaId);
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const toggleExpandir = (id) => {
    if (expandida === id) {
      setExpandida(null);
    } else {
      setExpandida(id);
      setVistaFinca('info');
      if (!lotes[id]) cargarLotes(id);
    }
  };

  if (cargando) return (
    <div className="flex justify-center py-12">
      <div className="w-7 h-7 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium"
          style={{
            background: toast.tipo==='ok' ? '#EDFAF4' : '#FEF2F2',
            border:`1px solid ${toast.tipo==='ok' ? '#A8E8CC' : '#FECACA'}`,
            color: toast.tipo==='ok' ? '#1D7A4E' : '#DC2626',
            boxShadow:'0 8px 30px rgba(0,0,0,0.12)'
          }}>
          {toast.tipo==='ok' ? <Check size={15}/> : <AlertCircle size={15}/>}
          {toast.msg}
        </div>
      )}

      {/* Botón crear */}
      <button onClick={() => setCreando(!creando)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition"
        style={{
          background: creando ? '#FEF2F2' : '#3D1A5C',
          color:      creando ? '#DC2626' : 'white',
        }}>
        {creando ? <X size={16}/> : <Plus size={16}/>}
        {creando ? 'Cancelar' : 'Registrar nueva finca'}
      </button>

      {/* Formulario crear finca */}
      {creando && (
        <div className="rounded-2xl p-5 space-y-4"
          style={{ background:'#FAF5FF', border:'1.5px solid #D4B8E8' }}>
          <p className="text-xs font-bold tracking-wider" style={{ color:'#6B3A8A' }}>
            NUEVA FINCA
          </p>

          {/* Básicos */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-500">Información básica</p>
            <input placeholder="Nombre de la finca *"
              value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background:'white', border:'1px solid #D4B8E8' }} />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Municipio *"
                value={form.municipio} onChange={e => setForm(f=>({...f,municipio:e.target.value}))}
                className="px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background:'white', border:'1px solid #D4B8E8' }} />
              <input placeholder="Departamento"
                value={form.departamento} onChange={e => setForm(f=>({...f,departamento:e.target.value}))}
                className="px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background:'white', border:'1px solid #D4B8E8' }} />
              <input placeholder="Altitud (msnm) *" type="number"
                value={form.altitud_msnm} onChange={e => setForm(f=>({...f,altitud_msnm:e.target.value}))}
                className="px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background:'white', border:'1px solid #D4B8E8' }} />
              <input placeholder="Área (ha)"  type="number"
                value={form.area_hectareas} onChange={e => setForm(f=>({...f,area_hectareas:e.target.value}))}
                className="px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background:'white', border:'1px solid #D4B8E8' }} />
              <input placeholder="Núm. árboles" type="number"
                value={form.num_arboles} onChange={e => setForm(f=>({...f,num_arboles:e.target.value}))}
                className="px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background:'white', border:'1px solid #D4B8E8' }} />
              <input placeholder="Temporada cosecha"
                value={form.temporada_cosecha} onChange={e => setForm(f=>({...f,temporada_cosecha:e.target.value}))}
                className="px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background:'white', border:'1px solid #D4B8E8' }} />
            </div>
          </div>

          {/* Proceso */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-500">Proceso principal</p>
            <div className="grid grid-cols-4 gap-2">
              {['lavado','honey','natural','anaerobico'].map(p => {
                const info = PROCESO_INFO[p];
                return (
                  <button key={p} onClick={() => setForm(f=>({...f,proceso_principal:p}))}
                    className="py-2 rounded-xl text-xs font-medium capitalize"
                    style={{
                      background: form.proceso_principal===p ? info.color : '#F8F9FA',
                      color:      form.proceso_principal===p ? 'white'    : '#4A5568',
                    }}>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ambiente */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-500">Datos ambientales</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background:'white', border:'1px solid #D4B8E8' }}>
                <Thermometer size={13} color="#6B3A8A" />
                <input placeholder="Temp °C" type="number"
                  value={form.temp_promedio} onChange={e => setForm(f=>({...f,temp_promedio:e.target.value}))}
                  className="flex-1 text-sm outline-none bg-transparent" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background:'white', border:'1px solid #D4B8E8' }}>
                <Droplets size={13} color="#6B3A8A" />
                <input placeholder="mm lluvia" type="number"
                  value={form.precipitacion_mm} onChange={e => setForm(f=>({...f,precipitacion_mm:e.target.value}))}
                  className="flex-1 text-sm outline-none bg-transparent" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background:'white', border:'1px solid #D4B8E8' }}>
                <Layers size={13} color="#6B3A8A" />
                <input placeholder="Suelo"
                  value={form.tipo_suelo} onChange={e => setForm(f=>({...f,tipo_suelo:e.target.value}))}
                  className="flex-1 text-sm outline-none bg-transparent" />
              </div>
            </div>
          </div>

          {/* Historia */}
          <textarea placeholder="Historia de la finca..."
            value={form.historia} onChange={e => setForm(f=>({...f,historia:e.target.value}))}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{ background:'white', border:'1px solid #D4B8E8' }} />

          <button onClick={crearFinca}
            disabled={guardando || !form.nombre || !form.municipio || !form.altitud_msnm}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white"
            style={{ background: guardando ? '#CBD5E0' : '#3D1A5C' }}>
            {guardando ? 'Creando...' : 'Registrar finca'}
          </button>
        </div>
      )}

      {/* Sin fincas */}
      {fincas.length === 0 ? (
        <div className="rounded-2xl py-14 text-center"
          style={{ background:'white', border:'1px solid #E2E8F0' }}>
          <MapPin size={32} color="#E2E8F0" className="mx-auto mb-3" />
          <p className="font-serif text-stone-400 font-semibold mb-1">Sin fincas registradas</p>
          <p className="text-stone-300 text-sm">Registra tu primera finca</p>
        </div>
      ) : fincas.map((f,i) => {
        const proceso  = PROCESO_INFO[f.proceso_principal] || PROCESO_INFO.lavado;
        const exp      = expandida === f.id;
        const misLotes = lotes[f.id] || [];

        return (
          <div key={i} className="rounded-3xl overflow-hidden"
            style={{
              background:'white',
              border:'2px solid #D4B8E8',
              boxShadow:'0 4px 20px rgba(61,26,92,0.08)'
            }}>

            {/* Barra top */}
            <div className="h-1.5"
              style={{ background:'linear-gradient(90deg, #3D1A5C, #6B3A8A, #9B5ABE)' }} />

            {editando?.id === f.id ? (
              /* ── MODO EDICIÓN ── */
              <div className="p-5 space-y-3">
                <p className="text-xs font-bold tracking-wider" style={{ color:'#6B3A8A' }}>
                  EDITANDO: {f.nombre}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input defaultValue={f.nombre}
                    onChange={e => setForm(ff=>({...ff,nombre:e.target.value}))}
                    className="px-3 py-2 rounded-xl text-sm outline-none col-span-2"
                    style={{ background:'#FAF5FF', border:'1px solid #D4B8E8' }} />
                  <input defaultValue={f.municipio} placeholder="Municipio"
                    onChange={e => setForm(ff=>({...ff,municipio:e.target.value}))}
                    className="px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background:'#FAF5FF', border:'1px solid #D4B8E8' }} />
                  <input defaultValue={f.altitud_msnm} type="number" placeholder="Altitud"
                    onChange={e => setForm(ff=>({...ff,altitud_msnm:e.target.value}))}
                    className="px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background:'#FAF5FF', border:'1px solid #D4B8E8' }} />
                  <input defaultValue={f.area_hectareas} type="number" placeholder="Hectáreas"
                    onChange={e => setForm(ff=>({...ff,area_hectareas:e.target.value}))}
                    className="px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background:'#FAF5FF', border:'1px solid #D4B8E8' }} />
                  <input defaultValue={f.num_arboles} type="number" placeholder="Árboles"
                    onChange={e => setForm(ff=>({...ff,num_arboles:e.target.value}))}
                    className="px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background:'#FAF5FF', border:'1px solid #D4B8E8' }} />
                </div>
                <textarea defaultValue={f.historia} rows={2} placeholder="Historia..."
                  onChange={e => setForm(ff=>({...ff,historia:e.target.value}))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                  style={{ background:'#FAF5FF', border:'1px solid #D4B8E8' }} />
                <div className="flex gap-2">
                  <button onClick={() => setEditando(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm"
                    style={{ background:'#F8F9FA', color:'#4A5568' }}>
                    Cancelar
                  </button>
                  <button onClick={guardarEdicion} disabled={guardando}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: guardando ? '#CBD5E0' : '#3D1A5C' }}>
                    {guardando ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background:'#F3EEF5' }}>
                      <Leaf size={22} color="#6B3A8A" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-stone-800 text-lg leading-tight">
                        {f.nombre}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={11} color="#94A3B8" />
                        <span className="text-xs text-stone-400">
                          {f.municipio}, {f.departamento}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background:'#F3EEF5', color:'#6B3A8A' }}>
                          <Mountain size={9} className="inline mr-1" />
                          {f.altitud_msnm} msnm
                        </span>
                        {f.proceso_principal && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                            style={{ background:proceso.bg, color:proceso.color }}>
                            {f.proceso_principal}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => {
                      setEditando(f);
                      setForm({
                        nombre:f.nombre, municipio:f.municipio,
                        departamento:f.departamento||'Cundinamarca',
                        altitud_msnm:f.altitud_msnm, area_hectareas:f.area_hectareas||'',
                        num_arboles:f.num_arboles||'', historia:f.historia||'',
                        proceso_principal:f.proceso_principal||'lavado',
                        temporada_cosecha:f.temporada_cosecha||'',
                        temp_promedio:f.temp_promedio||'',
                        precipitacion_mm:f.precipitacion_mm||'',
                        tipo_suelo:f.tipo_suelo||''
                      });
                    }}
                      className="p-2.5 rounded-xl"
                      style={{ background:'#F3EEF5', color:'#6B3A8A' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => toggleExpandir(f.id)}
                      className="p-2.5 rounded-xl"
                      style={{ background:'#F8F9FA', color:'#94A3B8' }}>
                      {exp ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    </button>
                  </div>
                </div>

                {/* Stats rápidas */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label:'Cosechas', value: f.total_cosechas || 0,  color:'#6B3A8A', bg:'#F3EEF5', icon: Leaf    },
                    { label:'Lotes',    value: f.total_lotes    || 0,  color:'#1D7A4E', bg:'#EDFAF4', icon: Layers  },
                    { label:'Árboles',  value: f.num_arboles ? parseInt(f.num_arboles).toLocaleString() : '—', color:'#1B4F8A', bg:'#EBF2FF', icon: Sprout },
                    { label:'Ha',       value: f.area_hectareas ? `${f.area_hectareas}` : '—', color:'#8A6200', bg:'#FFF8E1', icon: MapPin },
                  ].map((s,j) => (
                    <div key={j} className="rounded-xl p-2.5 text-center"
                      style={{ background:s.bg }}>
                      <s.icon size={12} color={s.color} className="mx-auto mb-0.5" />
                      <p className="font-bold text-sm" style={{ color:s.color }}>{s.value}</p>
                      <p className="text-xs text-stone-400" style={{ fontSize:'9px' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PANEL EXPANDIDO ── */}
            {exp && (
              <div style={{ borderTop:'2px solid #F3EEF5' }}>

                {/* Sub-tabs */}
                <div className="flex px-5 pt-4 gap-2">
                  {[
                    { id:'info',     label:'Info',     icon: Info    },
                    { id:'lotes',    label:'Lotes',    icon: Layers  },
                    { id:'ambiente', label:'Ambiente', icon: Wind    },
                  ].map(t => (
                    <button key={t.id}
                      onClick={() => setVistaFinca(t.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition"
                      style={{
                        background: vistaFinca===t.id ? '#3D1A5C' : '#F3EEF5',
                        color:      vistaFinca===t.id ? 'white'   : '#6B3A8A',
                      }}>
                      <t.icon size={11} />
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="px-5 pb-5 pt-3">

                  {/* ── INFO ── */}
                  {vistaFinca === 'info' && (
                    <div className="space-y-3">
                      {f.historia ? (
                        <div className="rounded-2xl p-4"
                          style={{ background:'#FAF5FF', border:'1px solid #E8D4F8' }}>
                          <p className="text-xs font-bold mb-2" style={{ color:'#6B3A8A' }}>
                            HISTORIA DE LA FINCA
                          </p>
                          <p className="text-sm text-stone-600 leading-relaxed">{f.historia}</p>
                        </div>
                      ) : (
                        <div className="rounded-2xl p-4 text-center"
                          style={{ background:'#FAF5FF' }}>
                          <Info size={20} color="#D4B8E8" className="mx-auto mb-2" />
                          <p className="text-sm text-stone-400">Sin historia registrada</p>
                          <button onClick={() => {
                            setEditando(f);
                            setForm({ nombre:f.nombre, municipio:f.municipio, departamento:f.departamento||'Cundinamarca', altitud_msnm:f.altitud_msnm, area_hectareas:f.area_hectareas||'', num_arboles:f.num_arboles||'', historia:'', proceso_principal:f.proceso_principal||'lavado', temporada_cosecha:f.temporada_cosecha||'', temp_promedio:f.temp_promedio||'', precipitacion_mm:f.precipitacion_mm||'', tipo_suelo:f.tipo_suelo||'' });
                          }}
                            className="mt-2 text-xs px-3 py-1.5 rounded-xl font-medium"
                            style={{ background:'#F3EEF5', color:'#6B3A8A' }}>
                            Añadir historia
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { label:'Temporada cosecha', value: f.temporada_cosecha || '—' },
                          { label:'Tipo de suelo',     value: f.tipo_suelo         || '—' },
                          { label:'Proceso principal', value: f.proceso_principal   || '—', capitalize: true },
                          { label:'Departamento',      value: f.departamento        || '—' },
                        ].map((d,j) => (
                          <div key={j} className="rounded-xl p-3"
                            style={{ background:'#F8F9FA' }}>
                            <p className="text-stone-400 mb-0.5">{d.label}</p>
                            <p className={`font-semibold text-stone-700 ${d.capitalize?'capitalize':''}`}>
                              {d.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── LOTES ── */}
                  {vistaFinca === 'lotes' && (
                    <div className="space-y-3">
                      <button
                        onClick={() => setAddLote(addLote===f.id ? null : f.id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition"
                        style={{
                          background: addLote===f.id ? '#FEF2F2' : '#3D1A5C',
                          color:      addLote===f.id ? '#DC2626'  : 'white',
                        }}>
                        {addLote===f.id ? <X size={13}/> : <Plus size={13}/>}
                        {addLote===f.id ? 'Cancelar' : 'Añadir lote de siembra'}
                      </button>

                      {/* Formulario lote */}
                      {addLote === f.id && (
                        <div className="rounded-2xl p-4 space-y-3"
                          style={{ background:'#FAF5FF', border:'1.5px solid #D4B8E8' }}>
                          <p className="text-xs font-bold tracking-wider" style={{ color:'#6B3A8A' }}>
                            NUEVO LOTE
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <input placeholder="Nombre del lote *"
                              value={formLote.nombre}
                              onChange={e => setFormLote(f=>({...f,nombre:e.target.value}))}
                              className="px-3 py-2 rounded-xl text-sm outline-none col-span-2"
                              style={{ background:'white', border:'1px solid #D4B8E8' }} />
                            <input placeholder="Variedad *"
                              value={formLote.variedad}
                              onChange={e => setFormLote(f=>({...f,variedad:e.target.value}))}
                              className="px-3 py-2 rounded-xl text-sm outline-none"
                              style={{ background:'white', border:'1px solid #D4B8E8' }} />
                            <input placeholder="Núm. árboles" type="number"
                              value={formLote.num_arboles}
                              onChange={e => setFormLote(f=>({...f,num_arboles:e.target.value}))}
                              className="px-3 py-2 rounded-xl text-sm outline-none"
                              style={{ background:'white', border:'1px solid #D4B8E8' }} />
                            <input placeholder="Área (ha)" type="number"
                              value={formLote.area_hectareas}
                              onChange={e => setFormLote(f=>({...f,area_hectareas:e.target.value}))}
                              className="px-3 py-2 rounded-xl text-sm outline-none"
                              style={{ background:'white', border:'1px solid #D4B8E8' }} />
                            <input placeholder="Origen semilla"
                              value={formLote.origen_semilla}
                              onChange={e => setFormLote(f=>({...f,origen_semilla:e.target.value}))}
                              className="px-3 py-2 rounded-xl text-sm outline-none"
                              style={{ background:'white', border:'1px solid #D4B8E8' }} />
                            <input placeholder="Ubicación parcela"
                              value={formLote.parcela_ubicacion}
                              onChange={e => setFormLote(f=>({...f,parcela_ubicacion:e.target.value}))}
                              className="px-3 py-2 rounded-xl text-sm outline-none col-span-2"
                              style={{ background:'white', border:'1px solid #D4B8E8' }} />
                          </div>
                          <div>
                            <p className="text-xs text-stone-400 mb-1">Fecha de siembra</p>
                            <input type="date"
                              value={formLote.fecha_siembra}
                              onChange={e => setFormLote(f=>({...f,fecha_siembra:e.target.value}))}
                              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                              style={{ background:'white', border:'1px solid #D4B8E8' }} />
                          </div>

                          {/* Proceso base */}
                          <div className="grid grid-cols-4 gap-1.5">
                            {['lavado','honey','natural','anaerobico'].map(p => {
                              const info = PROCESO_INFO[p];
                              return (
                                <button key={p}
                                  onClick={() => setFormLote(fl=>({...fl,proceso_base:p}))}
                                  className="py-1.5 rounded-xl text-xs font-medium capitalize"
                                  style={{
                                    background: formLote.proceso_base===p ? info.color : '#F8F9FA',
                                    color:      formLote.proceso_base===p ? 'white'    : '#4A5568',
                                  }}>
                                  {p}
                                </button>
                              );
                            })}
                          </div>

                          <textarea placeholder="Notas de siembra..."
                            value={formLote.notas_siembra}
                            onChange={e => setFormLote(f=>({...f,notas_siembra:e.target.value}))}
                            rows={2}
                            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                            style={{ background:'white', border:'1px solid #D4B8E8' }} />

                          <button
                            onClick={() => crearLote(f.id)}
                            disabled={guardando || !formLote.nombre || !formLote.variedad}
                            className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
                            style={{ background: guardando ? '#CBD5E0' : '#3D1A5C' }}>
                            {guardando ? 'Creando...' : 'Crear lote'}
                          </button>
                        </div>
                      )}

                      {/* Lista lotes */}
                      {misLotes.length === 0 ? (
                        <div className="text-center py-8 rounded-2xl"
                          style={{ background:'#FAF5FF' }}>
                          <Sprout size={24} color="#D4B8E8" className="mx-auto mb-2" />
                          <p className="text-stone-400 text-sm">Sin lotes registrados</p>
                          <p className="text-stone-300 text-xs mt-1">
                            Añade los lotes de tu finca
                          </p>
                        </div>
                      ) : misLotes.map((l,j) => {
                        const estLote = ESTADO_LOTE[l.estado] || ESTADO_LOTE.siembra;
                        const procLote = PROCESO_INFO[l.proceso_base] || PROCESO_INFO.lavado;
                        return (
                          <div key={j} className="rounded-2xl p-4"
                            style={{ background:'#FAF5FF', border:'1px solid #E8D4F8' }}>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-stone-800">{l.nombre}</p>
                                <p className="text-xs text-stone-400 mt-0.5">{l.variedad}</p>
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full font-medium"
                                style={{ background:estLote.bg, color:estLote.color }}>
                                {estLote.label}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="rounded-xl p-2 text-center"
                                style={{ background:'white' }}>
                                <Sprout size={11} color="#6B3A8A" className="mx-auto mb-0.5" />
                                <p className="font-bold text-xs" style={{ color:'#6B3A8A' }}>
                                  {l.num_arboles ? parseInt(l.num_arboles).toLocaleString() : '—'}
                                </p>
                                <p className="text-xs text-stone-400" style={{ fontSize:'9px' }}>Árboles</p>
                              </div>
                              <div className="rounded-xl p-2 text-center"
                                style={{ background:'white' }}>
                                <MapPin size={11} color="#6B3A8A" className="mx-auto mb-0.5" />
                                <p className="font-bold text-xs" style={{ color:'#6B3A8A' }}>
                                  {l.area_hectareas ? `${l.area_hectareas} ha` : '—'}
                                </p>
                                <p className="text-xs text-stone-400" style={{ fontSize:'9px' }}>Área</p>
                              </div>
                              <div className="rounded-xl p-2 text-center"
                                style={{ background:'white' }}>
                                <Calendar size={11} color="#6B3A8A" className="mx-auto mb-0.5" />
                                <p className="font-bold text-xs" style={{ color:'#6B3A8A' }}>
                                  {l.fecha_siembra ? new Date(l.fecha_siembra).getFullYear() : '—'}
                                </p>
                                <p className="text-xs text-stone-400" style={{ fontSize:'9px' }}>Año siembra</p>
                              </div>
                            </div>
                            {l.proceso_base && (
                              <div className="mt-2 flex gap-2">
                                <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                                  style={{ background:procLote.bg, color:procLote.color }}>
                                  {l.proceso_base}
                                </span>
                                {l.origen_semilla && (
                                  <span className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ background:'#F8F9FA', color:'#4A5568' }}>
                                    {l.origen_semilla}
                                  </span>
                                )}
                              </div>
                            )}
                            {l.notas_siembra && (
                              <p className="text-xs text-stone-500 mt-2 italic">
                                {l.notas_siembra}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── AMBIENTE ── */}
                  {vistaFinca === 'ambiente' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label:'Temperatura promedio', value: f.temp_promedio    ? `${f.temp_promedio}°C`  : 'No registrado', icon: Thermometer, color:'#C0350F', bg:'#FFF0EB' },
                          { label:'Precipitación anual',  value: f.precipitacion_mm ? `${f.precipitacion_mm} mm` : 'No registrado', icon: Droplets,    color:'#1B4F8A', bg:'#EBF2FF' },
                          { label:'Brillo solar',         value: f.brillo_solar_h   ? `${f.brillo_solar_h} h/año` : 'No registrado', icon: Sun,       color:'#8A6200', bg:'#FFF8E1' },
                          { label:'Tipo de suelo',        value: f.tipo_suelo       || 'No registrado',             icon: Layers,     color:'#1D7A4E', bg:'#EDFAF4' },
                        ].map((a,j) => (
                          <div key={j} className="rounded-2xl p-4"
                            style={{ background:'white', border:'1px solid #E8D4F8' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background:a.bg }}>
                                <a.icon size={14} color={a.color} />
                              </div>
                            </div>
                            <p className="font-bold text-stone-800 text-sm">{a.value}</p>
                            <p className="text-xs text-stone-400 mt-0.5">{a.label}</p>
                          </div>
                        ))}
                      </div>

                      <button onClick={() => {
                        setEditando(f);
                        setForm({ nombre:f.nombre, municipio:f.municipio, departamento:f.departamento||'Cundinamarca', altitud_msnm:f.altitud_msnm, area_hectareas:f.area_hectareas||'', num_arboles:f.num_arboles||'', historia:f.historia||'', proceso_principal:f.proceso_principal||'lavado', temporada_cosecha:f.temporada_cosecha||'', temp_promedio:f.temp_promedio||'', precipitacion_mm:f.precipitacion_mm||'', tipo_suelo:f.tipo_suelo||'' });
                      }}
                        className="w-full py-2.5 rounded-xl text-xs font-medium"
                        style={{ background:'#F3EEF5', color:'#6B3A8A' }}>
                        Actualizar datos ambientales
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}