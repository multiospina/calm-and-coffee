import { useState, useEffect } from 'react';
import { Star, MapPin, ChevronDown, ChevronUp, Award } from 'lucide-react';
import api from '../../../api/axios';

const clasificacion = (p) => {
  if (p >= 90) return { label:'Extraordinario', color:'#1D7A4E', bg:'#EDFAF4' };
  if (p >= 85) return { label:'Excelente',      color:'#1B4F8A', bg:'#EBF2FF' };
  if (p >= 80) return { label:'Muy bueno',      color:'#8A6200', bg:'#FFF8E1' };
  if (p >= 75) return { label:'Bueno',           color:'#6B3A8A', bg:'#F3EEF5' };
  return              { label:'Estándar',        color:'#94A3B8', bg:'#F8F9FA' };
};

const CAMPOS = [
  { key:'fragancia_aroma',  label:'Fragancia/Aroma' },
  { key:'sabor',            label:'Sabor'           },
  { key:'post_gusto',       label:'Post-gusto'      },
  { key:'acidez',           label:'Acidez'          },
  { key:'cuerpo',           label:'Cuerpo'          },
  { key:'balance',          label:'Balance'         },
  { key:'uniformidad',      label:'Uniformidad'     },
  { key:'taza_limpia',      label:'Taza limpia'     },
  { key:'dulzor',           label:'Dulzor'          },
  { key:'impresion_global', label:'Imp. global'     },
];

export default function HistorialCata() {
  const [cataciones, setCataciones] = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [expandida,  setExpandida]  = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/catador/historial');
        setCataciones(res.data.cataciones || []);
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
      <div className="w-7 h-7 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif font-bold text-stone-800 text-xl">Historial de cataciones</h2>
        <p className="text-stone-400 text-sm mt-0.5">
          {cataciones.length} evaluación{cataciones.length!==1?'es':''} realizadas
        </p>
      </div>

      {cataciones.length === 0 ? (
        <div className="rounded-2xl py-14 text-center"
          style={{ background:'white', border:'1px solid #E2E8F0' }}>
          <Award size={32} color="#E2E8F0" className="mx-auto mb-3" />
          <p className="font-serif text-stone-400 font-semibold mb-1">Sin cataciones aún</p>
          <p className="text-stone-300 text-sm">Evalúa tu primera cosecha desde Solicitudes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cataciones.map((c,i) => {
            const clasif = clasificacion(parseFloat(c.puntaje_total));
            const exp    = expandida === c.id;
            return (
              <div key={i} className="rounded-2xl overflow-hidden"
                style={{ background:'white', border:`1.5px solid ${clasif.color}40`,
                  boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="h-1"
                  style={{ background:`linear-gradient(90deg, ${clasif.color}, #D4A847)` }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-serif font-bold text-stone-800">{c.variedad}</p>
                      <p className="text-xs text-stone-400 mt-0.5 capitalize">{c.proceso}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={10} color="#94A3B8" />
                        <span className="text-xs text-stone-400">
                          {c.nombre_finca} · {c.municipio}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-serif font-bold text-2xl" style={{ color:clasif.color }}>
                        {parseFloat(c.puntaje_total).toFixed(1)}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background:clasif.bg, color:clasif.color }}>
                        {clasif.label}
                      </span>
                    </div>
                  </div>

                  {/* Notas de sabor */}
                  {c.notas_sabor?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {c.notas_sabor.map((n,j) => (
                        <span key={j} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background:'#FFF8E1', color:'#8A6200' }}>
                          {n}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-stone-300">
                      {new Date(c.creado_en).toLocaleDateString('es-CO', {
                        day:'numeric', month:'long', year:'numeric'
                      })}
                    </p>
                    <button onClick={() => setExpandida(exp?null:c.id)}
                      className="flex items-center gap-1 text-xs font-medium"
                      style={{ color:'#8A6200' }}>
                      {exp ? 'Menos' : 'Ver detalles'}
                      {exp ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                    </button>
                  </div>

                  {/* Detalle SCA */}
                  {exp && (
                    <div className="mt-4 pt-4 space-y-3"
                      style={{ borderTop:'1px solid #FFF8E1' }}>
                      <p className="text-xs font-bold tracking-wider" style={{ color:'#8A6200' }}>
                        DESGLOSE SCA
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {CAMPOS.map(f => (
                          <div key={f.key} className="flex items-center justify-between px-3 py-2 rounded-xl"
                            style={{ background:'#FFFBF0' }}>
                            <span className="text-xs text-stone-500">{f.label}</span>
                            <div className="flex items-center gap-1">
                              <Star size={10} color="#D4A847" fill="#D4A847" />
                              <span className="text-xs font-bold" style={{ color:'#8A6200' }}>
                                {parseFloat(c[f.key]).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {c.notas_narrativas && (
                        <div className="rounded-xl p-3"
                          style={{ background:'#FFF8E1', border:'1px solid #FFE082' }}>
                          <p className="text-xs font-bold mb-1" style={{ color:'#8A6200' }}>
                            NARRATIVA
                          </p>
                          <p className="text-xs text-stone-600 italic leading-relaxed">
                            &ldquo;{c.notas_narrativas}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
