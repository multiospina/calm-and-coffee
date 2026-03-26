import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const PASOS = [
  { n:1, titulo:'El aroma',    sub:'Antes del primer sorbo',     emoji:'👃' },
  { n:2, titulo:'El sabor',    sub:'El momento de la verdad',    emoji:'👅' },
  { n:3, titulo:'La sensación',sub:'Lo que deja en ti',          emoji:'✨' },
  { n:4, titulo:'Tu opinión',  sub:'Cuéntale al caficultor',     emoji:'💬' },
];

const NOTAS_AROMAS = {
  'Florales':  ['jazmín','rosa','violeta','lavanda','azahar','hibisco'],
  'Frutales':  ['durazno','mango','maracuyá','fresa','mora','ciruela','uva','manzana'],
  'Cítricos':  ['limón','naranja','mandarina','bergamota','pomelo'],
  'Dulces':    ['miel','caramelo','panela','vainilla','chocolate','cacao'],
  'Nueces':    ['almendra','avellana','maní','nuez','coco'],
  'Especias':  ['canela','clavo','cardamomo','pimienta','jengibre'],
  'Herbales':  ['hierba','té verde','menta','eucalipto'],
  'Terrosos':  ['tierra húmeda','madera','tabaco','cuero'],
};

const SENSACIONES = [
  { key:'acidez',    label:'Acidez',     desc:'¿Qué tan brillante o cítrico?',  emojis:['Plana','Suave','Media','Brillante','Vibrante'] },
  { key:'cuerpo',    label:'Cuerpo',     desc:'¿Qué tan denso en boca?',        emojis:['Aguado','Ligero','Medio','Denso','Cremoso'] },
  { key:'dulzor',    label:'Dulzor',     desc:'¿Qué tan dulce naturalmente?',   emojis:['Amargo','Seco','Suave','Dulce','Muy dulce'] },
  { key:'amargor',   label:'Amargor',    desc:'¿Qué tanto amargor percibiste?', emojis:['Ninguno','Leve','Medio','Pronunciado','Intenso'] },
  { key:'postgusto', label:'Post-gusto', desc:'¿Cuánto tiempo dura el sabor?',  emojis:['Nada','Corto','Medio','Largo','Eterno'] },
];

const DIMENSIONES_PRINCIPALES = [
  { key:'cafe_aroma',      label:'Aroma general',  emoji:'👃', color:'#9B6FB3' },
  { key:'cafe_sabor',      label:'Sabor',          emoji:'☕', color:'#C47A45' },
  { key:'cafe_cuerpo',     label:'Cuerpo',         emoji:'💧', color:'#1B4F8A' },
  { key:'cafe_balance',    label:'Balance',        emoji:'⚖️', color:'#1D7A4E' },
  { key:'cafe_experiencia',label:'Experiencia',    emoji:'✨', color:'#D4A847' },
  { key:'barista_atencion',label:'Atención',       emoji:'🙋', color:'#C0350F' },
  { key:'tienda_ambiente', label:'Ambiente',       emoji:'🏠', color:'#6B7280' },
];

