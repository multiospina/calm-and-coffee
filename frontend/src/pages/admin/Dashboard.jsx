import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Coffee, Leaf,
  BarChart2, LogOut, TrendingUp, Star,
  ShoppingBag, Building2, CheckCircle,
  XCircle, Shield, RefreshCw,
  AlertCircle, ChevronRight, MapPin,
  Activity, Award, Search, Filter
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import api from '../../api/axios';

const TABS = [
  { id:'dashboard',    label:'Dashboard',    icon: LayoutDashboard },
  { id:'usuarios',     label:'Usuarios',     icon: Users           },
  { id:'cafeterias',   label:'Cafeterías',   icon: Building2       },
  { id:'cosechas',     label:'Cosechas',     icon: Leaf            },
  { id:'estadisticas', label:'Estadísticas', icon: BarChart2       },
];

const ROL_STYLE = {
  admin:      { bg:'#F1F0EE', text:'#4A5568', dark:'#2D3748' },
  gerente:    { bg:'#EBF2FF', text:'#1B4F8A', dark:'#0F3366' },
  caficultor: { bg:'#F3EEF5', text:'#6B3A8A', dark:'#3D1A5C' },
  barista:    { bg:'#FFF0EB', text:'#C0350F', dark:'#9A2A0C' },
  cliente:    { bg:'#EDFAF4', text:'#1D7A4E', dark:'#0F4A2E' },
  catador:    { bg:'#FFF8E1', text:'#8A6200', dark:'#5C4000' },
};

