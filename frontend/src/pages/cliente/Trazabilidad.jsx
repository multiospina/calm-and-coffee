import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../api/axios';

const ETAPA_INFO = {
  recoleccion: { emoji: '🫘', label: 'Recolección',  color: '#6B3A8A' },
  beneficio:   { emoji: '💧', label: 'Beneficio',    color: '#1B4F8A' },
  secado:      { emoji: '☀️', label: 'Secado',       color: '#D4A847' },
  tostion:     { emoji: '🔥', label: 'Tostión',      color: '#C0350F' },
  despacho:    { emoji: '📦', label: 'Despacho',     color: '#1D7A4E' },
  cultivo:     { emoji: '🌱', label: 'Cultivo',      color: '#259E65' },
  floracion:   { emoji: '🌸', label: 'Floración',    color: '#9B6FB3' },
  maduracion:  { emoji: '🍒', label: 'Maduración',   color: '#C47A45' },
};

export default function Trazabilidad() {
  const { qr }   = useParams();
  const navigate = useNavigate();
  const [data,     setData]     = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get(`/cliente/trazabilidad/${qr}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'QR no encontrado');
      } finally {
        setCargando(false);
      }
    };
    if (qr) cargar();
  }, [qr]);

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c0a08' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-stone-400 text-sm">Cargando historia del café...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c0a08' }}>
      <div className="text-center px-6">
        <div className="text-5xl mb-4">☕</div>
        <h2 className="text-white font-serif text-xl mb-2">QR no encontrado</h2>
        <p className="text-stone-400 text-sm mb-6">{error}</p>
        <button onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: '#92400e' }}>
          Ir al inicio
        </button>
      </div>
    </div>
  );

  if (!data) return null;

  const { cosecha, finca, caficultor, lote, etapas, catacion, valoraciones } = data;

  return (
    <div className="min-h-screen" style={{ background: '#0c0a08' }}>

      {/* Header */}
      <div className="px-5 pt-8 pb-6" style={{ background: 'linear-gradient(180deg, #1a0a2a 0%, #0c0a08 100%)' }}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#92400e' }}>
              <span className="text-white font-serif font-bold text-xs">C</span>
            </div>
            <span className="text-white font-serif text-sm">Calm and Coffee</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-amber-400 text-xs font-medium mb-1 tracking-wider">TRAZABILIDAD VERIFICADA</p>
              <h1 className="text-white font-serif text-3xl font-bold">{cosecha.variedad}</h1>
              <p className="text-stone-400 text-sm mt-1 capitalize">{cosecha.proceso} · {finca.nombre}</p>
            </div>
            {catacion && (
              <div className="text-center px-4 py-3 rounded-2xl" style={{ background: 'rgba(212,168,71,0.15)', border: '1px solid rgba(212,168,71,0.3)' }}>
                <div className="text-amber-400 font-serif text-2xl font-bold">{catacion.puntaje_total}</div>
                <div className="text-amber-600 text-xs">SCA</div>
              </div>
            )}
          </div>

          {/* Notas de sabor */}
          {catacion?.notas_sabor && (
            <div className="flex flex-wrap gap-2 mt-4">
              {catacion.notas_sabor.map((n, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-full capitalize"
                  style={{ background: 'rgba(212,168,71,0.15)', color: '#d97706', border: '1px solid rgba(212,168,71,0.2)' }}>
                  {n}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pb-10 space-y-5">

        {/* El caficultor */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-stone-500 text-xs font-medium mb-3 tracking-wider">EL CAFICULTOR</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#3D1A5C' }}>
              <span className="text-white font-serif font-bold text-lg">
                {caficultor.nombre.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-white font-semibold">{caficultor.nombre}</h3>
              <p className="text-stone-400 text-sm">{finca.municipio}, {finca.departamento}</p>
              <p className="text-stone-500 text-xs mt-0.5">{finca.altitud_msnm} msnm</p>
            </div>
          </div>
          {finca.historia && (
            <p className="text-stone-400 text-sm mt-4 leading-relaxed italic border-l-2 border-purple-800 pl-3">
              {finca.historia}
            </p>
          )}
        </div>

        {/* El lote */}
        {lote && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-stone-500 text-xs font-medium mb-3 tracking-wider">LA SIEMBRA</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌱</span>
              <div>
                <p className="text-white font-medium">{lote.nombre}</p>
                <p className="text-stone-400 text-sm">{lote.narrativa}</p>
              </div>
            </div>
            {lote.notas_siembra && (
              <p className="text-stone-500 text-xs mt-3 leading-relaxed">{lote.notas_siembra}</p>
            )}
          </div>
        )}

        {/* Línea de tiempo — etapas */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-stone-500 text-xs font-medium mb-4 tracking-wider">EL VIAJE DEL CAFÉ</p>
          <div className="space-y-4">
            {etapas.map((e, i) => {
              const info = ETAPA_INFO[e.tipo_etapa] || { emoji: '📋', label: e.tipo_etapa, color: '#6B7280' };
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${info.color}22`, border: `1px solid ${info.color}44` }}>
                      <span className="text-base">{info.emoji}</span>
                    </div>
                    {i < etapas.length - 1 && (
                      <div className="w-0.5 h-4 mt-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-sm font-medium">{info.label}</span>
                      <span className="text-stone-600 text-xs">
                        {new Date(e.fecha).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                    <p className="text-stone-400 text-xs leading-relaxed">{e.descripcion}</p>
                    {e.datos_extra && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {Object.entries(e.datos_extra).slice(0, 3).map(([k, v]) => (
                          <span key={k} className="text-xs px-2 py-0.5 rounded-lg"
                            style={{ background: 'rgba(255,255,255,0.06)', color: '#a8a29e' }}>
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Catación SCA */}
        {catacion && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(212,168,71,0.06)', border: '1px solid rgba(212,168,71,0.2)' }}>
            <p className="text-amber-600 text-xs font-medium mb-4 tracking-wider">CATACIÓN PROFESIONAL SCA</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Fragancia', value: catacion.fragancia_aroma },
                { label: 'Sabor',     value: catacion.sabor },
                { label: 'Acidez',    value: catacion.acidez },
                { label: 'Cuerpo',    value: catacion.cuerpo },
                { label: 'Balance',   value: catacion.balance },
                { label: 'Dulzor',    value: catacion.dulzor },
              ].map((m, i) => (
                <div key={i} className="text-center p-2 rounded-xl"
                  style={{ background: 'rgba(212,168,71,0.08)' }}>
                  <div className="text-amber-400 font-bold text-lg">{parseFloat(m.value).toFixed(1)}</div>
                  <div className="text-amber-700 text-xs">{m.label}</div>
                </div>
              ))}
            </div>
            {catacion.notas_narrativas && (
              <p className="text-amber-200 text-xs leading-relaxed italic">{catacion.notas_narrativas}</p>
            )}
          </div>
        )}

        {/* Valoraciones */}
        {valoraciones?.total_valoraciones > 0 && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-stone-500 text-xs font-medium mb-4 tracking-wider">LO QUE DICEN OTROS</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Aroma',      value: valoraciones.avg_aroma },
                { label: 'Sabor',      value: valoraciones.avg_sabor },
                { label: 'Cuerpo',     value: valoraciones.avg_cuerpo },
                { label: 'Experiencia',value: valoraciones.avg_experiencia },
              ].map((v, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <span className="text-stone-400 text-xs">{v.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400 text-sm">{'★'.repeat(Math.round(v.value))}</span>
                    <span className="text-stone-500 text-xs">{v.value}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-stone-600 text-xs text-center mt-3">
              {valoraciones.total_valoraciones} valoración{valoraciones.total_valoraciones > 1 ? 'es' : ''}
            </p>
          </div>
        )}

        {/* QR de la cosecha */}
        <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-stone-500 text-xs font-medium mb-4 tracking-wider">CÓDIGO DE TRAZABILIDAD</p>
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-white rounded-2xl">
              <QRCodeSVG
                value={`${window.location.origin}/trazabilidad/${cosecha.qr_codigo}`}
                size={140}
                bgColor="#ffffff"
                fgColor="#0c0a08"
                level="M"
              />
            </div>
          </div>
          <p className="text-stone-400 font-mono text-xs">{cosecha.qr_codigo}</p>
        </div>

        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 rounded-2xl text-stone-400 text-sm transition hover:text-white"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          ← Volver
        </button>
      </div>
    </div>
  );
}
