import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Leaf, Award, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    nombre: '', email: '', password: '', confirmar: '', municipio: '', telefono: ''
  });
  const [showPass,  setShowPass]  = useState(false);
  const [error,     setError]     = useState('');
  const [cargando,  setCargando]  = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validar = () => {
    if (!form.nombre.trim())    return 'El nombre es obligatorio';
    if (!form.email.trim())     return 'El correo es obligatorio';
    if (form.password.length < 6) return 'La contraseña debe tener mínimo 6 caracteres';
    if (form.password !== form.confirmar) return 'Las contraseñas no coinciden';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validar();
    if (err) { setError(err); return; }

    setCargando(true);
    setError('');
    try {
      await api.post('/auth/registro', {
        nombre:    form.nombre.trim(),
        email:     form.email.trim(),
        password:  form.password,
        municipio: form.municipio.trim() || null,
        telefono:  form.telefono.trim()  || null,
      });

      // Login automático después del registro
      await login(form.email.trim(), form.password);

      // Ir al cuestionario
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background:'#FAF6F0' }}>

      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background:'linear-gradient(160deg, #5C3D2E 0%, #92400e 55%, #C47A45 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage:'radial-gradient(circle at 20% 80%, #fff 0%, transparent 40%)' }} />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-10"
          style={{ background:'#FAF6F0' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background:'rgba(255,255,255,0.15)' }}>
              <Coffee size={18} color="#FAF6F0" />
            </div>
            <span className="font-serif text-white text-lg font-semibold">
              Calm and Coffee
            </span>
          </div>

          <h2 className="font-serif text-white text-3xl font-light leading-tight mb-5">
            Únete a la<br />
            <em className="font-semibold" style={{ color:'#FFE082' }}>
              experiencia cafetera
            </em>
          </h2>
          <p className="text-amber-100 text-sm leading-relaxed opacity-80 mb-8">
            Crea tu cuenta y empieza a descubrir la historia detrás de cada café que consumes.
          </p>

          <div className="space-y-3">
            {[
              { icon: Leaf,   text:'Tu Pasaporte Cafetero te espera'       },
              { icon: Award,  text:'Gana puntos catando cafés de especialidad' },
              { icon: Coffee, text:'Conoce al caficultor detrás de tu taza' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:'rgba(255,255,255,0.15)' }}>
                  <item.icon size={14} color="#FAF6F0" />
                </div>
                <span className="text-amber-100 text-sm opacity-80">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-4"
          style={{ borderTop:'1px solid rgba(255,255,255,0.15)' }}>
          <p className="text-amber-200 text-xs opacity-60">
            Universidad de Cundinamarca · Ingeniería Electrónica · 2026
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-6 animate-slide-up">

          <button onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-600 text-sm mb-6 transition">
            <ArrowLeft size={15} />
            Volver al login
          </button>

          <div className="rounded-3xl p-8 shadow-card"
            style={{ background:'white', border:'1px solid #E8D9B8' }}>

            <div className="mb-6">
              <h2 className="font-serif text-stone-800 text-2xl font-semibold mb-1">
                Crear cuenta
              </h2>
              <p className="text-stone-400 text-sm">
                Completa los datos para empezar tu experiencia
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Nombre */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-stone-500">
                  Nombre completo *
                </label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  required
                  className="w-full px-4 py-3 rounded-2xl text-sm text-stone-800 placeholder-stone-300 outline-none"
                  style={{ background:'#FAF6F0', border:'1.5px solid #E8D9B8' }}
                  onFocus={e => e.target.style.borderColor='#92400e'}
                  onBlur={e => e.target.style.borderColor='#E8D9B8'}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-stone-500">
                  Correo electrónico *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@correo.com"
                  required
                  className="w-full px-4 py-3 rounded-2xl text-sm text-stone-800 placeholder-stone-300 outline-none"
                  style={{ background:'#FAF6F0', border:'1.5px solid #E8D9B8' }}
                  onFocus={e => e.target.style.borderColor='#92400e'}
                  onBlur={e => e.target.style.borderColor='#E8D9B8'}
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-stone-500">
                  Contraseña * (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 rounded-2xl text-sm text-stone-800 placeholder-stone-300 outline-none pr-12"
                    style={{ background:'#FAF6F0', border:'1.5px solid #E8D9B8' }}
                    onFocus={e => e.target.style.borderColor='#92400e'}
                    onBlur={e => e.target.style.borderColor='#E8D9B8'}
                  />
                  <button type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Indicador de fuerza */}
                {form.password && (
                  <div className="flex gap-1.5 mt-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all"
                        style={{
                          background: form.password.length >= i*3
                            ? i <= 1 ? '#DC2626' : i <= 2 ? '#F59E0B' : i <= 3 ? '#1D7A4E' : '#1D7A4E'
                            : '#E8D9B8'
                        }} />
                    ))}
                    <span className="text-xs text-stone-400 ml-1">
                      {form.password.length < 4 ? 'Débil' : form.password.length < 7 ? 'Regular' : form.password.length < 10 ? 'Buena' : 'Fuerte'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirmar */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-stone-500">
                  Confirmar contraseña *
                </label>
                <input
                  name="confirmar"
                  type="password"
                  value={form.confirmar}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-2xl text-sm text-stone-800 placeholder-stone-300 outline-none"
                  style={{
                    background:'#FAF6F0',
                    border: `1.5px solid ${form.confirmar && form.password !== form.confirmar ? '#FCA5A5' : '#E8D9B8'}`
                  }}
                  onFocus={e => e.target.style.borderColor='#92400e'}
                  onBlur={e => e.target.style.borderColor = form.confirmar && form.password !== form.confirmar ? '#FCA5A5' : '#E8D9B8'}
                />
                {form.confirmar && form.password !== form.confirmar && (
                  <p className="text-xs text-red-400 mt-1">Las contraseñas no coinciden</p>
                )}
                {form.confirmar && form.password === form.confirmar && (
                  <p className="text-xs mt-1" style={{ color:'#1D7A4E' }}>✓ Las contraseñas coinciden</p>
                )}
              </div>

              {/* Municipio y teléfono — opcionales */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-stone-500">
                    Municipio (opcional)
                  </label>
                  <input
                    name="municipio"
                    value={form.municipio}
                    onChange={handleChange}
                    placeholder="Fusagasugá"
                    className="w-full px-4 py-3 rounded-2xl text-sm text-stone-800 placeholder-stone-300 outline-none"
                    style={{ background:'#FAF6F0', border:'1.5px solid #E8D9B8' }}
                    onFocus={e => e.target.style.borderColor='#92400e'}
                    onBlur={e => e.target.style.borderColor='#E8D9B8'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-stone-500">
                    Teléfono (opcional)
                  </label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="310 000 0000"
                    className="w-full px-4 py-3 rounded-2xl text-sm text-stone-800 placeholder-stone-300 outline-none"
                    style={{ background:'#FAF6F0', border:'1.5px solid #E8D9B8' }}
                    onFocus={e => e.target.style.borderColor='#92400e'}
                    onBlur={e => e.target.style.borderColor='#E8D9B8'}
                  />
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-2xl text-sm flex items-center gap-2"
                  style={{ background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626' }}>
                  ⚠ {error}
                </div>
              )}

              <button type="submit" disabled={cargando}
                className="w-full py-3.5 rounded-2xl text-white text-sm font-medium shadow-soft mt-2"
                style={{ background: cargando ? '#D4B896' : 'linear-gradient(135deg, #92400e 0%, #C47A45 100%)' }}>
                {cargando ? 'Creando tu cuenta...' : 'Crear cuenta y continuar →'}
              </button>
            </form>

            <p className="text-center text-stone-400 text-xs mt-5">
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => navigate('/login')}
                className="font-medium hover:text-stone-600 transition"
                style={{ color:'#92400e' }}>
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}