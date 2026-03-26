import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Sun, Moon, Sunset } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const SABORES = [
  { id:'floral',    emoji:'🌸', label:'Floral',    desc:'Jazmín, rosa, azahar'       },
  { id:'frutal',    emoji:'🍑', label:'Frutal',    desc:'Durazno, mango, maracuyá'   },
  { id:'citrico',   emoji:'🍋', label:'Cítrico',   desc:'Limón, naranja, bergamota'  },
  { id:'miel',      emoji:'🍯', label:'Dulce',     desc:'Miel, caramelo, panela'     },
  { id:'chocolate', emoji:'🍫', label:'Chocolate', desc:'Cacao, avellana, nuez'      },
  { id:'especias',  emoji:'🌿', label:'Herbal',    desc:'Canela, menta, hierba'      },
];

const INTENSIDADES = [
  { id:'suave',             label:'Suave',              desc:'Delicado y ligero en boca',          icon:'💧' },
  { id:'equilibrado',       label:'Equilibrado',        desc:'Balance perfecto entre sabores',     icon:'⚖️' },
  { id:'medio_pronunciado', label:'Medio pronunciado',  desc:'Con carácter y personalidad',       icon:'☕' },
  { id:'intenso',           label:'Intenso',            desc:'Robusto, profundo e impactante',    icon:'🔥' },
];

const MOMENTOS = [
  { id:'manana',    icon: Sun,     label:'Mañana',    desc:'Para arrancar el día'      },
  { id:'tarde',     icon: Coffee,  label:'Tarde',     desc:'Como pausa del trabajo'    },
  { id:'noche',     icon: Moon,    label:'Noche',     desc:'Para relajarme'            },
  { id:'siempre',   icon: Sunset,  label:'Siempre',   desc:'A cualquier hora'          },
];

