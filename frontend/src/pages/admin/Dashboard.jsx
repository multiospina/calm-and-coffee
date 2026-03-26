import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function AdminDashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [data,     setData]     = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [cosechas, setCosechas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [vista,    setVista]    = useState('dashboard');
  const [asignando, setAsignando] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [dRes, uRes, cRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/usuarios'),
        api.get('/admin/cosechas/sin-asignar'),
      ]);
      setData(dRes.data);
      setUsuarios(uRes.data.usuarios);
      setCosechas(cRes.data.cosechas);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const asignarCosecha = async (cosecha_id) => {
    const cafeteria_id = '00000001-0005-0005-0005-000000000001';
    setAsignando(cosecha_id);
    try {
      await api.post(`/admin/cosechas/${cosecha_id}/asignar`, { cafeteria_id });
      alert('✅ Cosecha asignada exitosamente');
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al asignar');
    } finally {
      setAsignando(null);
    }
  };

  const ROL_COLOR = {
    admin:      { bg:'#F1EFE8', text:'#4A4A4A' },
    gerente:    { bg:'#EBF2FF', text:'#1B4F8A' },
    caficultor: { bg:'#F3EEF5', text:'#6B3A8A' },
    barista:    { bg:'#FFF0EB', text:'#C0350F' },
    cliente:    { bg:'#EDFAF4', text:'#1D7A4E' },
    catador:    { bg:'#FFF8E1', text:'#8A6200' },
  };

  return (
    <div className="min-h-screen" style={{ background:'#F8F9FA' }}>

      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between"
        style={{ background:'#2D3748' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background:'rgba(255,255,255,0.15)' }}>
            <span className="text-white font-serif font-bold text-sm">C</span>
          </div>
          <div>
            <span className="text-white font-serif font-semibold">Calm and Coffee</span>
            <span className="text-gray-400 text-xs ml-2">· Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-300 text-sm">{usuario?.nombre?.split(' ')[0]}</span>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="text-gray-400 hover:text-white text-xs transition">
            Salir
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="px-6 py-3 flex gap-3"
        style={{ background:'white', borderBottom:'1px solid #E2E8F0' }}>
        {[
          { id:'dashboard', label:'Dashboard'  },
          { id:'usuarios',  label:'Usuarios'   },
          { id:'cosechas',  label:'Cosechas'   },
        ].map(t => (
          <button key={t.id}
            onClick={() => setVista(t.id)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition"
            style={{
              background: vista === t.id ? '#2D3748' : 'transparent',
              color:      vista === t.id ? 'white'   : '#6B7280',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-5 py-7">

        {cargando ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── DASHBOARD ── */}
            {vista === 'dashboard' && data && (
              <>
                <div className="mb-6">
                  <h1 className="font-serif text-2xl font-bold text-stone-800">
                    Panel de administración
                  </h1>
                  <p className="text-stone-500 text-sm mt-1">
                    Vista global de la plataforma Calm and Coffee
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label:'Usuarios activos', value: data.usuarios?.usuarios_activos   || 0, color:'#2D3748' },
                    { label:'Cafeterías',        value: data.cafeterias?.activas          || 0, color:'#1B4F8A' },
                    { label:'Total pedidos',     value: data.pedidos?.total_pedidos       || 0, color:'#1D7A4E' },
                    { label:'Satisfacción',      value: data.pedidos?.satisfaccion_global ? `${data.pedidos.satisfaccion_global}★` : '—', color:'#D4A847' },
                  ].map((m,i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm"
                      style={{ border:'1px solid #E2E8F0' }}>
                      <div className="text-2xl font-bold font-serif mb-1" style={{ color:m.color }}>
                        {m.value}
                      </div>
                      <div className="text-stone-500 text-xs">{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Usuarios por rol */}
                <div className="bg-white rounded-2xl p-5 shadow-sm mb-5"
                  style={{ border:'1px solid #E2E8F0' }}>
                  <h2 className="font-serif font-bold text-stone-800 mb-4">
                    Usuarios por rol
                  </h2>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {data.usuarios_por_rol?.map((r,i) => {
                      const c = ROL_COLOR[r.rol] || ROL_COLOR.admin;
                      return (
                        <div key={i} className="text-center p-3 rounded-xl"
                          style={{ background:c.bg }}>
                          <div className="font-bold text-xl font-serif mb-0.5"
                            style={{ color:c.text }}>
                            {r.total}
                          </div>
                          <div className="text-xs capitalize" style={{ color:c.text }}>
                            {r.rol}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cosechas por estado */}
                <div className="bg-white rounded-2xl p-5 shadow-sm"
                  style={{ border:'1px solid #E2E8F0' }}>
                  <h2 className="font-serif font-bold text-stone-800 mb-4">
                    Estado de cosechas
                  </h2>
                  <div className="flex gap-3 flex-wrap">
                    {data.cosechas?.map((c,i) => (
                      <div key={i} className="px-4 py-3 rounded-xl"
                        style={{ background:'#F8F9FA', border:'1px solid #E2E8F0' }}>
                        <span className="text-stone-700 text-sm font-medium capitalize">
                          {c.estado}
                        </span>
                        <span className="ml-2 text-stone-500 text-sm">
                          {c.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── USUARIOS ── */}
            {vista === 'usuarios' && (
              <>
                <div className="mb-5">
                  <h1 className="font-serif text-2xl font-bold text-stone-800">
                    Gestión de usuarios
                  </h1>
                  <p className="text-stone-500 text-sm mt-1">
                    {usuarios.length} usuarios registrados
                  </p>
                </div>
                <div className="space-y-3">
                  {usuarios.map((u,i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
                      style={{ border:'1px solid #E2E8F0' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background:'#F8F9FA' }}>
                          <span className="text-stone-600 font-bold">
                            {u.nombre.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-stone-800 font-medium text-sm">{u.nombre}</p>
                          <p className="text-stone-400 text-xs">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {u.roles?.filter(r => r).map((r,j) => {
                          const c = ROL_COLOR[r] || ROL_COLOR.admin;
                          return (
                            <span key={j} className="text-xs px-2 py-1 rounded-full capitalize"
                              style={{ background:c.bg, color:c.text }}>
                              {r}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── COSECHAS SIN ASIGNAR ── */}
            {vista === 'cosechas' && (
              <>
                <div className="mb-5">
                  <h1 className="font-serif text-2xl font-bold text-stone-800">
                    Cosechas sin asignar
                  </h1>
                  <p className="text-stone-500 text-sm mt-1">
                    {cosechas.length} cosechas esperando cafetería
                  </p>
                </div>

                {cosechas.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center shadow-sm"
                    style={{ border:'1px solid #E2E8F0' }}>
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-stone-500">Todas las cosechas están asignadas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cosechas.map((c,i) => (
                      <div key={i} className="bg-white rounded-2xl p-5 shadow-sm"
                        style={{ border:'1px solid #E2E8F0' }}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-stone-800">{c.variedad}</h3>
                            <p className="text-stone-400 text-xs mt-0.5 capitalize">
                              {c.proceso} · {c.nombre_finca} · {c.municipio}
                            </p>
                            <p className="text-stone-400 text-xs">
                              Caficultor: {c.nombre_caficultor}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full font-mono"
                            style={{ background:'#F8F9FA', color:'#6B7280' }}>
                            {c.qr_codigo}
                          </span>
                        </div>
                        <button
                          onClick={() => asignarCosecha(c.id)}
                          disabled={asignando === c.id}
                          className="w-full py-2.5 rounded-xl text-white text-xs font-medium transition"
                          style={{ background: asignando === c.id ? '#9CA3AF' : '#2D3748' }}>
                          {asignando === c.id ? 'Asignando...' : '→ Asignar a El Origen Silvania'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}