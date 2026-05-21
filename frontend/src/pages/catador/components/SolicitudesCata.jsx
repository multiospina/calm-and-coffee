import { useState, useEffect } from 'react';
import {
  Star, Check, X, ChevronDown, ChevronUp,
  AlertCircle, Leaf, MapPin, Award
} from 'lucide-react';
import api from '../../../api/axios';

const CATEGORIAS_SCA = [
  { key:'fragancia_aroma',  label:'Fragancia / Aroma',  max:10, desc:'Evalúa el aroma del café molido y en taza' },
  { key:'sabor',            label:'Sabor',              max:10, desc:'Nivel y calidad del sabor principal'        },
  { key:'post_gusto',       label:'Post-gusto',         max:10, desc:'Duración y calidad del sabor residual'     },
  { key:'acidez',           label:'Acidez',             max:10, desc:'Calidad e intensidad de la acidez'         },
  { key:'cuerpo',           label:'Cuerpo',             max:10, desc:'Sensación de peso y textura en boca'       },
  { key:'balance',          label:'Balance',            max:10, desc:'Armonía entre todas las características'   },
  { key:'uniformidad',      label:'Uniformidad',        max:10, desc:'Consistencia entre las 5 tazas evaluadas'  },
  { key:'taza_limpia',      label:'Taza limpia',        max:10, desc:'Ausencia de defectos en taza'              },
  { key:'dulzor',           label:'Dulzor',             max:10, desc:'Presencia de dulzor natural en el café'    },
  { key:'impresion_global', label:'Impresión global',   max:10, desc:'Evaluación holística del café'             },
];

function SliderSCA({ campo, value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-stone-700">{campo.label}</p>
          <p className="text-xs text-stone-400">{campo.desc}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-3">
          <span className="font-serif font-bold text-xl w-12 text-right"
            style={{ color: value >= 8 ? '#1D7A4E' : value >= 6 ? '#8A6200' : '#C0350F' }}>
            {parseFloat(value).toFixed(1)}
          </span>
          <span className="text-xs text-stone-400">/10</span>
        </div>
      </div>
      <input
        type="range" min="0" max="10" step="0.25"
        value={value}
        onChange={e => onChange(campo.key, e.target.value)}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #8A6200 0%, #8A6200 ${value*10}%, #E2E8F0 ${value*10}%, #E2E8F0 100%)`
        }}
      />
      <div className="flex justify-between text-xs text-stone-300">
        <span>0</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}

