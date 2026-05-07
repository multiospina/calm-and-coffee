import { useState, useEffect } from 'react';
import { Coffee, ChevronRight, User, Flame, AlertCircle } from 'lucide-react';
import ReportarProblema from './ReportarProblema';

const ESTADOS = ['pendiente_pago', 'pagado', 'en_preparacion', 'listo', 'entregado'];

const ESTADO_INFO = {
  pendiente_pago: { label: 'Pendiente pago', color: '#D4A847', bg: '#FFF8E1' },
  pagado:         { label: 'Pagado',          color: '#1B4F8A', bg: '#EBF2FF' },
  en_preparacion: { label: 'Preparando',      color: '#C0350F', bg: '#FFF0EB' },
  listo:          { label: 'Listo ✓',         color: '#1D7A4E', bg: '#EDFAF4' },
  entregado:      { label: 'Entregado',        color: '#94A3B8', bg: '#F8F9FA' },
};

const ESTADO_ACCION = {
  pendiente_pago: 'Confirmar pago',
  pagado:         'Iniciar preparación',
  en_preparacion: 'Marcar como listo',
  listo:          'Confirmar entrega',
};

function TimerVivo({ fecha }) {
  const [mins, setMins] = useState(0);
  const [segs, setSegs] = useState(0);

  useEffect(() => {
    const calc = () => {
      const diff = Math.floor((new Date() - new Date(fecha)) / 1000);
      setMins(Math.floor(diff / 60));
      setSegs(diff % 60);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [fecha]);

  const urgente = mins >= 10;
  return (
    <span className="font-mono text-sm font-bold"
      style={{ color: urgente ? '#C0350F' : '#94A3B8' }}>
      {String(mins).padStart(2, '0')}:{String(segs).padStart(2, '0')}
      {urgente && ' ⚠'}
    </span>
  );
}

export default function PedidoCard({ pedido, onAvanzar, onVerPerfil, actualizando, onReportado }) {
  const [mostrarReporte, setMostrarReporte] = useState(false);

  const p       = pedido;
  const est     = ESTADO_INFO[p.estado] || ESTADO_INFO.pendiente_pago;
  const idx     = ESTADOS.indexOf(p.estado);
  const sig     = ESTADOS[idx + 1];
  const mins    = Math.floor((new Date() - new Date(p.creado_en)) / 60000);
  const urgente = mins >= 10 && p.estado !== 'listo';
  const progreso = Math.min((idx / 3) * 100, 100);

  return (
    <>
      <div className="rounded-2xl overflow-hidden transition-all"
        style={{
          background: 'white',
          border: `1.5px solid ${urgente ? '#FECACA' : '#E2E8F0'}`,
          boxShadow: urgente ? '0 0 0 3px rgba(254,202,202,0.3)' : '0 1px 8px rgba(0,0,0,0.04)',
        }}>

        {/* Barra progreso */}
        <div className="h-1.5" style={{ background: '#F8F9FA' }}>
          <div className="h-1.5 transition-all duration-700"
            style={{ width: `${progreso}%`, background: urgente ? '#C0350F' : '#1D7A4E' }} />
        </div>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-3">
              <button
                onClick={() => onVerPerfil && onVerPerfil(p)}
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition hover:opacity-80"
                style={{ background: urgente ? '#FFF0EB' : est.bg }}>
                {urgente ? <Flame size={22} color="#C0350F" /> : <Coffee size={22} color={est.color} />}
              </button>
              <div>
                <h3 className="font-serif font-bold text-stone-800 text-lg leading-tight">
                  {p.nombre_cafe}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: '#F1F0EE', color: '#4A5568' }}>
                    {p.mesa}
                  </span>
                  {p.nombre_cliente && (
                    <button
                      onClick={() => onVerPerfil && onVerPerfil(p)}
                      className="flex items-center gap-1 hover:opacity-70 transition">
                      <User size={11} color="#CBD5E0" />
                      <span className="text-xs text-stone-400 underline decoration-dotted">
                        {p.nombre_cliente}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xs px-2.5 py-1 rounded-full font-medium block mb-1"
                style={{ background: est.bg, color: est.color }}>
                {est.label}
              </span>
              <TimerVivo fecha={p.creado_en} />
            </div>
          </div>

          {/* Tags café */}
          {(p.variedad || p.proceso) && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {p.variedad && (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: '#F3EEF5', color: '#6B3A8A' }}>
                  {p.variedad}
                </span>
              )}
              {p.proceso && (
                <span className="text-xs px-2.5 py-1 rounded-full capitalize font-medium"
                  style={{ background: '#EBF2FF', color: '#1B4F8A' }}>
                  {p.proceso}
                </span>
              )}
            </div>
          )}

          {/* Notas */}
          {p.notas_cliente && (
            <div className="px-4 py-3 rounded-xl mb-4"
              style={{ background: '#FFF8E1', border: '1px solid #FFE082' }}>
              <p className="text-xs text-amber-700 italic">
                {p.notas_cliente}
              </p>
            </div>
          )}

          {/* Pasos */}
          <div className="flex items-start gap-1 mb-4">
            {['Pago', 'Preparando', 'Listo', 'Entregado'].map((paso, i) => (
              <div key={i} className="flex items-center gap-1 flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1"
                    style={{
                      background: idx > i + 1 ? '#1D7A4E' : idx === i + 1 ? est.color : '#F1F0EE',
                      color: idx >= i + 1 ? 'white' : '#CBD5E0',
                    }}>
                    {idx > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className="text-center leading-tight"
                    style={{ color: idx >= i + 1 ? '#4A5568' : '#CBD5E0', fontSize: '9px' }}>
                    {paso}
                  </span>
                </div>
                {i < 3 && (
                  <div className="h-0.5 flex-1 mb-4"
                    style={{ background: idx > i + 1 ? '#1D7A4E' : '#F1F0EE' }} />
                )}
              </div>
            ))}
          </div>

          {/* Botón reportar problema */}
          <button
            onClick={() => setMostrarReporte(true)}
            className="w-full py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 mb-2 transition"
            style={{ background: '#FEF2F2', color: '#C0350F', border: '1px solid #FECACA' }}>
            <AlertCircle size={12} />
            Reportar problema
          </button>

          {/* Botón acción principal */}
          {sig && ESTADO_ACCION[p.estado] && (
            <button
              onClick={() => onAvanzar(p.id, p.estado)}
              disabled={actualizando === p.id}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition"
              style={{ background: actualizando === p.id ? '#CBD5E0' : urgente ? '#C0350F' : '#1A202C' }}>
              {actualizando === p.id ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {ESTADO_ACCION[p.estado]}
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Modal reporte */}
      {mostrarReporte && (
        <ReportarProblema
          pedido={p}
          onCerrar={() => setMostrarReporte(false)}
          onReportado={() => {
            setMostrarReporte(false);
            onReportado && onReportado();
          }}
        />
      )}
    </>
  );
}