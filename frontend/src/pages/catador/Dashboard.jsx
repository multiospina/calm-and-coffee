import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function CatadorDashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [cataciones, setCataciones] = useState([]);
  const [cargando, setCargando]     = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/admin/estadisticas');
        setCataciones(res.data.top_cafes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  return (
    <div className="min-h-screen" style={{ background:'#FFF8E1' }}>

      <nav className="px-6 py-4 flex items-center justify-between"
        style={{ background:'#8A6200' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:'rgba(255,255,255,0.15)' }}>
            <span className="text-white font-serif font-bold text-sm">C</span>
          </div>
          <div>
            <span className="text-white font-serif font-semibold">Calm and Coffee</span>
            <span className="text-amber-300 text-xs ml-2">· Catador</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-amber-200 text-sm">{usuario?.nombre?.split(' ')[0]}</span>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="text-amber-300 hover:text-white text-xs transition">
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-5 py-8">

        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-stone-800">
            Panel del Catador ☕
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Evalúa cosechas con el protocolo SCA
          </p>
        </div>

        {/* Protocolo SCA */}
        <div className="rounded-2xl p-5 mb-5"
          style={{ background:'linear-gradient(135deg, #8A6200 0%, #5C4000 100%)' }}>
          <p className="text-amber-200 text-xs font-medium mb-1 tracking-wider">
            PROTOCOLO SCA
          </p>
          <h2 className="text-white font-serif text-xl font-bold mb-3">
            Catación profesional
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Fragancia / Aroma', 'Sabor',
              'Post-gusto',        'Acidez',
              'Cuerpo',            'Balance',
              'Uniformidad',       'Taza limpia',
              'Dulzor',            'Impresión global',
            ].map((cat,i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="text-amber-100 text-xs">{cat}</span>
              </div>
            ))}
          </div>
          <p className="text-amber-300 text-xs mt-3">
            Puntaje máximo: 100 puntos SCA
          </p>
        </div>

        {/* Estadísticas de cafés evaluados */}
        {!cargando && cataciones.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-5"
            style={{ border:'1px solid #FFE082' }}>
            <h2 className="font-serif font-bold text-stone-800 mb-4">
              Cafés en el sistema
            </h2>
            <div className="space-y-3">
              {cataciones.map((c,i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background:'#FFF8E1' }}>
                  <div>
                    <p className="text-stone-700 text-sm font-medium">{c.nombre}</p>
                    <p className="text-stone-400 text-xs">{c.cafeteria}</p>
                  </div>
                  <div className="text-right">
                    {c.rating && (
                      <p className="text-amber-500 text-sm font-bold">★ {c.rating}</p>
                    )}
                    <p className="text-stone-400 text-xs">{c.pedidos} pedidos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Próximamente */}
        <div className="rounded-2xl p-5"
          style={{ background:'rgba(138,98,0,0.08)', border:'1px solid rgba(138,98,0,0.2)' }}>
          <p className="text-amber-700 text-xs font-medium mb-1 tracking-wider">
            PRÓXIMAMENTE
          </p>
          <p className="text-stone-700 text-sm">
            El módulo completo de catación SCA con formulario de 10 categorías,
            historial de evaluaciones y certificaciones estará disponible en la
            entrega final de mayo 2026.
          </p>
        </div>
      </div>
    </div>
  );
}