export default function SolicitudesCata({ onCatacionCreada }) {
  const [pendientes,  setPendientes]  = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [catando,     setCatando]     = useState(null);
  const [guardando,   setGuardando]   = useState(false);
  const [toast,       setToast]       = useState(null);
  const [scores, setScores] = useState({
    fragancia_aroma:0, sabor:0, post_gusto:0, acidez:0,
    cuerpo:0, balance:0, uniformidad:0, taza_limpia:0,
    dulzor:0, impresion_global:0
  });
  const [notasSabor,     setNotasSabor]     = useState('');
  const [notasNarrativas,setNotasNarrativas]= useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await api.get('/catador/dashboard');
      setPendientes(res.data.pendientes || []);
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

  const iniciarCata = (cosecha) => {
    setCatando(cosecha);
    setScores({
      fragancia_aroma:7, sabor:7, post_gusto:7, acidez:7,
      cuerpo:7, balance:7, uniformidad:7, taza_limpia:7,
      dulzor:7, impresion_global:7
    });
    setNotasSabor('');
    setNotasNarrativas('');
  };

  const handleScore = (key, val) => {
    setScores(s => ({ ...s, [key]: parseFloat(val) }));
  };

  const puntajeTotal = Object.values(scores).reduce((a,b) => a + parseFloat(b||0), 0);

  const clasificacion = (p) => {
    if (p >= 90) return { label:'Extraordinario', color:'#1D7A4E', bg:'#EDFAF4' };
    if (p >= 85) return { label:'Excelente',      color:'#1B4F8A', bg:'#EBF2FF' };
    if (p >= 80) return { label:'Muy bueno',      color:'#8A6200', bg:'#FFF8E1' };
    if (p >= 75) return { label:'Bueno',           color:'#6B3A8A', bg:'#F3EEF5' };
    return              { label:'Estándar',        color:'#94A3B8', bg:'#F8F9FA' };
  };

  const guardarCatacion = async () => {
    if (!catando) return;
    setGuardando(true);
    try {
      await api.post('/catador/cataciones', {
        cosecha_id: catando.id,
        ...scores,
        notas_sabor: notasSabor ? notasSabor.split(',').map(n=>n.trim()).filter(Boolean) : null,
        notas_narrativas: notasNarrativas || null,
      });
      mostrarToast(`Catación completada — ${puntajeTotal.toFixed(1)}/100 puntos`);
      setCatando(null);
      cargar();
      onCatacionCreada && onCatacionCreada();
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error al guardar', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const clasif = clasificacion(puntajeTotal);

  if (cargando) return (
    <div className="flex justify-center py-12">
      <div className="w-7 h-7 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium"
          style={{
            background: toast.tipo==='ok' ? '#EDFAF4' : '#FEF2F2',
            border:`1px solid ${toast.tipo==='ok' ? '#A8E8CC' : '#FECACA'}`,
            color: toast.tipo==='ok' ? '#1D7A4E' : '#DC2626',
            boxShadow:'0 8px 30px rgba(0,0,0,0.12)'
          }}>
          {toast.tipo==='ok' ? <Check size={15}/> : <AlertCircle size={15}/>}
          {toast.msg}
        </div>
      )}

      {/* Formulario SCA */}
      {catando ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="rounded-3xl overflow-hidden"
            style={{ boxShadow:'0 4px 24px rgba(138,98,0,0.2)' }}>
            <div className="px-5 py-5"
              style={{ background:'linear-gradient(135deg, #5C4000 0%, #8A6200 100%)' }}>
              <p className="text-xs font-bold tracking-widest mb-1"
                style={{ color:'rgba(255,255,255,0.5)' }}>
                EVALUACIÓN SCA
              </p>
              <h2 className="font-serif text-white text-xl font-bold">{catando.variedad}</h2>
              <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.6)' }}>
                {catando.proceso} · {catando.nombre_finca} · {catando.municipio}
              </p>
            </div>
          </div>

          {/* Puntaje en tiempo real */}
          <div className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background:'white', border:`2px solid ${clasif.color}` }}>
            <div className="flex-1">
              <p className="text-xs font-bold tracking-wider mb-1" style={{ color:clasif.color }}>
                PUNTAJE SCA EN TIEMPO REAL
              </p>
              <div className="flex items-end gap-2">
                <p className="font-serif font-bold text-stone-800" style={{ fontSize:'48px', lineHeight:1 }}>
                  {puntajeTotal.toFixed(1)}
                </p>
                <p className="text-stone-400 text-lg mb-1">/100</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-sm font-bold px-3 py-1.5 rounded-xl"
                style={{ background:clasif.bg, color:clasif.color }}>
                {clasif.label}
              </span>
              <div className="w-full h-2 rounded-full mt-2"
                style={{ background:'#E2E8F0' }}>
                <div className="h-2 rounded-full transition-all"
                  style={{ background:clasif.color, width:`${puntajeTotal}%` }} />
              </div>
            </div>
          </div>

          {/* Sliders SCA */}
          <div className="rounded-2xl p-5 space-y-5"
            style={{ background:'white', border:'1px solid #FFE082' }}>
            <p className="text-xs font-bold tracking-wider" style={{ color:'#8A6200' }}>
              CATEGORÍAS SCA — Ajusta cada parámetro
            </p>
            {CATEGORIAS_SCA.map(cat => (
              <SliderSCA key={cat.key} campo={cat}
                value={scores[cat.key]}
                onChange={handleScore} />
            ))}
          </div>

          {/* Notas */}
          <div className="rounded-2xl p-5 space-y-3"
            style={{ background:'white', border:'1px solid #FFE082' }}>
            <p className="text-xs font-bold tracking-wider" style={{ color:'#8A6200' }}>
              NOTAS DEL CATADOR
            </p>
            <div>
              <p className="text-xs text-stone-400 mb-1.5">
                Notas de sabor (separadas por coma)
              </p>
              <input
                placeholder="jazmín, durazno, miel, caramelo..."
                value={notasSabor}
                onChange={e => setNotasSabor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background:'#FFFBF0', border:'1px solid #FFE082' }}
              />
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-1.5">Narrativa del café</p>
              <textarea
                placeholder="Describe la experiencia de este café..."
                value={notasNarrativas}
                onChange={e => setNotasNarrativas(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={{ background:'#FFFBF0', border:'1px solid #FFE082' }}
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3">
            <button onClick={() => setCatando(null)}
              className="flex-1 py-3.5 rounded-2xl text-sm font-medium"
              style={{ background:'#F8F9FA', color:'#4A5568' }}>
              Cancelar
            </button>
            <button onClick={guardarCatacion} disabled={guardando}
              className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white"
              style={{ background: guardando ? '#CBD5E0' : '#8A6200' }}>
              {guardando ? 'Guardando...' : `Guardar catación (${puntajeTotal.toFixed(1)} pts)`}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Lista pendientes */}
          <div>
            <h2 className="font-serif font-bold text-stone-800 text-xl">Solicitudes pendientes</h2>
            <p className="text-stone-400 text-sm mt-0.5">
              {pendientes.length} cosecha{pendientes.length!==1?'s':''} por evaluar
            </p>
          </div>

          {pendientes.length === 0 ? (
            <div className="rounded-2xl py-14 text-center"
              style={{ background:'white', border:'1px solid #E2E8F0' }}>
              <Award size={32} color="#E2E8F0" className="mx-auto mb-3" />
              <p className="font-serif text-stone-400 font-semibold mb-1">
                Sin solicitudes pendientes
              </p>
              <p className="text-stone-300 text-sm">
                Todas las cosechas han sido evaluadas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendientes.map((c,i) => (
                <div key={i} className="rounded-2xl overflow-hidden"
                  style={{ background:'white', border:'1.5px solid #FFE082',
                    boxShadow:'0 2px 12px rgba(138,98,0,0.08)' }}>
                  <div className="h-1"
                    style={{ background:'linear-gradient(90deg, #8A6200, #D4A847)' }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background:'#FFF8E1' }}>
                          <Leaf size={18} color="#8A6200" />
                        </div>
                        <div>
                          <p className="font-serif font-bold text-stone-800">{c.variedad}</p>
                          <p className="text-xs text-stone-400 capitalize mt-0.5">{c.proceso}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin size={10} color="#94A3B8" />
                            <span className="text-xs text-stone-400">
                              {c.nombre_finca} · {c.municipio}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                        style={{ background:'#FFF8E1', color:'#8A6200' }}>
                        Pendiente
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3"
                      style={{ borderTop:'1px solid #FFF8E1' }}>
                      <p className="text-xs text-stone-400">
                        Caficultor: {c.nombre_caficultor}
                      </p>
                      <button onClick={() => iniciarCata(c)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
                        style={{ background:'#8A6200' }}>
                        <Star size={12} />
                        Iniciar catación
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