const ROL_COLORS = ['#2D3748','#1B4F8A','#6B3A8A','#C0350F','#1D7A4E','#8A6200'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl px-3 py-2 text-xs"
        style={{ background:'#1A202C', color:'white', border:'1px solid #2D3748' }}>
        <p className="font-medium mb-1">{label}</p>
        {payload.map((p,i) => (
          <p key={i} style={{ color:p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [vista, setVista]           = useState('dashboard');
  const [data, setData]             = useState(null);
  const [usuarios, setUsuarios]     = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [cosechas, setCosechas]     = useState([]);
  const [cafeterias, setCafeterias] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando]     = useState(true);
  const [asignando, setAsignando]   = useState(null);
  const [modalUsuario, setModalUsuario] = useState(null);
  const [nuevoRol, setNuevoRol]     = useState('');
  const [guardando, setGuardando]   = useState(false);
  const [toast, setToast]           = useState(null);
  const [busqueda, setBusqueda]     = useState('');
  const [filtroRol, setFiltroRol]   = useState('todos');

  useEffect(() => { cargarDatos(); }, []);

  useEffect(() => {
    let filtrados = usuarios;
    if (busqueda) {
      filtrados = filtrados.filter(u =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    if (filtroRol !== 'todos') {
      filtrados = filtrados.filter(u => u.roles?.includes(filtroRol));
    }
    setUsuariosFiltrados(filtrados);
  }, [busqueda, filtroRol, usuarios]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [dRes, uRes, cRes, eRes, cafRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/usuarios'),
        api.get('/admin/cosechas/sin-asignar'),
        api.get('/admin/estadisticas'),
        api.get('/cliente/cafeterias'),
      ]);
      setData(dRes.data);
      setUsuarios(uRes.data.usuarios);
      setUsuariosFiltrados(uRes.data.usuarios);
      setCosechas(cRes.data.cosechas);
      setEstadisticas(eRes.data);
      setCafeterias(cafRes.data.cafeterias || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const mostrarToast = (msg, tipo='ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const asignarCosecha = async (cosecha_id) => {
    if (cafeterias.length === 0) {
      mostrarToast('No hay cafeterías disponibles', 'error');
      return;
    }
    setAsignando(cosecha_id);
    try {
      await api.post(`/admin/cosechas/${cosecha_id}/asignar`, {
        cafeteria_id: cafeterias[0].id
      });
      mostrarToast('Cosecha asignada exitosamente');
      cargarDatos();
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error al asignar', 'error');
    } finally {
      setAsignando(null);
    }
  };

  const cambiarRol = async () => {
    if (!nuevoRol || !modalUsuario) return;
    setGuardando(true);
    try {
      await api.post(`/admin/usuarios/${modalUsuario.id}/roles`, { rol_nombre: nuevoRol });
      mostrarToast(`Rol '${nuevoRol}' asignado a ${modalUsuario.nombre}`);
      setModalUsuario(null);
      setNuevoRol('');
      cargarDatos();
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const desactivarUsuario = async (id, nombre) => {
    if (!window.confirm(`¿Desactivar a ${nombre}?`)) return;
    try {
      await api.put(`/admin/usuarios/${id}/desactivar`);
      mostrarToast(`${nombre} fue desactivado`);
      cargarDatos();
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error', 'error');
    }
  };

  // Datos para gráficas
  const datosRoles = data?.usuarios_por_rol?.map(r => ({
    name: r.rol.charAt(0).toUpperCase() + r.rol.slice(1),
    value: parseInt(r.total)
  })) || [];

  const datosCosechas = data?.cosechas?.map(c => ({
    name: c.estado.charAt(0).toUpperCase() + c.estado.slice(1),
    total: parseInt(c.total)
  })) || [];

  const Spinner = () => (
    <div className="flex justify-center items-center py-24">
      <div className="w-8 h-8 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background:'#F0F2F5' }}>

      {/* ── NAVBAR ─────────────────────────────────── */}
      <nav style={{ background:'#1A202C', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background:'rgba(255,255,255,0.08)' }}>
                <Coffee size={15} color="#94A3B8" />
              </div>
              <div>
                <span className="font-serif text-white text-sm font-semibold">
                  Calm and Coffee
                </span>
                <span className="text-xs ml-2" style={{ color:'#4A5568' }}>· Admin</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={cargarDatos}
                className="p-2 rounded-lg transition"
                style={{ color:'#4A5568' }}>
                <RefreshCw size={14} />
              </button>
              <span className="text-sm hidden sm:block" style={{ color:'#4A5568' }}>
                {usuario?.nombre?.split(' ')[0]}
              </span>
              <button onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
                style={{ background:'rgba(255,255,255,0.06)', color:'#94A3B8' }}>
                <LogOut size={12} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>

          <div className="flex gap-0 overflow-x-auto" style={{ scrollbarWidth:'none' }}>
            {TABS.map(t => (
              <button key={t.id}
                onClick={() => setVista(t.id)}
                className="flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap flex-shrink-0"
                style={{
                  color:        vista === t.id ? 'white'   : '#4A5568',
                  borderBottom: vista === t.id ? '2px solid #94A3B8' : '2px solid transparent',
                  background:   'transparent',
                }}>
                <t.icon size={13} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── TOAST ──────────────────────────────────── */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium animate-fade-in"
          style={{
            background: toast.tipo === 'ok' ? '#EDFAF4' : '#FEF2F2',
            border: `1px solid ${toast.tipo === 'ok' ? '#A8E8CC' : '#FECACA'}`,
            color: toast.tipo === 'ok' ? '#1D7A4E' : '#DC2626',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
          }}>
          {toast.tipo === 'ok' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* ── MODAL ROL ──────────────────────────────── */}
      {modalUsuario && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4"
          style={{ background:'rgba(0,0,0,0.6)' }}
          onClick={e => { if(e.target===e.currentTarget){ setModalUsuario(null); setNuevoRol(''); }}}>
          <div className="w-full max-w-sm rounded-3xl p-6 animate-slide-up"
            style={{ background:'white', boxShadow:'0 25px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold"
                style={{ background:'#F1F0EE', color:'#4A5568' }}>
                {modalUsuario.nombre.charAt(0)}
              </div>
              <div>
                <h3 className="font-serif font-bold text-stone-800">{modalUsuario.nombre}</h3>
                <p className="text-xs text-stone-400">{modalUsuario.email}</p>
              </div>
            </div>
            <p className="text-xs font-medium text-stone-400 mb-3 tracking-wider">ASIGNAR NUEVO ROL</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {['admin','gerente','caficultor','barista','cliente','catador'].map(r => {
                const s = ROL_STYLE[r] || ROL_STYLE.admin;
                const sel = nuevoRol === r;
                return (
                  <button key={r} onClick={() => setNuevoRol(r)}
                    className="py-3 px-3 rounded-2xl text-xs font-semibold capitalize transition-all"
                    style={{
                      background: sel ? s.dark : s.bg,
                      color:      sel ? 'white' : s.text,
                      transform:  sel ? 'scale(1.02)' : 'scale(1)',
                    }}>
                    {r}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setModalUsuario(null); setNuevoRol(''); }}
                className="flex-1 py-3 rounded-2xl text-sm text-stone-400"
                style={{ background:'#F8F9FA', border:'1px solid #E2E8F0' }}>
                Cancelar
              </button>
              <button onClick={cambiarRol}
                disabled={!nuevoRol || guardando}
                className="flex-1 py-3 rounded-2xl text-sm text-white font-medium"
                style={{ background: nuevoRol ? '#1A202C' : '#CBD5E0' }}>
                {guardando ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENIDO ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7">
        {cargando ? <Spinner /> : (
          <>

            {/* ═══════════ DASHBOARD ═══════════════════ */}
            {vista === 'dashboard' && data && (
              <div className="space-y-6">

                {/* Hero */}
                <div className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
                  style={{ background:'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)' }}>
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5"
                    style={{ background:'white', transform:'translate(30%, -30%)' }} />
                  <p className="text-xs font-medium mb-1 tracking-widest" style={{ color:'#4A5568' }}>
                    PANEL DE ADMINISTRACIÓN
                  </p>
                  <h1 className="font-serif text-white text-2xl sm:text-3xl font-bold mb-1">
                    Calm and Coffee
                  </h1>
                  <p style={{ color:'#4A5568', fontSize:'13px' }}>
                    Plataforma activa · {data.usuarios?.usuarios_activos || 0} usuarios · {cafeterias.length} cafeterías
                  </p>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon:Users,       label:'Usuarios activos',  value: data.usuarios?.usuarios_activos   || 0,  color:'#2D3748', bg:'#F1F0EE', sub:`de ${data.usuarios?.total_usuarios||0} totales` },
                    { icon:Building2,   label:'Cafeterías',        value: cafeterias.length || 0,                  color:'#1B4F8A', bg:'#EBF2FF', sub:'activas en la plataforma' },
                    { icon:ShoppingBag, label:'Total pedidos',     value: data.pedidos?.total_pedidos       || 0,  color:'#1D7A4E', bg:'#EDFAF4', sub:'registrados' },
                    { icon:Star,        label:'Satisfacción',      value: data.pedidos?.satisfaccion_global || '—', color:'#8A6200', bg:'#FFF8E1', sub:'promedio general ★' },
                  ].map((m,i) => (
                    <div key={i} className="rounded-2xl p-5"
                      style={{ background:'white', border:'1px solid #E2E8F0', boxShadow:'0 1px 8px rgba(0,0,0,0.04)' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                        style={{ background:m.bg }}>
                        <m.icon size={16} color={m.color} />
                      </div>
                      <p className="font-serif text-3xl font-bold mb-0.5" style={{ color:m.color }}>
                        {m.value}
                      </p>
                      <p className="text-xs font-medium text-stone-600">{m.label}</p>
                      <p className="text-xs mt-0.5" style={{ color:'#CBD5E0' }}>{m.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Gráficas */}
                <div className="grid md:grid-cols-2 gap-5">

                  {/* Distribución por rol — PieChart */}
                  <div className="rounded-2xl p-5"
                    style={{ background:'white', border:'1px solid #E2E8F0' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <Users size={15} color="#4A5568" />
                      <h2 className="font-serif font-bold text-stone-800">Distribución por rol</h2>
                    </div>
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width="50%" height={160}>
                        <PieChart>
                          <Pie data={datosRoles} cx="50%" cy="50%"
                            innerRadius={45} outerRadius={70}
                            paddingAngle={3} dataKey="value">
                            {datosRoles.map((_, i) => (
                              <Cell key={i} fill={ROL_COLORS[i % ROL_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-2">
                        {datosRoles.map((r,i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ background:ROL_COLORS[i % ROL_COLORS.length] }} />
                              <span className="text-xs text-stone-500 capitalize">{r.name}</span>
                            </div>
                            <span className="text-xs font-bold text-stone-700">{r.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Estado cosechas — BarChart */}
                  <div className="rounded-2xl p-5"
                    style={{ background:'white', border:'1px solid #E2E8F0' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <Leaf size={15} color="#1D7A4E" />
                      <h2 className="font-serif font-bold text-stone-800">Estado cosechas</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={datosCosechas} barSize={40}>
                        <XAxis dataKey="name" tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="total" radius={[8,8,0,0]}>
                          {datosCosechas.map((entry, i) => (
                            <Cell key={i}
                              fill={entry.name==='Cerrada'?'#1D7A4E':entry.name==='Activa'?'#D4A847':'#1B4F8A'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Resumen financiero */}
                <div className="rounded-2xl p-5"
                  style={{ background:'white', border:'1px solid #E2E8F0' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Activity size={15} color="#1B4F8A" />
                    <h2 className="font-serif font-bold text-stone-800">Resumen financiero</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label:'Ingresos totales', value:`$${parseInt(data.pedidos?.ingresos_totales||0).toLocaleString('es-CO')}`, color:'#1D7A4E', bg:'#EDFAF4' },
                      { label:'Clientes únicos',  value: data.pedidos?.clientes_unicos || '—',                                    color:'#1B4F8A', bg:'#EBF2FF' },
                      { label:'Satisfacción',     value: data.pedidos?.satisfaccion_global ? `${data.pedidos.satisfaccion_global}/5` : '—', color:'#8A6200', bg:'#FFF8E1' },
                    ].map((r,i) => (
                      <div key={i} className="rounded-xl p-4 text-center"
                        style={{ background:r.bg }}>
                        <p className="font-serif text-2xl font-bold" style={{ color:r.color }}>{r.value}</p>
                        <p className="text-xs text-stone-500 mt-1">{r.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════ USUARIOS ════════════════════ */}
            {vista === 'usuarios' && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="font-serif text-2xl font-bold text-stone-800">Usuarios</h1>
                    <p className="text-stone-400 text-sm mt-0.5">
                      {usuariosFiltrados.length} de {usuarios.length} usuarios
                    </p>
                  </div>
                </div>

                {/* Buscador y filtros */}
                <div className="flex gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-2xl min-w-48"
                    style={{ background:'white', border:'1px solid #E2E8F0' }}>
                    <Search size={14} color="#94A3B8" />
                    <input
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                      placeholder="Buscar por nombre o email..."
                      className="flex-1 text-sm outline-none bg-transparent text-stone-700 placeholder-stone-300"
                    />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                    style={{ background:'white', border:'1px solid #E2E8F0' }}>
                    <Filter size={13} color="#94A3B8" />
                    <select
                      value={filtroRol}
                      onChange={e => setFiltroRol(e.target.value)}
                      className="text-sm outline-none bg-transparent text-stone-600">
                      <option value="todos">Todos los roles</option>
                      {['admin','gerente','caficultor','barista','cliente','catador'].map(r => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lista */}
                <div className="space-y-2">
                  {usuariosFiltrados.length === 0 ? (
                    <div className="rounded-2xl p-10 text-center"
                      style={{ background:'white', border:'1px solid #E2E8F0' }}>
                      <Search size={28} color="#E2E8F0" className="mx-auto mb-2" />
                      <p className="text-stone-400 text-sm">No se encontraron usuarios</p>
                    </div>
                  ) : usuariosFiltrados.map((u,i) => (
                    <div key={i}
                      className="rounded-2xl p-4 flex items-center gap-4 transition"
                      style={{ background:'white', border:'1px solid #E2E8F0' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-serif font-bold"
                        style={{ background:'#F1F0EE', color:'#2D3748' }}>
                        {u.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-stone-800 text-sm">{u.nombre}</p>
                          {!u.activo && (
                            <span className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background:'#FEF2F2', color:'#DC2626' }}>
                              Inactivo
                            </span>
                          )}
                        </div>
                        <p className="text-stone-400 text-xs truncate">{u.email}</p>
                        {u.municipio && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin size={10} color="#CBD5E0" />
                            <span className="text-xs" style={{ color:'#CBD5E0' }}>{u.municipio}</span>
                          </div>
                        )}
                      </div>
                      <div className="hidden sm:flex gap-1.5 flex-wrap justify-end max-w-xs">
                        {u.roles?.filter(r=>r).map((r,j) => {
                          const s = ROL_STYLE[r] || ROL_STYLE.admin;
                          return (
                            <span key={j} className="text-xs px-2.5 py-1 rounded-full capitalize font-medium"
                              style={{ background:s.bg, color:s.text }}>
                              {r}
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => { setModalUsuario(u); setNuevoRol(''); }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition"
                          style={{ background:'#F8F9FA', color:'#4A5568', border:'1px solid #E2E8F0' }}>
                          <Shield size={11} />
                          <span className="hidden sm:inline">Rol</span>
                        </button>
                        {u.activo && u.id !== usuario?.id && (
                          <button onClick={() => desactivarUsuario(u.id, u.nombre)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                            style={{ background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA' }}>
                            <XCircle size={11} />
                            <span className="hidden sm:inline">Desactivar</span>
                          </button>
                        )}
                        <ChevronRight size={14} color="#E2E8F0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════ CAFETERÍAS ══════════════════ */}
            {vista === 'cafeterias' && (
              <div className="space-y-5">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-800">Cafeterías</h1>
                  <p className="text-stone-400 text-sm mt-0.5">
                    {cafeterias.length} registradas en la plataforma
                  </p>
                </div>
                {cafeterias.length === 0 ? (
                  <div className="rounded-2xl p-12 text-center"
                    style={{ background:'white', border:'1px solid #E2E8F0' }}>
                    <Building2 size={36} color="#E2E8F0" className="mx-auto mb-3" />
                    <p className="font-serif text-stone-500 font-semibold">Sin cafeterías</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {cafeterias.map((c,i) => (
                      <div key={i} className="rounded-2xl p-5"
                        style={{ background:'white', border:'1px solid #E2E8F0' }}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background:'#EBF2FF' }}>
                            <Building2 size={18} color="#1B4F8A" />
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{ background:c.activa?'#EDFAF4':'#FEF2F2', color:c.activa?'#1D7A4E':'#DC2626' }}>
                            {c.activa ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-stone-800 mb-1">{c.nombre}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          <MapPin size={11} color="#94A3B8" />
                          <span className="text-xs text-stone-400">{c.municipio}</span>
                        </div>
                        {c.descripcion && (
                          <p className="text-xs text-stone-400 leading-relaxed mb-3 line-clamp-2">
                            {c.descripcion}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-3"
                          style={{ borderTop:'1px solid #F8F9FA' }}>
                          <span className="text-xs px-2.5 py-1 rounded-full"
                            style={{ background:'#EBF2FF', color:'#1B4F8A' }}>
                            {c.cosechas_activas || 0} cafés activos
                          </span>
                          {c.rating && (
                            <span className="text-xs font-medium" style={{ color:'#D4A847' }}>
                              ★ {c.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════ COSECHAS ════════════════════ */}
            {vista === 'cosechas' && (
              <div className="space-y-5">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-800">
                    Cosechas sin asignar
                  </h1>
                  <p className="text-stone-400 text-sm mt-0.5">
                    {cosechas.length} esperando cafetería
                  </p>
                </div>
                {cosechas.length === 0 ? (
                  <div className="rounded-2xl p-12 text-center"
                    style={{ background:'white', border:'1px solid #E2E8F0' }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background:'#EDFAF4' }}>
                      <CheckCircle size={28} color="#1D7A4E" />
                    </div>
                    <p className="font-serif text-stone-700 font-bold text-lg mb-1">Todo asignado</p>
                    <p className="text-stone-400 text-sm">Todas las cosechas están asignadas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cosechas.map((c,i) => (
                      <div key={i} className="rounded-2xl p-5"
                        style={{ background:'white', border:'1px solid #E2E8F0' }}>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background:'#F3EEF5' }}>
                            <Leaf size={16} color="#6B3A8A" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-stone-800">{c.variedad}</h3>
                            <p className="text-stone-400 text-xs mt-0.5 capitalize">
                              {c.proceso} · {c.nombre_finca} · {c.municipio}
                            </p>
                            <p className="text-stone-400 text-xs">Caficultor: {c.nombre_caficultor}</p>
                            {c.qr_codigo && (
                              <p className="font-mono text-xs mt-1" style={{ color:'#94A3B8' }}>
                                {c.qr_codigo}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => asignarCosecha(c.id)}
                            disabled={asignando === c.id}
                            className="px-4 py-2.5 rounded-xl text-xs font-medium text-white flex-shrink-0"
                            style={{ background: asignando === c.id ? '#CBD5E0' : '#1A202C' }}>
                            {asignando === c.id ? 'Asignando...' : 'Asignar →'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════ ESTADÍSTICAS ════════════════ */}
            {vista === 'estadisticas' && estadisticas && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-800">Estadísticas</h1>
                  <p className="text-stone-400 text-sm mt-0.5">Rendimiento global de la plataforma</p>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {/* Top cafés */}
                  <div className="rounded-2xl p-5"
                    style={{ background:'white', border:'1px solid #E2E8F0' }}>
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background:'#EDFAF4' }}>
                        <TrendingUp size={15} color="#1D7A4E" />
                      </div>
                      <h2 className="font-serif font-bold text-stone-800">Top cafés pedidos</h2>
                    </div>
                    {estadisticas.top_cafes?.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={120}>
                          <BarChart data={estadisticas.top_cafes.slice(0,5).map(c=>({
                            name: c.nombre.split(' ')[0],
                            pedidos: parseInt(c.pedidos)||0
                          }))} barSize={30}>
                            <XAxis dataKey="name" tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="pedidos" fill="#1D7A4E" radius={[6,6,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 mt-3">
                          {estadisticas.top_cafes.map((c,i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: i===0?'#FFF8E1':'#F8F9FA', color: i===0?'#8A6200':'#4A5568' }}>
                                {i+1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-stone-700 text-xs font-medium truncate">{c.nombre}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                {c.rating && <p className="text-xs font-medium" style={{ color:'#D4A847' }}>★ {c.rating}</p>}
                                <p className="text-xs text-stone-400">{c.pedidos} pedidos</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="py-8 text-center">
                        <Coffee size={24} color="#E2E8F0" className="mx-auto mb-2" />
                        <p className="text-stone-400 text-sm">Sin datos aún</p>
                      </div>
                    )}
                  </div>

                  {/* Top fincas */}
                  <div className="rounded-2xl p-5"
                    style={{ background:'white', border:'1px solid #E2E8F0' }}>
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background:'#F3EEF5' }}>
                        <Award size={15} color="#6B3A8A" />
                      </div>
                      <h2 className="font-serif font-bold text-stone-800">Top fincas</h2>
                    </div>
                    {estadisticas.top_fincas?.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={120}>
                          <BarChart data={estadisticas.top_fincas.slice(0,5).map(f=>({
                            name: f.nombre.split(' ')[0],
                            cosechas: parseInt(f.cosechas)||0
                          }))} barSize={30}>
                            <XAxis dataKey="name" tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="cosechas" fill="#6B3A8A" radius={[6,6,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 mt-3">
                          {estadisticas.top_fincas.map((f,i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: i===0?'#F3EEF5':'#F8F9FA', color: i===0?'#6B3A8A':'#4A5568' }}>
                                {i+1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-stone-700 text-xs font-medium truncate">{f.nombre}</p>
                                <p className="text-stone-400 text-xs truncate">{f.caficultor} · {f.municipio}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                {f.rating_promedio && <p className="text-xs font-medium" style={{ color:'#D4A847' }}>★ {f.rating_promedio}</p>}
                                <p className="text-xs text-stone-400">{f.cosechas} cosechas</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="py-8 text-center">
                        <Leaf size={24} color="#E2E8F0" className="mx-auto mb-2" />
                        <p className="text-stone-400 text-sm">Sin datos aún</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
}