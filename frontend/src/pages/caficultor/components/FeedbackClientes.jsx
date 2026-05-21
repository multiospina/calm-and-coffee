import { useState, useEffect } from 'react';
import {
  Star, Coffee, MessageSquare, TrendingUp,
  ThumbsUp, ThumbsDown, Minus, MapPin,
  Award,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid,
  PolarAngleAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import api from '../../../api/axios';

const PRECIO_INFO = {
  justo:  { label:'Precio justo', color:'#1D7A4E', bg:'#EDFAF4', icon: ThumbsUp   },
  caro:   { label:'Caro',         color:'#C0350F', bg:'#FFF0EB', icon: ThumbsDown  },
  barato: { label:'Barato',       color:'#1B4F8A', bg:'#EBF2FF', icon: Minus       },
};

function Estrellas({ valor, max=5, size=12 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({length:max}).map((_,i) => (
        <Star key={i} size={size}
          color={i < Math.round(valor) ? '#D4A847' : '#E2E8F0'}
          fill={i < Math.round(valor) ? '#D4A847' : 'transparent'} />
      ))}
    </div>
  );
}

export default function FeedbackClientes() {
  const [feedback,  setFeedback]  = useState([]);
  const [impacto,   setImpacto]   = useState(null);
  const [cargando,  setCargando]  = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [fRes, iRes] = await Promise.all([
          api.get('/caficultor/feedback'),
          api.get('/caficultor/impacto'),
        ]);
        setFeedback(fRes.data.feedback || []);
        setImpacto(iRes.data);
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

  const p = impacto?.promedios || {};

  const radarData = [
    { label:'Sabor',       value: parseFloat(p.sabor)       || 0 },
    { label:'Cuerpo',      value: parseFloat(p.cuerpo)      || 0 },
    { label:'Balance',     value: parseFloat(p.balance)     || 0 },
    { label:'Experiencia', value: parseFloat(p.experiencia) || 0 },
    { label:'Ambiente',    value: parseFloat(p.ambiente)    || 0 },
  ];

  return (
    <div className="space-y-4">

      {/* Contador de tazas */}
      <div className="rounded-3xl overflow-hidden"
        style={{ boxShadow:'0 8px 32px rgba(61,26,92,0.25)' }}>
        <div className="px-6 py-7 text-center relative overflow-hidden"
          style={{ background:'linear-gradient(135deg, #1A0A2E 0%, #3D1A5C 100%)' }}>
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10"
            style={{ background:'white' }} />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10"
            style={{ background:'white' }} />
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coffee size={16} color="rgba(255,255,255,0.6)" />
              <p className="text-xs font-bold tracking-widest"
                style={{ color:'rgba(255,255,255,0.5)' }}>
                TAZAS SERVIDAS DE TU CAFÉ
              </p>
            </div>
            <p className="font-serif font-bold text-white mb-1"
              style={{ fontSize:'64px', lineHeight:1 }}>
              {(impacto?.total_tazas || 0).toLocaleString('es-CO')}
            </p>
            <p className="text-sm" style={{ color:'rgba(255,255,255,0.5)' }}>
              tazas entregadas a clientes reales
            </p>
          </div>
        </div>
      </div>

      {/* Cafeterías donde está tu café */}
      {impacto?.cafeterias?.length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background:'white', border:'1px solid #E2E8F0' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background:'#F3EEF5' }}>
              <MapPin size={15} color="#6B3A8A" />
            </div>
            <div>
              <p className="font-serif font-bold text-stone-800">
                Tu café está en {impacto.cafeterias.length} cafetería{impacto.cafeterias.length>1?'s':''}
              </p>
              <p className="text-xs text-stone-400">Activas ahora mismo</p>
            </div>
          </div>
          <div className="space-y-2">
            {impacto.cafeterias.map((c,i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background:'#FAF5FF', border:'1px solid #E8D4F8' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-serif font-bold"
                  style={{ background:'#3D1A5C', color:'white', fontSize:'16px' }}>
                  {i+1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-800 text-sm">{c.nombre}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} color="#94A3B8" />
                    <p className="text-xs text-stone-400">{c.municipio}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm" style={{ color:'#6B3A8A' }}>
                    {c.total_pedidos}
                  </p>
                  <p className="text-xs text-stone-400">pedidos</p>
                  {c.rating && (
                    <div className="flex items-center gap-0.5 justify-end mt-0.5">
                      <Star size={10} color="#D4A847" fill="#D4A847" />
                      <span className="text-xs font-bold" style={{ color:'#8A6200' }}>
                        {c.rating}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráfica radar */}
      {feedback.length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background:'white', border:'1px solid #E2E8F0' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background:'#F3EEF5' }}>
              <Award size={15} color="#6B3A8A" />
            </div>
            <div>
              <p className="font-serif font-bold text-stone-800">Perfil sensorial</p>
              <p className="text-xs text-stone-400">Promedio de {feedback.length} valoraciones</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E8D4F8" />
              <PolarAngleAxis
                dataKey="label"
                tick={{ fill:'#6B3A8A', fontSize:11, fontWeight:600 }}
              />
              <Tooltip
                formatter={(v) => [`${v}/5`, 'Promedio']}
                contentStyle={{
                  background:'#FAF5FF',
                  border:'1px solid #D4B8E8',
                  borderRadius:'12px',
                  fontSize:'12px'
                }}
              />
              <Radar
                dataKey="value"
                stroke="#6B3A8A"
                fill="#6B3A8A"
                fillOpacity={0.25}
                strokeWidth={2}
                dot={{ fill:'#6B3A8A', r:4 }}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* Promedios en cards */}
          <div className="grid grid-cols-5 gap-2 mt-2">
            {radarData.map((r,i) => (
              <div key={i} className="rounded-xl p-2 text-center"
                style={{ background:'#FAF5FF' }}>
                <p className="font-bold text-sm" style={{ color:'#6B3A8A' }}>
                  {r.value || '—'}
                </p>
                <p className="text-stone-400" style={{ fontSize:'9px' }}>{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista valoraciones */}
      {feedback.length === 0 ? (
        <div className="rounded-2xl py-14 text-center"
          style={{ background:'white', border:'1px solid #E2E8F0' }}>
          <MessageSquare size={32} color="#E2E8F0" className="mx-auto mb-3" />
          <p className="font-serif text-stone-400 font-semibold mb-1">Sin feedback aún</p>
          <p className="text-stone-300 text-sm">
            Cuando los clientes valoren tu café aparecerá aquí
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs font-bold text-stone-400 tracking-wider">
            ÚLTIMAS VALORACIONES
          </p>
          <div className="space-y-3">
            {feedback.map((f,i) => {
              const precio = PRECIO_INFO[f.precio_justo] || PRECIO_INFO.justo;
              return (
                <div key={i} className="rounded-2xl overflow-hidden"
                  style={{ background:'white', border:'1px solid #E2E8F0',
                    boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div className="h-1"
                    style={{ background:'linear-gradient(90deg, #3D1A5C, #6B3A8A)' }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 font-serif font-bold text-lg"
                          style={{ background:'#F3EEF5', color:'#6B3A8A' }}>
                          {f.nombre_cliente?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-serif font-bold text-stone-800">
                            {f.nombre_cliente}
                          </p>
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
                        <div className="flex items-center gap-1 justify-end mb-1">
                          <Star size={14} color="#D4A847" fill="#D4A847" />
                          <span className="font-bold text-base" style={{ color:'#8A6200' }}>
                            {f.cafe_experiencia}
                          </span>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background:precio.bg, color:precio.color }}>
                          <precio.icon size={10} />
                          {precio.label}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[
                        { label:'Sabor',   value: f.cafe_sabor    },
                        { label:'Cuerpo',  value: f.cafe_cuerpo   },
                        { label:'Balance', value: f.cafe_balance  },
                        { label:'Ambiente',value: f.tienda_ambiente },
                      ].map((m,j) => (
                        <div key={j} className="rounded-xl p-2 text-center"
                          style={{ background:'#FAF5FF' }}>
                          <p className="font-bold text-sm" style={{ color:'#6B3A8A' }}>
                            {m.value || '—'}
                          </p>
                          <Estrellas valor={parseFloat(m.value)||0} size={9} />
                          <p className="text-stone-400 mt-0.5" style={{ fontSize:'9px' }}>
                            {m.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {f.notas_sabor && (
                      <div className="rounded-xl p-3 mb-2"
                        style={{ background:'#F3EEF5', border:'1px solid #E8D4F8' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Coffee size={12} color="#6B3A8A" />
                          <p className="text-xs font-bold" style={{ color:'#6B3A8A' }}>
                            NOTAS DE SABOR
                          </p>
                        </div>
                        <p className="text-xs text-stone-600 italic">&quot;{f.notas_sabor}&quot;</p>
                      </div>
                    )}

                    {f.comentario && (
                      <div className="rounded-xl p-3"
                        style={{ background:'#FAF5FF', border:'1px solid #E8D4F8' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare size={12} color="#6B3A8A" />
                          <p className="text-xs font-bold" style={{ color:'#6B3A8A' }}>
                            COMENTARIO
                          </p>
                        </div>
                        <p className="text-xs text-stone-600 italic">&quot;{f.comentario}&quot;</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-2"
                      style={{ borderTop:'1px solid #F8F9FA' }}>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={11} color="#94A3B8" />
                        <span className="text-xs text-stone-400">{f.nombre_finca}</span>
                      </div>
                      <p className="text-xs text-stone-300">
                        {new Date(f.creado_en).toLocaleDateString('es-CO', {
                          day:'numeric', month:'short', year:'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}