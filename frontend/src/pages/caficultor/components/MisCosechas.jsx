import { useState, useEffect } from 'react';
import {
  Package, Plus, X, Check, AlertCircle,
  QrCode, ChevronDown, ChevronUp,
  Clock, CheckCircle, Camera, Thermometer,
  Droplets, Scale, FileText, Calendar,
  Leaf, Wind, Sun, Filter
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../../api/axios';

const ESTADO_INFO = {
  activa:  { label:'Activa',  color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC' },
  cerrada: { label:'Cerrada', color:'#6B3A8A', bg:'#F3EEF5', borde:'#D4B8E8' },
};

const PROCESO_INFO = {
  lavado:    { color:'#1B4F8A', bg:'#EBF2FF' },
  honey:     { color:'#8A6200', bg:'#FFF8E1' },
  natural:   { color:'#1D7A4E', bg:'#EDFAF4' },
  anaerobico:{ color:'#6B3A8A', bg:'#F3EEF5' },
};

const ETAPAS_INFO = {
  cultivo:     { label:'Cultivo',      color:'#1D7A4E', bg:'#EDFAF4', icon: Leaf       },
  floracion:   { label:'Floración',    color:'#8A6200', bg:'#FFF8E1', icon: Sun        },
  maduracion:  { label:'Maduración',   color:'#C0350F', bg:'#FFF0EB', icon: Filter     },
  recoleccion: { label:'Recolección',  color:'#6B3A8A', bg:'#F3EEF5', icon: Package    },
  beneficio:   { label:'Beneficio',    color:'#1B4F8A', bg:'#EBF2FF', icon: Droplets   },
  secado:      { label:'Secado',       color:'#D4A847', bg:'#FFF8E1', icon: Wind       },
  tostion:     { label:'Tostión',      color:'#92400e', bg:'#FEF3C7', icon: Thermometer},
  despacho:    { label:'Despacho',     color:'#2D3748', bg:'#F8F9FA', icon: Scale      },
};

const DATOS_EXTRA_CAMPOS = {
  recoleccion: [
    { key:'kg_dia',      label:'Kg recolectados hoy', type:'number', icon: Scale      },
    { key:'temperatura', label:'Temperatura (°C)',     type:'number', icon: Thermometer},
    { key:'trabajadores',label:'Trabajadores',         type:'number', icon: Package    },
  ],
  beneficio: [
    { key:'horas_ferm',  label:'Horas fermentación',  type:'number', icon: Clock      },
    { key:'ph_agua',     label:'pH del agua',          type:'number', icon: Droplets   },
    { key:'temperatura', label:'Temperatura (°C)',     type:'number', icon: Thermometer},
  ],
  secado: [
    { key:'dias_secado', label:'Días de secado',       type:'number', icon: Sun        },
    { key:'humedad',     label:'Humedad del grano (%)',type:'number', icon: Droplets   },
    { key:'metodo',      label:'Método',               type:'text',   icon: Wind       },
  ],
  tostion: [
    { key:'temperatura', label:'Temperatura (°C)',     type:'number', icon: Thermometer},
    { key:'minutos',     label:'Minutos',              type:'number', icon: Clock      },
    { key:'perfil',      label:'Perfil de tostión',    type:'text',   icon: FileText   },
  ],
};

export default function MisCosechas() {
  const [cosechas,  setCosechas]  = useState([]);
  const [fincas,    setFincas]    = useState([]);
  const [etapas,    setEtapas]    = useState({});
  const [cargando,  setCargando]  = useState(true);
  const [creando,   setCreando]   = useState(false);
  const [cerrando,  setCerrando]  = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [expandida, setExpandida] = useState(null);
  const [verQR,     setVerQR]     = useState(null);
  const [addEtapa,  setAddEtapa]  = useState(null);
  const [toast,     setToast]     = useState(null);
  const [kgProd,    setKgProd]    = useState('');
  const [formEtapa, setFormEtapa] = useState({
    tipo_etapa:'recoleccion', fecha:'', descripcion:'',
    fotos_urls:[], datos_extra:{}
  });
  const [fotoUrl, setFotoUrl] = useState('');
  const [form, setForm] = useState({
    finca_id:'', variedad:'', proceso:'lavado',
    fecha_inicio:'', kg_estimados:'', notas:'', lote_nombre:''
  });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const [cRes, fRes] = await Promise.all([
        api.get('/caficultor/cosechas'),
        api.get('/caficultor/fincas'),
      ]);
      setCosechas(cRes.data.cosechas || []);
      setFincas(fRes.data.fincas    || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const cargarEtapas = async (cosechaId) => {
    try {
      const res = await api.get(`/caficultor/cosechas/${cosechaId}/etapas`);
      setEtapas(prev => ({ ...prev, [cosechaId]: res.data.etapas || [] }));
    } catch (err) {
      console.error(err);
    }
  };

  const mostrarToast = (msg, tipo='ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const crearCosecha = async () => {
    if (!form.finca_id || !form.variedad || !form.proceso || !form.fecha_inicio) return;
    setGuardando(true);
    try {
      await api.post('/caficultor/cosechas', {
        ...form,
        kg_estimados: parseFloat(form.kg_estimados) || null,
      });
      mostrarToast('Cosecha creada exitosamente');
      setCreando(false);
      setForm({ finca_id:'', variedad:'', proceso:'lavado', fecha_inicio:'', kg_estimados:'', notas:'', lote_nombre:'' });
      cargar();
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const cerrarCosecha = async (id) => {
    setGuardando(true);
    try {
      const res = await api.post(`/caficultor/cosechas/${id}/cerrar`, {
        kg_producidos: parseFloat(kgProd) || null
      });
      mostrarToast(`QR generado: ${res.data.qr_codigo}`);
      setCerrando(null);
      setKgProd('');
      cargar();
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const agregarFoto = () => {
    if (!fotoUrl.trim()) return;
    setFormEtapa(f => ({ ...f, fotos_urls: [...f.fotos_urls, fotoUrl.trim()] }));
    setFotoUrl('');
  };

  const quitarFoto = (idx) => {
    setFormEtapa(f => ({ ...f, fotos_urls: f.fotos_urls.filter((_,i) => i !== idx) }));
  };

  const crearEtapa = async (cosechaId) => {
    if (!formEtapa.tipo_etapa || !formEtapa.fecha || !formEtapa.descripcion) return;
    setGuardando(true);
    try {
      await api.post(`/caficultor/cosechas/${cosechaId}/etapas`, {
        ...formEtapa,
        fotos_urls:  formEtapa.fotos_urls.length > 0 ? formEtapa.fotos_urls : null,
        datos_extra: Object.keys(formEtapa.datos_extra).length > 0 ? formEtapa.datos_extra : null,
      });
      mostrarToast('Entrada registrada en la bitácora');
      setAddEtapa(null);
      setFormEtapa({ tipo_etapa:'recoleccion', fecha:'', descripcion:'', fotos_urls:[], datos_extra:{} });
      cargarEtapas(cosechaId);
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
      if (!etapas[id]) cargarEtapas(id);
    }
  };

  if (cargando) return (
    <div className="flex justify-center py-12">
      <div className="w-7 h-7 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );

  const activas  = cosechas.filter(c => c.estado === 'activa');
  const cerradas = cosechas.filter(c => c.estado !== 'activa');

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

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Activas',  value: activas.length,  color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC' },
          { label:'Cerradas', value: cerradas.length, color:'#6B3A8A', bg:'#F3EEF5', borde:'#D4B8E8' },
          { label:'Total',    value: cosechas.length, color:'#1B4F8A', bg:'#EBF2FF', borde:'#C2D6F8' },
        ].map((s,i) => (
          <div key={i} className="rounded-2xl p-3 text-center"
            style={{ background:'white', border:`1.5px solid ${s.borde}` }}>
            <p className="font-serif font-bold text-2xl" style={{ color:s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color:s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Botón crear */}
      <button onClick={() => setCreando(!creando)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition"
        style={{
          background: creando ? '#FEF2F2' : '#3D1A5C',
          color:      creando ? '#DC2626' : 'white',
        }}>
        {creando ? <X size={16}/> : <Plus size={16}/>}
        {creando ? 'Cancelar' : 'Iniciar nueva cosecha'}
      </button>

      {/* Formulario crear */}
      {creando && (
        <div className="rounded-2xl p-5 space-y-3"
          style={{ background:'#FAF5FF', border:'1.5px solid #D4B8E8' }}>
          <p className="text-xs font-bold tracking-wider" style={{ color:'#6B3A8A' }}>
            NUEVA COSECHA
          </p>
          <select value={form.finca_id}
            onChange={e => setForm(f=>({...f,finca_id:e.target.value}))}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background:'white', border:'1px solid #D4B8E8' }}>
            <option value="">Selecciona una finca *</option>
            {fincas.map(f => (
              <option key={f.id} value={f.id}>{f.nombre} — {f.municipio}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Variedad *"
              value={form.variedad}
              onChange={e => setForm(f=>({...f,variedad:e.target.value}))}
              className="px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background:'white', border:'1px solid #D4B8E8' }} />
            <input placeholder="Nombre del lote"
              value={form.lote_nombre}
              onChange={e => setForm(f=>({...f,lote_nombre:e.target.value}))}
              className="px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background:'white', border:'1px solid #D4B8E8' }} />
          </div>

          <div>
            <p className="text-xs text-stone-400 mb-1.5">Proceso *</p>
            <div className="grid grid-cols-4 gap-2">
              {['lavado','honey','natural','anaerobico'].map(p => {
                const info = PROCESO_INFO[p];
                return (
                  <button key={p} onClick={() => setForm(f=>({...f,proceso:p}))}
                    className="py-2 rounded-xl text-xs font-medium capitalize"
                    style={{
                      background: form.proceso===p ? info.color : '#F8F9FA',
                      color:      form.proceso===p ? 'white'    : '#4A5568',
                    }}>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-stone-400 mb-1">Fecha inicio *</p>
              <input type="date" value={form.fecha_inicio}
                onChange={e => setForm(f=>({...f,fecha_inicio:e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background:'white', border:'1px solid #D4B8E8' }} />
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-1">Kg estimados</p>
              <input type="number" placeholder="Kg"
                value={form.kg_estimados}
                onChange={e => setForm(f=>({...f,kg_estimados:e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background:'white', border:'1px solid #D4B8E8' }} />
            </div>
          </div>

          <textarea placeholder="Notas iniciales..."
            value={form.notas}
            onChange={e => setForm(f=>({...f,notas:e.target.value}))}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{ background:'white', border:'1px solid #D4B8E8' }} />

          <button onClick={crearCosecha}
            disabled={guardando || !form.finca_id || !form.variedad || !form.fecha_inicio}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white"
            style={{ background: guardando ? '#CBD5E0' : '#3D1A5C' }}>
            {guardando ? 'Creando...' : 'Iniciar cosecha'}
          </button>
        </div>
      )}

      {/* Lista cosechas */}
      {cosechas.length === 0 ? (
        <div className="rounded-2xl py-14 text-center"
          style={{ background:'white', border:'1px solid #E2E8F0' }}>
          <Package size={32} color="#E2E8F0" className="mx-auto mb-3" />
          <p className="font-serif text-stone-400 font-semibold mb-1">Sin cosechas registradas</p>
          <p className="text-stone-300 text-sm">Inicia tu primera cosecha</p>
        </div>
      ) : (
        <div className="space-y-4">

          {/* Activas primero */}
          {activas.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-xs font-bold text-stone-400 tracking-wider">
                  EN CURSO — {activas.length} cosecha{activas.length>1?'s':''}
                </p>
              </div>
              {activas.map((c,i) => (
                <TarjetaCosecha key={i} c={c}
                  expandida={expandida} etapas={etapas}
                  addEtapa={addEtapa} cerrando={cerrando}
                  verQR={verQR} kgProd={kgProd}
                  guardando={guardando} formEtapa={formEtapa}
                  fotoUrl={fotoUrl}
                  onToggle={toggleExpandir}
                  onAddEtapa={setAddEtapa}
                  onCerrar={setCerrando}
                  onVerQR={setVerQR}
                  onKgProd={setKgProd}
                  onFormEtapa={setFormEtapa}
                  onFotoUrl={setFotoUrl}
                  onAgregarFoto={agregarFoto}
                  onQuitarFoto={quitarFoto}
                  onCrearEtapa={crearEtapa}
                  onCerrarCosecha={cerrarCosecha}
                />
              ))}
            </div>
          )}

          {/* Cerradas */}
          {cerradas.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-stone-400 tracking-wider">
                CERRADAS — {cerradas.length} cosecha{cerradas.length>1?'s':''}
              </p>
              {cerradas.map((c,i) => (
                <TarjetaCosecha key={i} c={c}
                  expandida={expandida} etapas={etapas}
                  addEtapa={addEtapa} cerrando={cerrando}
                  verQR={verQR} kgProd={kgProd}
                  guardando={guardando} formEtapa={formEtapa}
                  fotoUrl={fotoUrl}
                  onToggle={toggleExpandir}
                  onAddEtapa={setAddEtapa}
                  onCerrar={setCerrando}
                  onVerQR={setVerQR}
                  onKgProd={setKgProd}
                  onFormEtapa={setFormEtapa}
                  onFotoUrl={setFotoUrl}
                  onAgregarFoto={agregarFoto}
                  onQuitarFoto={quitarFoto}
                  onCrearEtapa={crearEtapa}
                  onCerrarCosecha={cerrarCosecha}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TarjetaCosecha({
  c, expandida, etapas, addEtapa, cerrando,
  verQR, kgProd, guardando, formEtapa, fotoUrl,
  onToggle, onAddEtapa, onCerrar, onVerQR,
  onKgProd, onFormEtapa, onFotoUrl,
  onAgregarFoto, onQuitarFoto, onCrearEtapa, onCerrarCosecha
}) {
  const est     = ESTADO_INFO[c.estado] || ESTADO_INFO.activa;
  const proceso = PROCESO_INFO[c.proceso] || PROCESO_INFO.lavado;
  const exp     = expandida === c.id;
  const misEtapas = etapas[c.id] || [];

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{
        background:'white',
        border:`2px solid ${c.estado==='activa' ? '#A8E8CC' : '#D4B8E8'}`,
        boxShadow: c.estado==='activa' ? '0 4px 20px rgba(29,122,78,0.1)' : '0 2px 12px rgba(0,0,0,0.04)'
      }}>

      {/* Barra de estado */}
      <div className="h-1.5"
        style={{ background: c.estado==='activa'
          ? 'linear-gradient(90deg, #1D7A4E, #34D399)'
          : 'linear-gradient(90deg, #6B3A8A, #9B5ABE)' }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {c.estado === 'activa' && (
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
              <h3 className="font-serif font-bold text-stone-800 text-lg">{c.variedad}</h3>
            </div>
            <p className="text-xs text-stone-400">{c.nombre_finca}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                style={{ background:proceso.bg, color:proceso.color }}>
                {c.proceso}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background:est.bg, color:est.color }}>
                {est.label}
              </span>
              {c.lote_nombre && (
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background:'#F8F9FA', color:'#4A5568' }}>
                  {c.lote_nombre}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => onToggle(c.id)}
            className="p-2.5 rounded-2xl flex-shrink-0"
            style={{ background:'#F3EEF5', color:'#6B3A8A' }}>
            {exp ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label:'Etapas',    value: c.total_etapas     || 0,    icon: Filter   },
            { label:'Cafeterías',value: c.total_cafeterias || 0,    icon: Package  },
            { label:'Kg est.',   value: c.kg_estimados     ? `${c.kg_estimados}` : '—', icon: Scale },
            { label:'Kg reales', value: c.kg_producidos    ? `${c.kg_producidos}` : '—', icon: CheckCircle },
          ].map((s,j) => (
            <div key={j} className="rounded-xl p-2 text-center"
              style={{ background:'#FAF5FF' }}>
              <s.icon size={12} color="#6B3A8A" className="mx-auto mb-0.5" />
              <p className="font-bold text-sm" style={{ color:'#6B3A8A' }}>{s.value}</p>
              <p className="text-xs text-stone-400" style={{ fontSize:'9px' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Botones acción */}
        <div className="flex gap-2 flex-wrap">
          {c.estado === 'activa' && (
            <>
              <button onClick={() => {
                onAddEtapa(addEtapa===c.id ? null : c.id);
                if (!etapas[c.id]) {
                  // cargar etapas al abrir
                }
              }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium flex-1"
                style={{ background:'#3D1A5C', color:'white' }}>
                <Plus size={13} />
                Añadir entrada
              </button>
              <button onClick={() => onCerrar(c.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                style={{ background:'#F3EEF5', color:'#6B3A8A', border:'1px solid #D4B8E8' }}>
                <CheckCircle size={13} />
                Cerrar
              </button>
            </>
          )}
          {c.qr_codigo && (
            <button onClick={() => onVerQR(verQR===c.id ? null : c.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
              style={{ background:'#EBF2FF', color:'#1B4F8A' }}>
              <QrCode size={13} />
              QR
            </button>
          )}
        </div>

        {/* Formulario nueva etapa */}
        {addEtapa === c.id && (
          <div className="mt-4 rounded-2xl p-4 space-y-3"
            style={{ background:'#FAF5FF', border:'1.5px solid #D4B8E8' }}>
            <p className="text-xs font-bold tracking-wider" style={{ color:'#6B3A8A' }}>
              NUEVA ENTRADA EN BITÁCORA
            </p>

            {/* Tipo de etapa */}
            <div className="grid grid-cols-4 gap-1.5">
              {Object.entries(ETAPAS_INFO).map(([key, info]) => (
                <button key={key}
                  onClick={() => onFormEtapa(f=>({...f,tipo_etapa:key,datos_extra:{}}))}
                  className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition"
                  style={{
                    background: formEtapa.tipo_etapa===key ? info.color : '#F8F9FA',
                    color:      formEtapa.tipo_etapa===key ? 'white'    : '#4A5568',
                  }}>
                  <info.icon size={14} />
                  <span style={{ fontSize:'9px', fontWeight:600 }}>{info.label}</span>
                </button>
              ))}
            </div>

            {/* Fecha y descripción */}
            <div>
              <p className="text-xs text-stone-400 mb-1">Fecha *</p>
              <input type="date"
                value={formEtapa.fecha}
                onChange={e => onFormEtapa(f=>({...f,fecha:e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background:'white', border:'1px solid #D4B8E8' }} />
            </div>

            <textarea
              placeholder="Describe qué hiciste hoy en la cosecha... *"
              value={formEtapa.descripcion}
              onChange={e => onFormEtapa(f=>({...f,descripcion:e.target.value}))}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background:'white', border:'1px solid #D4B8E8' }} />

            {/* Datos extra según etapa */}
            {DATOS_EXTRA_CAMPOS[formEtapa.tipo_etapa] && (
              <div className="space-y-2">
                <p className="text-xs font-bold" style={{ color:'#6B3A8A' }}>
                  DATOS TÉCNICOS
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {DATOS_EXTRA_CAMPOS[formEtapa.tipo_etapa].map(campo => (
                    <div key={campo.key}>
                      <p className="text-xs text-stone-400 mb-1">{campo.label}</p>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background:'white', border:'1px solid #D4B8E8' }}>
                        <campo.icon size={12} color="#6B3A8A" />
                        <input
                          type={campo.type}
                          placeholder="—"
                          value={formEtapa.datos_extra[campo.key] || ''}
                          onChange={e => onFormEtapa(f=>({
                            ...f,
                            datos_extra:{...f.datos_extra,[campo.key]:e.target.value}
                          }))}
                          className="flex-1 text-sm outline-none bg-transparent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fotos */}
            <div className="space-y-2">
              <p className="text-xs font-bold" style={{ color:'#6B3A8A' }}>
                FOTOS (URLs)
              </p>
              <div className="flex gap-2">
                <input
                  placeholder="https://... URL de la foto"
                  value={fotoUrl}
                  onChange={e => onFotoUrl(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background:'white', border:'1px solid #D4B8E8' }} />
                <button onClick={onAgregarFoto}
                  className="px-3 py-2 rounded-xl text-xs font-medium"
                  style={{ background:'#3D1A5C', color:'white' }}>
                  <Camera size={14} />
                </button>
              </div>

              {/* Preview fotos */}
              {formEtapa.fotos_urls.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {formEtapa.fotos_urls.map((url,idx) => (
                    <div key={idx} className="relative">
                      <img src={url} alt="foto"
                        className="w-16 h-16 rounded-xl object-cover"
                        onError={e => e.target.src='https://via.placeholder.com/64x64?text=Foto'} />
                      <button onClick={() => onQuitarFoto(idx)}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background:'#DC2626', color:'white' }}>
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => onAddEtapa(null)}
                className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background:'#F8F9FA', color:'#4A5568' }}>
                Cancelar
              </button>
              <button
                onClick={() => onCrearEtapa(c.id)}
                disabled={guardando || !formEtapa.fecha || !formEtapa.descripcion}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: guardando ? '#CBD5E0' : '#3D1A5C' }}>
                {guardando ? 'Guardando...' : 'Guardar entrada'}
              </button>
            </div>
          </div>
        )}

        {/* Cerrar cosecha */}
        {cerrando === c.id && (
          <div className="mt-4 rounded-2xl p-4 space-y-3"
            style={{ background:'#FAF5FF', border:'1.5px solid #D4B8E8' }}>
            <p className="text-xs font-bold" style={{ color:'#6B3A8A' }}>
              CERRAR COSECHA Y GENERAR QR DE TRAZABILIDAD
            </p>
            <input type="number" placeholder="Kg producidos totales (opcional)"
              value={kgProd}
              onChange={e => onKgProd(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background:'white', border:'1px solid #D4B8E8' }} />
            <div className="rounded-xl p-3"
              style={{ background:'#FFF8E1', border:'1px solid #FFE082' }}>
              <p className="text-xs" style={{ color:'#8A6200' }}>
                Al cerrar se generará un QR único de trazabilidad que conecta tu cosecha con el consumidor final. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onCerrar(null)}
                className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background:'#F8F9FA', color:'#4A5568' }}>
                Cancelar
              </button>
              <button onClick={() => onCerrarCosecha(c.id)} disabled={guardando}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: guardando ? '#CBD5E0' : '#3D1A5C' }}>
                {guardando ? 'Generando...' : 'Generar QR'}
              </button>
            </div>
          </div>
        )}

        {/* QR */}
        {verQR === c.id && c.qr_codigo && (
          <div className="mt-4 flex flex-col items-center gap-3 p-4 rounded-2xl"
            style={{ background:'#FAF5FF', border:'1px solid #D4B8E8' }}>
            <p className="text-xs font-bold" style={{ color:'#6B3A8A' }}>
              QR DE TRAZABILIDAD
            </p>
            <div className="p-4 rounded-2xl bg-white">
              <QRCodeSVG
                value={`${window.location.origin}/trazabilidad/${c.qr_codigo}`}
                size={180}
                bgColor="white"
                fgColor="#3D1A5C"
                level="M"
              />
            </div>
            <p className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl"
              style={{ background:'#F3EEF5', color:'#6B3A8A' }}>
              {c.qr_codigo}
            </p>
            <p className="text-xs text-stone-400 text-center">
              Escanea este QR para ver la trazabilidad completa de esta cosecha
            </p>
          </div>
        )}
      </div>

      {/* Bitácora expandida */}
      {exp && (
        <div className="px-5 pb-5"
          style={{ borderTop:'2px solid #F3EEF5' }}>
          <p className="text-xs font-bold tracking-wider pt-4 mb-3"
            style={{ color:'#6B3A8A' }}>
            BITÁCORA — {misEtapas.length} entrada{misEtapas.length!==1?'s':''}
          </p>

          {misEtapas.length === 0 ? (
            <div className="text-center py-8 rounded-2xl"
              style={{ background:'#FAF5FF' }}>
              <FileText size={24} color="#D4B8E8" className="mx-auto mb-2" />
              <p className="text-stone-400 text-sm">Sin entradas aún</p>
              <p className="text-stone-300 text-xs mt-1">
                Añade la primera entrada a esta cosecha
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Línea vertical del timeline */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5"
                style={{ background:'#E8D4F8' }} />

              <div className="space-y-4">
                {misEtapas.map((e,i) => {
                  const info = ETAPAS_INFO[e.tipo_etapa] || ETAPAS_INFO.cultivo;
                  const fechaStr = new Date(e.fecha).toLocaleDateString('es-CO', {
                    day:'numeric', month:'long', year:'numeric'
                  });
                  const datosExtra = e.datos_extra || {};

                  return (
                    <div key={i} className="flex gap-4 relative pl-12">
                      {/* Icono en el timeline */}
                      <div className="absolute left-0 w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background:info.color, boxShadow:`0 4px 12px ${info.color}40` }}>
                        <info.icon size={16} color="white" />
                      </div>

                      <div className="flex-1 rounded-2xl p-4"
                        style={{ background:'#FAF5FF', border:'1px solid #E8D4F8' }}>

                        {/* Header etapa */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                              style={{ background:info.bg, color:info.color }}>
                              {info.label}
                            </span>
                            <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                              <Calendar size={10} />
                              {fechaStr}
                            </p>
                          </div>
                          {e.registrado_por_nombre && (
                            <p className="text-xs text-stone-300">
                              {e.registrado_por_nombre.split(' ')[0]}
                            </p>
                          )}
                        </div>

                        {/* Descripción */}
                        <p className="text-sm text-stone-700 leading-relaxed mb-3">
                          {e.descripcion}
                        </p>

                        {/* Datos técnicos */}
                        {Object.keys(datosExtra).length > 0 && (
                          <div className="grid grid-cols-2 gap-1.5 mb-3">
                            {Object.entries(datosExtra).map(([key,val]) => {
                              const campos = DATOS_EXTRA_CAMPOS[e.tipo_etapa] || [];
                              const campo  = campos.find(c=>c.key===key);
                              return val ? (
                                <div key={key} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                                  style={{ background:'white', border:'1px solid #E8D4F8' }}>
                                  {campo?.icon && <campo.icon size={11} color="#6B3A8A" />}
                                  <span className="text-xs text-stone-600 font-medium">{val}</span>
                                  <span className="text-xs text-stone-400">{campo?.label?.split('(')[0]?.trim()}</span>
                                </div>
                              ) : null;
                            })}
                          </div>
                        )}

                        {/* Fotos */}
                        {e.fotos_urls?.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {e.fotos_urls.map((url,j) => (
                              <img key={j} src={url} alt="foto etapa"
                                className="w-20 h-20 rounded-xl object-cover"
                                style={{ border:'2px solid #E8D4F8' }}
                                onError={ev => ev.target.src='https://via.placeholder.com/80x80?text=Foto'} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}