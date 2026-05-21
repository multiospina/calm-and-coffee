import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, MapPin, Star, Clock } from 'lucide-react';
import api from '../../../api/axios';

export default function HistorialCatas() {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [cargando,  setCargando]  = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/cliente/historial');
        setHistorial(res.data.historial);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) return (
    <div className="flex justify-center py-20">
      <div className="w-7 h-7 border-2 border-green-200 border-t-green-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif font-bold text-stone-800 text-xl">Mis cafés catados</h2>
        <p className="text-stone-400 text-sm mt-0.5">{historial.length} experiencias registradas</p>
      </div>

      {historial.length === 0 ? (
        <div className="rounded-2xl py-16 text-center"
          style={{ background:'white', border:'1px solid #E2E8F0' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background:'#EDFAF4' }}>
            <Coffee size={28} color="#1D7A4E" />
          </div>
          <h2 className="font-serif text-stone-600 font-semibold mb-2">Aún no has catado ningún café</h2>
          <p className="text-stone-400 text-sm">Escanea el QR de tu próximo café para empezar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {historial.map((h,i) => (
            <button key={i}
              onClick={() => h.qr_codigo && navigate(`/trazabilidad/${h.qr_codigo}`)}
              className="w-full rounded-2xl p-5 text-left transition active:scale-95"
              style={{ background:'white', border:'1px solid #A8E8CC' }}>

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:'#EDFAF4' }}>
                    <Coffee size={18} color="#1D7A4E" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800">{h.variedad}</h3>
                    <p className="text-stone-400 text-xs mt-0.5 capitalize">
                      {h.proceso} · {h.nombre_finca}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full capitalize"
                  style={{ background:'#EDFAF4', color:'#1D7A4E' }}>
                  {h.tipo_qr}
                </span>
              </div>

              {h.nombre_cafeteria && (
                <div className="flex items-center gap-1 mb-2">
                  <MapPin size={11} color="#94A3B8" />
                  <p className="text-stone-400 text-xs">{h.nombre_cafeteria} · {h.municipio}</p>
                </div>
              )}

              {h.cafe_experiencia && (
                <div className="flex items-center gap-3 pt-3"
                  style={{ borderTop:'1px solid #EDFAF4' }}>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={13}
                        color={s <= h.cafe_experiencia ? '#D4A847' : '#E2E8F0'}
                        fill={s <= h.cafe_experiencia ? '#D4A847' : 'transparent'} />
                    ))}
                  </div>
                  {h.comentario && (
                    <p className="text-stone-400 text-xs italic line-clamp-1">"{h.comentario}"</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <Clock size={10} color="#CBD5E0" />
                  <p className="text-stone-300 text-xs">
                    {new Date(h.escaneado_en).toLocaleDateString('es-CO', {
                      day:'numeric', month:'long', year:'numeric'
                    })}
                  </p>
                </div>
                {h.puntos_ganados > 0 && (
                  <span className="text-xs font-medium" style={{ color:'#1D7A4E' }}>
                    +{h.puntos_ganados} pts
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
