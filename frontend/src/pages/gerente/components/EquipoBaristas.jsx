import { useState, useEffect } from 'react';
import {
  Users, Star, Coffee, Clock,
  MapPin, Check, Search, UserPlus,
  ChevronDown, ChevronUp, Award,
  X, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import api from '../../../api/axios';

const NIVEL_SATISFACCION = (s) => {
  if (!s) return { label:'Sin datos', color:'#94A3B8', bg:'#F8F9FA' };
  if (s >= 4.5) return { label:'Excelente', color:'#1D7A4E', bg:'#EDFAF4' };
  if (s >= 4.0) return { label:'Muy bueno', color:'#1B4F8A', bg:'#EBF2FF' };
  if (s >= 3.5) return { label:'Bueno',     color:'#D4A847', bg:'#FFF8E1' };
  return              { label:'Regular',    color:'#C0350F', bg:'#FFF0EB' };
};

export default function EquipoBaristas() {
  const [equipo,    setEquipo]    = useState([]);
  const [todos,     setTodos]     = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [busqueda,  setBusqueda]  = useState('');
  const [verTodos,  setVerTodos]  = useState(false);
  const [creando,   setCreando]   = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [showPass,  setShowPass]  = useState(false);
  const [toast,     setToast]     = useState(null);
  const [form, setForm] = useState({
    nombre:'', email:'', password:'', municipio:'', telefono:''
  });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const [eRes, bRes] = await Promise.all([
        api.get('/gerente/equipo'),
        api.get('/gerente/baristas'),
      ]);
      setEquipo(eRes.data.equipo || []);
      setTodos(bRes.data.baristas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const mostrarToast = (msg, tipo='ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const crearBarista = async () => {
    if (!form.nombre || !form.email || !form.password) return;
    setGuardando(true);
    try {
      await api.post('/gerente/baristas', form);
      mostrarToast(`Barista "${form.nombre}" creado exitosamente`);
      setCreando(false);
      setForm({ nombre:'', email:'', password:'', municipio:'', telefono:'' });
      cargar();
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error al crear barista', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const equipoConTurnos = equipo.filter(b => parseInt(b.turnos_cafeteria) > 0);
  const disponibles     = todos.filter(b => !equipoConTurnos.some(e => e.id === b.id));

  const filtrados = (verTodos ? todos : equipoConTurnos).filter(b =>
    b.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    b.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (cargando) return (
    <div className="flex justify-center py-10">
      <div className="w-7 h-7 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

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

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'En mi equipo',     value: equipoConTurnos.length, color:'#1B4F8A', bg:'#EBF2FF', borde:'#C2D6F8', icon: Users    },
          { label:'Disponibles',      value: disponibles.length,     color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC', icon: UserPlus },
          { label:'En plataforma',    value: todos.length,           color:'#6B3A8A', bg:'#F3EEF5', borde:'#D4B8E8', icon: Award    },
        ].map((s,i) => (
          <div key={i} className="rounded-2xl p-3 text-center"
            style={{ background:'white', border:`1.5px solid ${s.borde}` }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-1.5"
              style={{ background:s.bg }}>
              <s.icon size={14} color={s.color} />
            </div>
            <p className="font-serif font-bold text-xl" style={{ color:s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5 leading-tight" style={{ color:s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-2xl"
          style={{ background:'white', border:'1px solid #E2E8F0' }}>
          <Search size={14} color="#94A3B8" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar barista..."
            className="flex-1 text-sm outline-none bg-transparent text-stone-700 placeholder-stone-300"
          />
        </div>
        <button
          onClick={() => setVerTodos(!verTodos)}
          className="px-3 py-2.5 rounded-2xl text-xs font-medium transition flex items-center gap-1"
          style={{
            background: verTodos ? '#1B4F8A' : '#F0F6FF',
            color:      verTodos ? 'white'   : '#1B4F8A',
          }}>
          {verTodos ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
          {verTodos ? 'Mi equipo' : 'Ver todos'}
        </button>
        <button
          onClick={() => setCreando(!creando)}
          className="px-3 py-2.5 rounded-2xl text-xs font-medium transition flex items-center gap-1"
          style={{
            background: creando ? '#FEF2F2' : '#1D7A4E',
            color:      creando ? '#DC2626' : 'white',
          }}>
          {creando ? <X size={12}/> : <UserPlus size={12}/>}
          {creando ? 'Cancelar' : 'Crear'}
        </button>
      </div>

      {/* Formulario crear barista */}
      {creando && (
        <div className="rounded-2xl p-5 space-y-3"
          style={{ background:'#F0FFF8', border:'1.5px solid #A8E8CC' }}>
          <p className="text-xs font-bold tracking-wider" style={{ color:'#1D7A4E' }}>
            NUEVO BARISTA
          </p>

          <div className="space-y-2">
            <input
              placeholder="Nombre completo *"
              value={form.nombre}
              onChange={e => setForm(f=>({...f,nombre:e.target.value}))}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background:'white', border:'1px solid #A8E8CC' }}
            />
            <input
              placeholder="Correo electrónico *"
              type="email"
              value={form.email}
              onChange={e => setForm(f=>({...f,email:e.target.value}))}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background:'white', border:'1px solid #A8E8CC' }}
            />
            <div className="relative">
              <input
                placeholder="Contraseña temporal *"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f=>({...f,password:e.target.value}))}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none pr-12"
                style={{ background:'white', border:'1px solid #A8E8CC' }}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color:'#94A3B8' }}>
                {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Municipio"
                value={form.municipio}
                onChange={e => setForm(f=>({...f,municipio:e.target.value}))}
                className="px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background:'white', border:'1px solid #A8E8CC' }}
              />
              <input
                placeholder="Teléfono"
                value={form.telefono}
                onChange={e => setForm(f=>({...f,telefono:e.target.value}))}
                className="px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background:'white', border:'1px solid #A8E8CC' }}
              />
            </div>
          </div>

          {/* Info contraseña temporal */}
          <div className="rounded-xl p-3 flex items-start gap-2"
            style={{ background:'#FFF8E1', border:'1px solid #FFE082' }}>
            <AlertCircle size={13} color="#D4A847" className="flex-shrink-0 mt-0.5" />
            <p className="text-xs" style={{ color:'#8A6200' }}>
              El barista usará este email y contraseña para iniciar sesión. Compártelos de forma segura.
            </p>
          </div>

          <button
            onClick={crearBarista}
            disabled={guardando || !form.nombre || !form.email || !form.password}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white transition"
            style={{
              background: guardando || !form.nombre || !form.email || !form.password
                ? '#CBD5E0' : '#1D7A4E'
            }}>
            {guardando ? 'Creando barista...' : 'Crear barista'}
          </button>
        </div>
      )}

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="rounded-2xl py-12 text-center"
          style={{ background:'white', border:'1px solid #E2E8F0' }}>
          <Users size={28} color="#E2E8F0" className="mx-auto mb-3" />
          <p className="text-stone-400 font-semibold text-sm mb-1">
            {verTodos ? 'Sin baristas en la plataforma' : 'Sin baristas en tu equipo aún'}
          </p>
          <p className="text-stone-300 text-xs mb-4">
            {verTodos ? 'Crea el primer barista con el botón de arriba' : 'Asigna baristas a turnos para que aparezcan aquí'}
          </p>
          {!verTodos && (
            <button onClick={() => setVerTodos(true)}
              className="text-xs px-4 py-2 rounded-xl font-medium"
              style={{ background:'#EBF2FF', color:'#1B4F8A' }}>
              Ver baristas disponibles
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-bold text-stone-400 tracking-wider">
            {verTodos ? `TODOS — ${todos.length} baristas` : `MI EQUIPO — ${equipoConTurnos.length} baristas`}
          </p>

          {filtrados.map((b,i) => {
            const enEquipo    = equipoConTurnos.some(e => e.id === b.id);
            const datosEquipo = equipo.find(e => e.id === b.id);
            const nivel       = NIVEL_SATISFACCION(parseFloat(datosEquipo?.satisfaccion));

            return (
              <div key={i} className="rounded-2xl overflow-hidden"
                style={{
                  background:'white',
                  border:`1.5px solid ${enEquipo ? '#C2D6F8' : '#E2E8F0'}`,
                }}>
                <div className="p-4">
                  <div className="flex items-start gap-3">

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-serif font-bold text-lg"
                      style={{
                        background: enEquipo ? '#EBF2FF' : '#F8F9FA',
                        color:      enEquipo ? '#1B4F8A' : '#94A3B8'
                      }}>
                      {b.nombre.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-serif font-bold text-stone-800">{b.nombre}</p>
                          <p className="text-stone-400 text-xs truncate">{b.email}</p>
                          {b.municipio && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin size={10} color="#CBD5E0" />
                              <span className="text-xs text-stone-300">{b.municipio}</span>
                            </div>
                          )}
                        </div>
                        {enEquipo ? (
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 flex-shrink-0"
                            style={{ background:'#EBF2FF', color:'#1B4F8A' }}>
                            <Check size={11} />
                            En equipo
                          </span>
                        ) : (
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                            style={{ background:'#EDFAF4', color:'#1D7A4E' }}>
                            Disponible
                          </span>
                        )}
                      </div>

                      {/* Stats si tiene datos */}
                      {datosEquipo && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="rounded-xl p-2 text-center"
                            style={{ background:'#F0F6FF' }}>
                            <Clock size={11} color="#1B4F8A" className="mx-auto mb-0.5" />
                            <p className="font-bold text-sm" style={{ color:'#1B4F8A' }}>
                              {datosEquipo.turnos_cafeteria || 0}
                            </p>
                            <p className="text-xs text-stone-400">Turnos</p>
                          </div>
                          <div className="rounded-xl p-2 text-center"
                            style={{ background:'#FFF0EB' }}>
                            <Coffee size={11} color="#C0350F" className="mx-auto mb-0.5" />
                            <p className="font-bold text-sm" style={{ color:'#C0350F' }}>
                              {datosEquipo.pedidos_preparados || 0}
                            </p>
                            <p className="text-xs text-stone-400">Pedidos</p>
                          </div>
                          <div className="rounded-xl p-2 text-center"
                            style={{ background:nivel.bg }}>
                            <Star size={11} color={nivel.color} className="mx-auto mb-0.5" />
                            <p className="font-bold text-sm" style={{ color:nivel.color }}>
                              {datosEquipo.satisfaccion || '—'}
                            </p>
                            <p className="text-xs" style={{ color:nivel.color }}>{nivel.label}</p>
                          </div>
                        </div>
                      )}

                      {!datosEquipo && (
                        <div className="flex items-center gap-2 mt-2">
                          <Clock size={11} color="#94A3B8" />
                          <span className="text-xs text-stone-400">
                            {b.turnos_asignados || 0} turno{b.turnos_asignados !== '1' ? 's' : ''} en total
                          </span>
                        </div>
                      )}
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