export default function Onboarding() {
  const navigate   = useNavigate();
  const { usuario, login } = useAuth();
  const [paso, setPaso]           = useState(1);
  const [sabores, setSabores]     = useState([]);
  const [intensidad, setIntensidad] = useState('');
  const [momentos, setMomentos]   = useState([]);
  const [enviando, setEnviando]   = useState(false);
  const [error, setError]         = useState('');

  const toggleSabor = (id) => {
    setSabores(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const toggleMomento = (id) => {
    setMomentos(prev =>
      prev.includes(id)
        ? prev.filter(m => m !== id)
        : [...prev, id]
    );
  };

  const completar = async () => {
    if (!intensidad) { setError('Selecciona una intensidad'); return; }
    setEnviando(true);
    setError('');
    try {
      await api.post('/cliente/cuestionario/completar', {
        sabores_favoritos:  sabores,
        intensidad,
        momentos_favoritos: momentos,
      });
      navigate('/cliente', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar preferencias');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background:'#FAF6F0' }}>

      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between"
        style={{ background:'white', borderBottom:'1px solid #E8D9B8' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:'#92400e' }}>
            <Coffee size={16} color="white" />
          </div>
          <span className="font-serif text-stone-800 font-semibold">Calm and Coffee</span>
        </div>
        <span className="text-stone-400 text-sm">{paso} de 3</span>
      </div>

      {/* Barra de progreso */}
      <div className="h-1" style={{ background:'#E8D9B8' }}>
        <div className="h-1 transition-all duration-500"
          style={{ background:'linear-gradient(90deg, #92400e, #C47A45)', width:`${(paso/3)*100}%` }} />
      </div>

      <div className="max-w-lg mx-auto px-5 py-10">

        {/* ── PASO 1 — SABORES ── */}
        {paso === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🌸</div>
              <h1 className="font-serif text-2xl font-bold text-stone-800 mb-2">
                ¿Qué sabores te emocionan?
              </h1>
              <p className="text-stone-400 text-sm">
                Selecciona hasta 3 notas que más disfrutas en un café
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {SABORES.map(s => (
                <button key={s.id}
                  onClick={() => toggleSabor(s.id)}
                  className="p-4 rounded-2xl text-left transition-all"
                  style={{
                    background:   sabores.includes(s.id) ? 'white'    : 'white',
                    border:       sabores.includes(s.id) ? '2px solid #92400e' : '1.5px solid #E8D9B8',
                    boxShadow:    sabores.includes(s.id) ? '0 4px 15px rgba(146,64,14,0.15)' : 'none',
                    transform:    sabores.includes(s.id) ? 'scale(1.02)' : 'scale(1)',
                  }}>
                  <div className="text-2xl mb-2">{s.emoji}</div>
                  <div className="font-semibold text-stone-800 text-sm mb-0.5">{s.label}</div>
                  <div className="text-stone-400 text-xs">{s.desc}</div>
                  {sabores.includes(s.id) && (
                    <div className="mt-2 flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ background:'#92400e' }} />
                      <span className="text-xs font-medium" style={{ color:'#92400e' }}>Seleccionado</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {sabores.length > 0 && (
              <div className="text-center mb-4">
                <span className="text-xs text-stone-400">
                  {sabores.length} de 3 seleccionados
                </span>
              </div>
            )}

            <button
              onClick={() => setPaso(2)}
              disabled={sabores.length === 0}
              className="w-full py-3.5 rounded-2xl text-white text-sm font-medium transition-all"
              style={{ background: sabores.length > 0 ? 'linear-gradient(135deg, #92400e, #C47A45)' : '#D4B896' }}>
              Continuar →
            </button>
          </div>
        )}

        {/* ── PASO 2 — INTENSIDAD ── */}
        {paso === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">☕</div>
              <h1 className="font-serif text-2xl font-bold text-stone-800 mb-2">
                ¿Qué tan intenso lo prefieres?
              </h1>
              <p className="text-stone-400 text-sm">
                Esto nos ayuda a recomendarte el proceso perfecto para ti
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {INTENSIDADES.map(i => (
                <button key={i.id}
                  onClick={() => setIntensidad(i.id)}
                  className="w-full p-5 rounded-2xl text-left transition-all flex items-center gap-4"
                  style={{
                    background: intensidad === i.id ? 'white' : 'white',
                    border:     intensidad === i.id ? '2px solid #92400e' : '1.5px solid #E8D9B8',
                    boxShadow:  intensidad === i.id ? '0 4px 15px rgba(146,64,14,0.15)' : 'none',
                  }}>
                  <div className="text-3xl flex-shrink-0">{i.icon}</div>
                  <div className="flex-1">
                    <div className="font-serif font-bold text-stone-800 mb-0.5">{i.label}</div>
                    <div className="text-stone-400 text-sm">{i.desc}</div>
                  </div>
                  {intensidad === i.id && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background:'#92400e' }}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setPaso(1)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-stone-500"
                style={{ background:'white', border:'1.5px solid #E8D9B8' }}>
                ← Atrás
              </button>
              <button onClick={() => setPaso(3)}
                disabled={!intensidad}
                className="flex-1 py-3.5 rounded-2xl text-white text-sm font-medium"
                style={{ background: intensidad ? 'linear-gradient(135deg, #92400e, #C47A45)' : '#D4B896' }}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 3 — MOMENTOS ── */}
        {paso === 3 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">✨</div>
              <h1 className="font-serif text-2xl font-bold text-stone-800 mb-2">
                ¿Cuándo disfrutas más el café?
              </h1>
              <p className="text-stone-400 text-sm">
                Puedes seleccionar varios momentos del día
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {MOMENTOS.map(m => (
                <button key={m.id}
                  onClick={() => toggleMomento(m.id)}
                  className="p-5 rounded-2xl text-center transition-all"
                  style={{
                    background: momentos.includes(m.id) ? 'white' : 'white',
                    border:     momentos.includes(m.id) ? '2px solid #92400e' : '1.5px solid #E8D9B8',
                    boxShadow:  momentos.includes(m.id) ? '0 4px 15px rgba(146,64,14,0.15)' : 'none',
                    transform:  momentos.includes(m.id) ? 'scale(1.02)' : 'scale(1)',
                  }}>
                  <div className="flex justify-center mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: momentos.includes(m.id) ? '#92400e' : '#FAF6F0' }}>
                      <m.icon size={18} color={momentos.includes(m.id) ? 'white' : '#92400e'} />
                    </div>
                  </div>
                  <div className="font-serif font-bold text-stone-800 text-sm mb-0.5">{m.label}</div>
                  <div className="text-stone-400 text-xs">{m.desc}</div>
                </button>
              ))}
            </div>

            {/* Resumen de preferencias */}
            <div className="rounded-2xl p-4 mb-5"
              style={{ background:'white', border:'1.5px solid #E8D9B8' }}>
              <p className="text-stone-400 text-xs font-medium mb-3 tracking-wider">TU PERFIL CAFETERO</p>
              <div className="flex flex-wrap gap-2">
                {sabores.map(s => {
                  const info = SABORES.find(x => x.id === s);
                  return (
                    <span key={s} className="text-xs px-3 py-1 rounded-full"
                      style={{ background:'#FAF6F0', color:'#92400e', border:'1px solid #E8D9B8' }}>
                      {info?.emoji} {info?.label}
                    </span>
                  );
                })}
                {intensidad && (
                  <span className="text-xs px-3 py-1 rounded-full"
                    style={{ background:'#FAF6F0', color:'#5C3D2E', border:'1px solid #E8D9B8' }}>
                    ☕ {INTENSIDADES.find(i => i.id === intensidad)?.label}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-2xl text-sm mb-4"
                style={{ background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626' }}>
                ⚠ {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setPaso(2)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-stone-500"
                style={{ background:'white', border:'1.5px solid #E8D9B8' }}>
                ← Atrás
              </button>
              <button onClick={completar}
                disabled={enviando}
                className="flex-1 py-3.5 rounded-2xl text-white text-sm font-medium"
                style={{ background: enviando ? '#D4B896' : 'linear-gradient(135deg, #1D7A4E, #0F4A2E)' }}>
                {enviando ? 'Guardando...' : 'Empezar experiencia ✨'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}