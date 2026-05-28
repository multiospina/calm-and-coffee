import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Coffee, Leaf, Award, Users, BarChart2, Star, Thermometer } from 'lucide-react';

const RUTAS_POR_ROL = {
  cliente:    '/cliente',
  caficultor: '/caficultor',
  barista:    '/barista',
  gerente:    '/gerente',
  admin:      '/admin',
  catador:    '/catador',
};

const ROLES_DEMO = [
  { rol:'Caficultor', email:'caficultor@cea.com', icon: Leaf,      color:'#6B3A8A', bg:'#FAF5FF' },
  { rol:'Cliente',    email:'cliente@cea.com',    icon: Coffee,    color:'#1D7A4E', bg:'#F0FFF8' },
  { rol:'Barista',    email:'barista@cea.com',    icon: Award,     color:'#C0350F', bg:'#FFF7F5' },
  { rol:'Gerente',    email:'gerente@cea.com',    icon: BarChart2, color:'#1B4F8A', bg:'#F0F6FF' },
  { rol:'Catador',    email:'catador@cea.com',    icon: Star,      color:'#8A6200', bg:'#FFFBF0' },
  { rol:'Admin',      email:'admin@cea.com',      icon: Users,     color:'#4A5568', bg:'#F8F9FA' },
];

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [cargando, setCargando] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const usuario = await login(email, password);
      const rol     = usuario.roles?.[0];
      const redirect = localStorage.getItem('redirect_after_login');
      if (redirect) {
        localStorage.removeItem('redirect_after_login');
        navigate(redirect, { replace: true });
      } else {
        navigate(RUTAS_POR_ROL[rol] || '/cliente', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background:'#FAF6F0' }}>

      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative overflow-hidden"
        style={{ background:'linear-gradient(160deg, #5C3D2E 0%, #92400e 60%, #C47A45 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage:'radial-gradient(circle at 10% 80%, #fff 0%, transparent 40%), radial-gradient(circle at 90% 10%, #fff 0%, transparent 30%)' }} />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ background:'#FAF6F0' }} />
        <div className="absolute top-20 -right-10 w-40 h-40 rounded-full opacity-10"
          style={{ background:'#FAF6F0' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20">
            <img src="/logo.png" alt="Calm and Coffee"
              className="w-12 h-12 object-contain" />
            <span className="font-serif text-white text-xl tracking-tight font-semibold">
              Calm and Coffee
            </span>
          </div>
          <div>
            <h1 className="font-serif text-white leading-tight mb-6"
              style={{ fontSize:'3rem', fontWeight:300 }}>
              Cada taza<br />
              <em className="font-semibold" style={{ color:'#FFE082' }}>
                tiene una historia.
              </em>
            </h1>
            <p className="text-amber-100 text-base leading-relaxed italic opacity-80"
              style={{ maxWidth:'320px' }}>
              &ldquo;Detrás de cada taza, hay una historia
              que merece ser contada.&rdquo;
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          {[
            { icon: Leaf,   text:'Trazabilidad desde la semilla hasta tu taza' },
            { icon: Coffee, text:'Asistente de cata con protocolo SCA'          },
            { icon: Award,  text:'Pasaporte cafetero y gamificación'            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:'rgba(255,255,255,0.15)' }}>
                <item.icon size={14} color="#FAF6F0" />
              </div>
              <span className="text-amber-100 text-sm opacity-80">{item.text}</span>
            </div>
          ))}

          {/* Botón temperatura en panel izquierdo */}
          <div className="pt-4 mt-2"
            style={{ borderTop:'1px solid rgba(255,255,255,0.15)' }}>
            <button onClick={() => navigate('/temperatura')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all hover:scale-105"
              style={{
                background:'rgba(255,255,255,0.12)',
                border:'1px solid rgba(255,255,255,0.25)',
              }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:'rgba(239,68,68,0.3)' }}>
                <Thermometer size={16} color="#FCA5A5" />
              </div>
              <div className="text-left flex-1">
                <p className="text-white text-xs font-bold">Ver temperatura en vivo</p>
                <p className="text-amber-200 text-xs opacity-70">Sensor ESP32 · Taza V60</p>
              </div>
              <div className="w-2 h-2 rounded-full animate-pulse"
                style={{ background:'#22C55E' }} />
            </button>
            <p className="text-amber-200 text-xs opacity-60 mt-3">
              Universidad de Cundinamarca · Ingeniería Electrónica · 2026
            </p>
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-6">
            <img src="/logo.png" alt="Calm and Coffee"
              className="w-16 h-16 object-contain mx-auto mb-3" />
            <h1 className="font-serif text-stone-800 text-2xl font-semibold">
              Calm and Coffee
            </h1>
          </div>

          {/* ── BOTÓN TEMPERATURA MÓVIL ── */}
          <button onClick={() => navigate('/temperatura')}
            className="lg:hidden w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-4 transition-all active:scale-95"
            style={{
              background:'linear-gradient(135deg, #0F4A2E, #1D7A4E)',
              boxShadow:'0 4px 20px rgba(29,122,78,0.4)',
            }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:'rgba(255,255,255,0.15)' }}>
              <Thermometer size={20} color="white" />
            </div>
            <div className="text-left flex-1">
              <p className="text-white text-sm font-bold">Ver temperatura en tiempo real</p>
              <p className="text-green-200 text-xs opacity-80">
                Sensor ESP32 · Taza V60 · Café Sumapaz
              </p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full animate-pulse"
                style={{ background:'#22C55E' }} />
              <span className="text-green-300 text-xs font-bold">EN VIVO</span>
            </div>
          </button>

          {/* Card formulario */}
          <div className="rounded-3xl p-8"
            style={{ background:'white', border:'1px solid #E8D9B8',
              boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>

            <div className="mb-7">
              <h2 className="font-serif text-stone-800 text-2xl font-semibold mb-1">
                Bienvenido de nuevo
              </h2>
              <p className="text-stone-400 text-sm">
                Ingresa para continuar tu experiencia cafetera
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-stone-500">
                  Correo electrónico
                </label>
                <input type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com" required
                  className="w-full px-4 py-3 rounded-2xl text-sm text-stone-800 placeholder-stone-300 outline-none"
                  style={{ background:'#FAF6F0', border:'1.5px solid #E8D9B8' }}
                  onFocus={e => e.target.style.borderColor='#92400e'}
                  onBlur={e  => e.target.style.borderColor='#E8D9B8'}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-stone-500">
                  Contraseña
                </label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    className="w-full px-4 py-3 rounded-2xl text-sm text-stone-800 placeholder-stone-300 outline-none pr-16"
                    style={{ background:'#FAF6F0', border:'1.5px solid #E8D9B8' }}
                    onFocus={e => e.target.style.borderColor='#92400e'}
                    onBlur={e  => e.target.style.borderColor='#E8D9B8'}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                    {showPass ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-2xl text-sm flex items-center gap-2"
                  style={{ background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626' }}>
                  <span>⚠</span> {error}
                </div>
              )}

              <button type="submit" disabled={cargando}
                className="w-full py-3.5 rounded-2xl text-white text-sm font-medium mt-2"
                style={{ background: cargando
                  ? '#D4B896'
                  : 'linear-gradient(135deg, #92400e 0%, #C47A45 100%)' }}>
                {cargando ? 'Ingresando...' : 'Ingresar a mi cuenta →'}
              </button>

              <button type="button" onClick={() => navigate('/register')}
                className="w-full py-3 rounded-2xl text-sm font-medium text-stone-600"
                style={{ background:'#FAF6F0', border:'1.5px solid #E8D9B8' }}>
                ¿No tienes cuenta? Regístrate
              </button>
            </form>

            {/* Accesos rápidos demo */}
            <div className="mt-6 pt-5" style={{ borderTop:'1px solid #F5EFE0' }}>
              <p className="text-xs text-center mb-3 text-stone-300 font-medium tracking-wider">
                ACCESOS RÁPIDOS · DEMO
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ROLES_DEMO.map(u => (
                  <button key={u.rol}
                    onClick={() => { setEmail(u.email); setPassword('password'); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-left"
                    style={{ background:u.bg, border:`1.5px solid ${u.color}22` }}>
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background:`${u.color}18` }}>
                      <u.icon size={13} color={u.color} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold" style={{ color:u.color }}>
                        {u.rol}
                      </div>
                      <div className="text-stone-400 truncate" style={{ fontSize:'10px' }}>
                        {u.email}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Botón temperatura en card — visible en desktop también */}
              <button onClick={() => navigate('/temperatura')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl mt-3 transition-all active:scale-95"
                style={{
                  background:'linear-gradient(135deg, #0c2d1a, #1D7A4E)',
                  border:'1px solid rgba(29,122,78,0.3)',
                }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:'rgba(255,255,255,0.15)' }}>
                  <Thermometer size={14} color="white" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-white text-xs font-bold">Temperatura en vivo</p>
                  <p className="text-green-300 text-xs opacity-70">ESP32 · Sin login requerido</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background:'#22C55E' }} />
                  <span className="text-green-400 text-xs font-bold">LIVE</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
