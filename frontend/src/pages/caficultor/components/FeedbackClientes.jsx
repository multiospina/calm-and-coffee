import { useState, useEffect } from 'react';
import { Star, Coffee, MessageSquare, TrendingUp } from 'lucide-react';
import api from '../../../api/axios';

const PRECIO_INFO = {
  justo:  { label:'Precio justo',  color:'#1D7A4E', bg:'#EDFAF4' },
  caro:   { label:'Caro',          color:'#C0350F', bg:'#FFF0EB' },
  barato: { label:'Barato',        color:'#1B4F8A', bg:'#EBF2FF' },
};

function Estrellas({ valor, max=5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({length:max}).map((_,i) => (
        <Star key={i} size={12}
          color={i < Math.round(valor) ? '#D4A847' : '#E2E8F0'}
          fill={i < Math.round(valor) ? '#D4A847' : 'transparent'} />
      ))}
    </div>
  );
}

export default function FeedbackClientes() {
  const [feedback, setFeedback] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/caficultor/feedback');
        setFeedback(res.data.feedback || []);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) return (
    <div className="flex justify-center py-12">
      <div className="w-7 h-7 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );

  if (feedback.length === 0) return (
    <div className="rounded-2xl py-14 text-center"
      style={{ background:'white', border:'1px solid #E2E8F0' }}>
      <MessageSquare size={32} color="#E2E8F0" className="mx-auto mb-3" />
      <p className="font-serif text-stone-400 font-semibold mb-1">Sin feedback aún</p>
      <p className="text-stone-300 text-sm">Cuando los clientes valoren tu café aparecerá aquí</p>
    </div>
  );

  // Promedios
  const promedio = (campo) => {
    const vals = feedback.filter(f => f[campo]).map(f => parseFloat(f[campo]));
    return vals.length > 0 ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : '—';
  };

  return (
    <div className="space-y-4">

      {/* Promedios generales */}
      <div className="rounded-2xl p-5"
        style={{ background:'linear-gradient(135deg, #1A0A2E 0%, #3D1A5C 100%)' }}>
        <p className="text-xs font-bold tracking-widest mb-4"
          style={{ color:'rgba(255,255,255,0.5)' }}>
          PROMEDIOS GENERALES — {feedback.length} valoraciones
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'Experiencia', value: promedio('cafe_experiencia') },
            { label:'Sabor',       value: promedio('cafe_sabor')       },
            { label:'Aroma',       value: promedio('cafe_aroma')       },
          ].map((p,i) => (
            <div key={i} className="rounded-xl p-3 text-center"
              style={{ background:'rgba(255,255,255,0.1)' }}>
              <p className="font-serif font-bold text-white text-2xl">{p.value}</p>
              <div className="flex justify-center mt-1 mb-1">
                <Estrellas valor={parseFloat(p.value)||0} />
              </div>
              <p className="text-xs" style={{ color:'rgba(255,255,255,0.6)' }}>{p.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lista feedback */}
      <p className="text-xs font-bold text-stone-400 tracking-wider">
        ÚLTIMAS VALORACIONES
      </p>

      <div className="space-y-3">
        {feedback.map((f,i) => {
          const precio = PRECIO_INFO[f.precio_justo] || PRECIO_INFO.justo;
          return (
            <div key={i} className="rounded-2xl p-4"
              style={{ background:'white', border:'1px solid #E2E8F0' }}>

              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-serif font-bold"
                    style={{ background:'#F3EEF5', color:'#6B3A8A', fontSize:'16px' }}>
                    {f.nombre_cliente?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-serif font-bold text-stone-800">{f.nombre_cliente}</p>
                    <p className="text-xs text-stone-400">{f.nombre_cafe}</p>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{ background:'#F3EEF5', color:'#6B3A8A' }}>
                        {f.variedad}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{ background:'#EBF2FF', color:'#1B4F8A' }}>
                        {f.proceso}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <Star size={13} color="#D4A847" fill="#D4A847" />
                    <span className="font-bold text-sm" style={{ color:'#8A6200' }}>
                      {f.cafe_experiencia}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background:precio.bg, color:precio.color }}>
                    {precio.label}
                  </span>
                </div>
              </div>

              {/* Métricas detalladas */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label:'Aroma',   value: f.cafe_aroma   },
                  { label:'Sabor',   value: f.cafe_sabor   },
                  { label:'Cuerpo',  value: f.cafe_cuerpo  },
                  { label:'Balance', value: f.cafe_balance },
                ].map((m,j) => (
                  <div key={j} className="rounded-xl p-2 text-center"
                    style={{ background:'#FAF5FF' }}>
                    <p className="font-bold text-sm" style={{ color:'#6B3A8A' }}>
                      {m.value || '—'}
                    </p>
                    <Estrellas valor={parseFloat(m.value)||0} />
                    <p className="text-xs text-stone-400 mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Comentario */}
              {f.notas_adicionales && (
                <div className="rounded-xl p-3"
                  style={{ background:'#FAF5FF', border:'1px solid #E8D4F8' }}>
                  <p className="text-xs italic text-stone-600">&quot;{f.notas_adicionales}&quot;</p>
                </div>
              )}

              {/* Fecha */}
              <p className="text-xs text-stone-300 mt-2 text-right">
                {new Date(f.creado_en).toLocaleDateString('es-CO', {
                  day:'numeric', month:'long', year:'numeric'
                })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}