export default function ClienteCata() {
  const { pedido_id } = useParams();
  const navigate      = useNavigate();

  const [paso, setPaso] = useState(1);

  // Aromas seleccionados
  const [aromas, setAromas] = useState([]);
  const [aromaCategoria, setAromaCategoria] = useState('Florales');

  // Puntuaciones principales
  const [puntuaciones, setPuntuaciones] = useState({
    cafe_aroma:0, cafe_sabor:0, cafe_cuerpo:0,
    cafe_balance:0, cafe_experiencia:0,
    barista_atencion:0, tienda_ambiente:0,
  });

  // Sensaciones
  const [sensaciones, setSensaciones] = useState({
    acidez:0, cuerpo:0, dulzor:0, amargor:0, postgusto:0
  });

  // Opinión final
  const [precioJusto, setPrecioJusto]   = useState('justo');
  const [comentario, setComentario]     = useState('');
  const [recomendaria, setRecomendaria] = useState(null);

  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  const toggleAroma = (nota) => {
    setAromas(prev =>
      prev.includes(nota)
        ? prev.filter(n => n !== nota)
        : prev.length < 6 ? [...prev, nota] : prev
    );
  };

  const setPuntuacion = (key, valor) => {
    setPuntuaciones(prev => ({ ...prev, [key]: valor }));
  };

  const setSensacion = (key, valor) => {
    setSensaciones(prev => ({ ...prev, [key]: valor }));
  };

  const puedeAvanzar = () => {
    if (paso === 1) return aromas.length > 0;
    if (paso === 2) return puntuaciones.cafe_experiencia > 0;
    if (paso === 3) return Object.values(sensaciones).every(v => v > 0);
    return true;
  };

  const enviarValoracion = async () => {
    if (!puntuaciones.cafe_experiencia) {
      setError('Por favor califica la experiencia general');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      const res = await api.post(`/cliente/pedidos/${pedido_id}/valorar`, {
        ...puntuaciones,
        notas_sabor:  aromas,
        precio_justo: precioJusto,
        comentario:   comentario || null,
      });
      setResultado(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la valoración');
    } finally {
      setEnviando(false);
    }
  };

  // ── RESULTADO FINAL ─────────────────────────────────────
  if (resultado) return (
    <div className="min-h-screen flex items-center justify-center px-5"
      style={{ background: '#0c0a08' }}>
      <div className="max-w-sm w-full text-center">
        <div className="text-7xl mb-5">🏅</div>
        <h1 className="text-white font-serif text-3xl font-bold mb-2">
          ¡Cata completada!
        </h1>
        <p className="text-stone-400 text-sm mb-8">
          Tu experiencia ha sido registrada
        </p>

        <div className="rounded-2xl p-6 mb-4"
          style={{ background:'rgba(212,168,71,0.1)', border:'1px solid rgba(212,168,71,0.3)' }}>
          <div className="text-amber-400 font-serif text-5xl font-bold mb-1">
            +{resultado.puntos_ganados}
          </div>
          <div className="text-amber-600 text-sm">puntos ganados ✨</div>
        </div>

        {aromas.length > 0 && (
          <div className="rounded-2xl p-4 mb-6"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-stone-500 text-xs mb-3">Aromas que identificaste</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {aromas.map(a => (
                <span key={a} className="text-xs px-3 py-1 rounded-full capitalize"
                  style={{ background:'rgba(217,119,6,0.15)', color:'#d97706', border:'1px solid rgba(217,119,6,0.2)' }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button onClick={() => navigate('/cliente/pasaporte')}
            className="w-full py-3 rounded-2xl text-white text-sm font-medium"
            style={{ background:'#1D7A4E' }}>
            Ver mi pasaporte →
          </button>
          <button onClick={() => navigate('/cliente')}
            className="w-full py-3 rounded-2xl text-sm text-stone-400">
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background:'#0c0a08' }}>

      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between"
        style={{ background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => paso > 1 ? setPaso(p => p-1) : navigate(-1)}
          className="text-stone-400 hover:text-white text-sm transition">
          ←
        </button>
        <div className="text-center">
          <p className="text-white font-serif font-semibold text-sm">
            {PASOS[paso-1].titulo}
          </p>
          <p className="text-stone-500 text-xs">{PASOS[paso-1].sub}</p>
        </div>
        <span className="text-stone-600 text-xs">{paso}/4</span>
      </nav>

      {/* Barra progreso */}
      <div className="h-0.5 w-full" style={{ background:'rgba(255,255,255,0.06)' }}>
        <div className="h-0.5 transition-all duration-500"
          style={{ background:'#d97706', width:`${(paso/4)*100}%` }} />
      </div>

      <div className="max-w-lg mx-auto px-5 py-7">

        {/* ── PASO 1 — AROMAS ──────────────────────────── */}
        {paso === 1 && (
          <div>
            <p className="text-amber-400 text-xs font-medium mb-1 tracking-wider">PASO 1 · EL AROMA</p>
            <h2 className="text-white font-serif text-2xl font-bold mb-1">
              Antes del primer sorbo
            </h2>
            <p className="text-stone-400 text-sm mb-5">
              Acerca la taza a tu nariz. ¿Qué percibes? Selecciona hasta 6 notas.
            </p>

            {/* Categorías de aromas */}
            <div className="flex gap-2 flex-wrap mb-4">
              {Object.keys(NOTAS_AROMAS).map(cat => (
                <button key={cat}
                  onClick={() => setAromaCategoria(cat)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition"
                  style={{
                    background: aromaCategoria === cat ? '#d97706' : 'rgba(255,255,255,0.06)',
                    color: aromaCategoria === cat ? 'white' : '#a8a29e',
                  }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Notas de la categoría seleccionada */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {NOTAS_AROMAS[aromaCategoria].map(nota => (
                <button key={nota}
                  onClick={() => toggleAroma(nota)}
                  className="py-3 rounded-xl text-xs capitalize text-center transition"
                  style={{
                    background: aromas.includes(nota) ? '#d97706' : 'rgba(255,255,255,0.06)',
                    color: aromas.includes(nota) ? 'white' : '#a8a29e',
                    border: aromas.includes(nota) ? '1px solid #d97706' : '1px solid rgba(255,255,255,0.08)',
                  }}>
                  {nota}
                </button>
              ))}
            </div>

            {/* Seleccionadas */}
            {aromas.length > 0 && (
              <div className="rounded-2xl p-4 mb-5"
                style={{ background:'rgba(217,119,6,0.08)', border:'1px solid rgba(217,119,6,0.2)' }}>
                <p className="text-amber-600 text-xs mb-2">
                  Aromas identificados ({aromas.length}/6)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {aromas.map(a => (
                    <span key={a}
                      onClick={() => toggleAroma(a)}
                      className="text-xs px-3 py-1 rounded-full capitalize cursor-pointer"
                      style={{ background:'#d97706', color:'white' }}>
                      {a} ×
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setPaso(2)}
              disabled={aromas.length === 0}
              className="w-full py-3.5 rounded-2xl text-sm font-medium transition"
              style={{ background: aromas.length > 0 ? '#d97706' : '#44403c', color:'white' }}>
              {aromas.length > 0 ? `Continuar con ${aromas.length} aroma${aromas.length>1?'s':''} →` : 'Selecciona al menos 1 aroma'}
            </button>
          </div>
        )}

        {/* ── PASO 2 — PUNTUACIONES ────────────────────── */}
        {paso === 2 && (
          <div>
            <p className="text-amber-400 text-xs font-medium mb-1 tracking-wider">PASO 2 · EL SABOR</p>
            <h2 className="text-white font-serif text-2xl font-bold mb-1">
              Da el primer sorbo
            </h2>
            <p className="text-stone-400 text-sm mb-6">
              Deja que el café recorra toda tu boca. Ahora califica.
            </p>

            <div className="space-y-5">
              {DIMENSIONES_PRINCIPALES.map(d => (
                <div key={d.key}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{d.emoji}</span>
                      <span className="text-white text-sm font-medium">{d.label}</span>
                    </div>
                    <span className="text-xs font-bold"
                      style={{ color: puntuaciones[d.key] > 0 ? d.color : '#57534e' }}>
                      {puntuaciones[d.key] > 0 ? '★'.repeat(puntuaciones[d.key]) : '—'}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1,2,3,4,5].map(v => (
                      <button key={v}
                        onClick={() => setPuntuacion(d.key, v)}
                        className="flex-1 py-3 rounded-xl text-sm font-bold transition"
                        style={{
                          background: puntuaciones[d.key] >= v ? d.color : 'rgba(255,255,255,0.06)',
                          color: puntuaciones[d.key] >= v ? 'white' : '#57534e',
                        }}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPaso(3)}
              disabled={!puntuaciones.cafe_experiencia}
              className="w-full mt-7 py-3.5 rounded-2xl text-white text-sm font-medium transition"
              style={{ background: puntuaciones.cafe_experiencia ? '#d97706' : '#44403c' }}>
              Continuar →
            </button>
          </div>
        )}

        {/* ── PASO 3 — SENSACIONES ─────────────────────── */}
        {paso === 3 && (
          <div>
            <p className="text-amber-400 text-xs font-medium mb-1 tracking-wider">PASO 3 · LA SENSACIÓN</p>
            <h2 className="text-white font-serif text-2xl font-bold mb-1">
              ¿Qué sientes?
            </h2>
            <p className="text-stone-400 text-sm mb-6">
              Describe las sensaciones específicas que te dejó este café.
            </p>

            <div className="space-y-5">
              {SENSACIONES.map(s => (
                <div key={s.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{s.label}</span>
                    <span className="text-stone-500 text-xs">{s.desc}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {s.emojis.map((label, i) => (
                      <button key={i}
                        onClick={() => setSensacion(s.key, i+1)}
                        className="flex-1 py-2.5 rounded-xl text-center transition"
                        style={{
                          background: sensaciones[s.key] === i+1
                            ? '#1D7A4E'
                            : sensaciones[s.key] > i+1
                              ? 'rgba(29,122,78,0.3)'
                              : 'rgba(255,255,255,0.06)',
                          border: sensaciones[s.key] === i+1
                            ? '1px solid #1D7A4E'
                            : '1px solid rgba(255,255,255,0.06)',
                        }}>
                        <span className="text-white text-xs leading-tight block"
                          style={{ fontSize:'9px' }}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen de aromas */}
            {aromas.length > 0 && (
              <div className="rounded-2xl p-4 mt-5"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-stone-500 text-xs mb-2">Aromas que identificaste</p>
                <div className="flex flex-wrap gap-1.5">
                  {aromas.map(a => (
                    <span key={a} className="text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{ background:'rgba(217,119,6,0.15)', color:'#d97706' }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setPaso(4)}
              disabled={!puedeAvanzar()}
              className="w-full mt-6 py-3.5 rounded-2xl text-white text-sm font-medium transition"
              style={{ background: puedeAvanzar() ? '#d97706' : '#44403c' }}>
              Continuar →
            </button>
          </div>
        )}

        {/* ── PASO 4 — OPINIÓN FINAL ───────────────────── */}
        {paso === 4 && (
          <div>
            <p className="text-amber-400 text-xs font-medium mb-1 tracking-wider">PASO 4 · TU OPINIÓN</p>
            <h2 className="text-white font-serif text-2xl font-bold mb-1">
              Cuéntale al caficultor
            </h2>
            <p className="text-stone-400 text-sm mb-6">
              Tu opinión llega directamente a quien cultivó este café.
            </p>

            {/* ¿Lo recomendarías? */}
            <div className="mb-5">
              <p className="text-stone-400 text-xs font-medium mb-3">¿Lo recomendarías?</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value:true,  label:'Sí, sin duda', emoji:'🤩' },
                  { value:'maybe', label:'Tal vez',    emoji:'🤔' },
                  { value:false, label:'No tanto',    emoji:'😐' },
                ].map(op => (
                  <button key={String(op.value)}
                    onClick={() => setRecomendaria(op.value)}
                    className="py-3 rounded-2xl text-center transition"
                    style={{
                      background: recomendaria === op.value ? '#1D7A4E' : 'rgba(255,255,255,0.06)',
                      border: recomendaria === op.value ? '1px solid #1D7A4E' : '1px solid rgba(255,255,255,0.08)',
                    }}>
                    <div className="text-2xl mb-1">{op.emoji}</div>
                    <div className="text-xs" style={{ color: recomendaria === op.value ? 'white' : '#a8a29e' }}>
                      {op.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ¿El precio fue justo? */}
            <div className="mb-5">
              <p className="text-stone-400 text-xs font-medium mb-3">¿El precio fue justo?</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                { value:'barato', label:'💰 Barato'  },
                { value:'justo',  label:'✅ Justo'   },
                { value:'caro',   label:'💸 Caro'    },
                ].map(op => (
                  <button key={op.value}
                    onClick={() => setPrecioJusto(op.value)}
                    className="py-3 rounded-2xl text-xs font-medium transition"
                    style={{
                      background: precioJusto === op.value ? '#d97706' : 'rgba(255,255,255,0.06)',
                      color: precioJusto === op.value ? 'white' : '#a8a29e',
                      border: precioJusto === op.value ? '1px solid #d97706' : '1px solid rgba(255,255,255,0.08)',
                    }}>
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mensaje al caficultor */}
            <div className="mb-6">
              <label className="block text-stone-400 text-xs font-medium mb-2">
                Mensaje al caficultor (opcional)
              </label>
              <textarea
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                placeholder="¿Qué te gustó más? ¿Qué recuerdo te dejó este café?"
                rows={4}
                className="w-full px-4 py-3 rounded-2xl text-sm text-white placeholder-stone-600 outline-none resize-none transition"
                style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}
                onFocus={e => e.target.style.borderColor='#d97706'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm mb-4"
                style={{ background:'rgba(239,68,68,0.1)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <button
              onClick={enviarValoracion}
              disabled={enviando}
              className="w-full py-3.5 rounded-2xl text-white text-sm font-medium transition"
              style={{ background: enviando ? '#44403c' : '#1D7A4E' }}>
              {enviando ? 'Guardando tu cata...' : 'Completar cata ✨'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
