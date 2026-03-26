import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function MenuMesa() {
  const { cafeteria_id, mesa } = useParams();
  const { usuario }            = useAuth();
  const navigate               = useNavigate();

  const [cafeteria, setCafeteria] = useState(null);
  const [menu, setMenu]           = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get(`/cliente/cafeterias/${cafeteria_id}/menu`);
        setCafeteria(res.data.cafeteria);
        setMenu(res.data.menu);
      } catch (err) {
        setError('Cafetería no encontrada');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [cafeteria_id]);

  const handlePedir = (item) => {
    if (!usuario) {
      // Guardar a dónde volver después del login
      localStorage.setItem('redirect_after_login', `/menu/${cafeteria_id}/${mesa}`);
      navigate('/login');
      return;
    }
    navigate(`/cliente/pedido/${cafeteria_id}/${item.id}?mesa=${mesa}`);
  };

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c0a08' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-stone-400 text-sm">Cargando menú...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c0a08' }}>
      <div className="text-center">
        <div className="text-5xl mb-4">☕</div>
        <p className="text-white font-serif text-xl">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#0c0a08' }}>

      {/* Header */}
      <div className="px-5 pt-8 pb-6"
        style={{ background: 'linear-gradient(180deg, #1a0a00 0%, #0c0a08 100%)' }}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: '#92400e' }}>
              <span className="text-white font-serif font-bold text-xs">C</span>
            </div>
            <span className="text-white font-serif text-sm">Calm and Coffee</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-amber-400 text-xs font-medium mb-1 tracking-wider">
                MENÚ DIGITAL
              </p>
              <h1 className="text-white font-serif text-2xl font-bold">
                {cafeteria?.nombre}
              </h1>
              <p className="text-stone-400 text-sm mt-1">
                📍 {cafeteria?.municipio} · {mesa.replace('-', ' ')}
              </p>
            </div>
            {usuario && (
              <div className="text-right">
                <p className="text-stone-400 text-xs">Hola,</p>
                <p className="text-white text-sm font-medium">
                  {usuario.nombre?.split(' ')[0]}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pb-10">

        {/* Banner si no hay sesión */}
        {!usuario && (
          <div className="rounded-2xl p-4 mb-5 flex items-center justify-between"
            style={{ background: 'rgba(146,64,14,0.2)', border: '1px solid rgba(146,64,14,0.4)' }}>
            <div>
              <p className="text-amber-300 text-sm font-medium">¿Primera vez aquí?</p>
              <p className="text-amber-600 text-xs mt-0.5">
                Crea una cuenta para pedir y conocer la historia de tu café
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('redirect_after_login', `/menu/${cafeteria_id}/${mesa}`);
                navigate('/login');
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium flex-shrink-0 ml-3"
              style={{ background: '#92400e', color: 'white' }}>
              Ingresar
            </button>
          </div>
        )}

        {/* Lista de cafés */}
        <p className="text-stone-500 text-xs font-medium mb-4 tracking-wider">
          CAFÉS DE ESPECIALIDAD
        </p>

        <div className="space-y-4">
          {menu.map((item, i) => (
            <div key={i} className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{item.nombre}</h3>
                    <p className="text-stone-400 text-xs mt-0.5 capitalize">
                      {item.variedad} · {item.proceso}
                    </p>
                    {item.nombre_finca && (
                      <p className="text-stone-500 text-xs mt-0.5">
                        {item.nombre_finca} · {item.altitud_msnm} msnm
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="text-white font-bold">
                      ${parseInt(item.precio).toLocaleString('es-CO')}
                    </p>
                    {item.rating && (
                      <p className="text-amber-400 text-xs">★ {item.rating}</p>
                    )}
                  </div>
                </div>

                {item.descripcion && (
                  <p className="text-stone-500 text-xs leading-relaxed mb-3">
                    {item.descripcion}
                  </p>
                )}

                <div className="flex gap-2">
                  {item.qr_codigo && (
                    <button
                      onClick={() => navigate(`/trazabilidad/${item.qr_codigo}`)}
                      className="px-3 py-2 rounded-xl text-xs transition"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#a8a29e' }}>
                      Ver historia ☕
                    </button>
                  )}
                  <button
                    onClick={() => handlePedir(item)}
                    disabled={item.stock <= 0}
                    className="flex-1 py-2 rounded-xl text-xs font-medium transition"
                    style={{
                      background: item.stock > 0 ? '#92400e' : 'rgba(255,255,255,0.06)',
                      color: item.stock > 0 ? 'white' : '#57534e',
                      cursor: item.stock > 0 ? 'pointer' : 'not-allowed'
                    }}>
                    {item.stock > 0 ? 'Pedir ahora →' : 'Agotado'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-stone-700 text-xs italic">
            &quot;Detrás de cada taza, hay una historia que merece ser contada.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}