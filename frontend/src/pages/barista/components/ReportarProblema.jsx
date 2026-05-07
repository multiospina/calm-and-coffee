import { useState } from 'react';
import { X, AlertCircle, Coffee, User, FileX, HelpCircle } from 'lucide-react';
import api from '../../../api/axios';

const MOTIVOS = [
  { id:'cafe_agotado',          label:'Café agotado',            desc:'No hay stock disponible',        icon: Coffee,       color:'#D4A847', bg:'#FFF8E1' },
  { id:'cliente_no_encontrado', label:'Cliente no encontrado',   desc:'El cliente no está en la mesa',  icon: User,         color:'#1B4F8A', bg:'#EBF2FF' },
  { id:'error_pedido',          label:'Error en el pedido',      desc:'Pedido incorrecto o duplicado',  icon: FileX,        color:'#6B3A8A', bg:'#F3EEF5' },
  { id:'otro',                  label:'Otro motivo',             desc:'Especifica el detalle abajo',    icon: HelpCircle,   color:'#4A5568', bg:'#F8F9FA' },
];

export default function ReportarProblema({ pedido, onCerrar, onReportado }) {
  const [motivo,    setMotivo]    = useState('');
  const [detalle,   setDetalle]   = useState('');
  const [enviando,  setEnviando]  = useState(false);
  const [error,     setError]     = useState('');

  const handleReportar = async () => {
    if (!motivo) { setError('Selecciona un motivo'); return; }
    setEnviando(true);
    setError('');
    try {
      await api.post(`/barista/pedidos/${pedido.id}/reportar`, { motivo, detalle });
      onReportado && onReportado();
      onCerrar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al reportar');
    } finally {
      setEnviando(false);
    }
  };

  if (!pedido) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>

      <div className="w-full max-w-sm rounded-3xl overflow-hidden animate-slide-up"
        style={{ background:'white', boxShadow:'0 32px 80px rgba(0,0,0,0.25)' }}>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between"
          style={{ background:'#FEF2F2', borderBottom:'1px solid #FECACA' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background:'#FEE2E2' }}>
              <AlertCircle size={18} color="#C0350F" />
            </div>
            <div>
              <p className="font-serif font-bold text-stone-800">Reportar problema</p>
              <p className="text-xs text-stone-400">{pedido.nombre_cafe} · {pedido.mesa}</p>
            </div>
          </div>
          <button onClick={onCerrar}
            className="p-2 rounded-xl"
            style={{ background:'rgba(192,53,15,0.1)', color:'#C0350F' }}>
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs font-bold text-stone-400 tracking-wider">
            SELECCIONA EL MOTIVO
          </p>

          {/* Opciones de motivo */}
          <div className="space-y-2">
            {MOTIVOS.map(m => (
              <button key={m.id}
                onClick={() => setMotivo(m.id)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all"
                style={{
                  background: motivo === m.id ? m.bg : '#F8F9FA',
                  border:     motivo === m.id ? `1.5px solid ${m.color}` : '1.5px solid transparent',
                  transform:  motivo === m.id ? 'scale(1.01)' : 'scale(1)',
                }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: motivo === m.id ? `${m.color}20` : '#E2E8F0' }}>
                  <m.icon size={16} color={motivo === m.id ? m.color : '#94A3B8'} />
                </div>
                <div>
                  <p className="text-sm font-semibold"
                    style={{ color: motivo === m.id ? m.color : '#4A5568' }}>
                    {m.label}
                  </p>
                  <p className="text-xs text-stone-400">{m.desc}</p>
                </div>
                {motivo === m.id && (
                  <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: m.color }}>
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Detalle adicional */}
          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1.5">
              Detalle adicional (opcional)
            </label>
            <textarea
              value={detalle}
              onChange={e => setDetalle(e.target.value)}
              placeholder="Describe brevemente el problema..."
              rows={2}
              className="w-full px-4 py-3 rounded-2xl text-sm text-stone-700 placeholder-stone-300 outline-none resize-none"
              style={{ background:'#F8F9FA', border:'1.5px solid #E2E8F0' }}
              onFocus={e => e.target.style.borderColor='#C0350F'}
              onBlur={e => e.target.style.borderColor='#E2E8F0'}
            />
          </div>

          {/* Advertencia */}
          <div className="rounded-xl p-3 flex items-start gap-2"
            style={{ background:'#FFF8E1', border:'1px solid #FFE082' }}>
            <AlertCircle size={13} color="#D4A847" className="flex-shrink-0 mt-0.5" />
            <p className="text-xs" style={{ color:'#8A6200' }}>
              El pedido será cancelado automáticamente y el cliente será notificado.
            </p>
          </div>

          {error && (
            <p className="text-xs text-center font-medium" style={{ color:'#C0350F' }}>
              {error}
            </p>
          )}

          {/* Botones */}
          <div className="flex gap-2 pt-1">
            <button onClick={onCerrar}
              className="flex-1 py-3 rounded-2xl text-sm font-medium text-stone-400"
              style={{ background:'#F8F9FA', border:'1px solid #E2E8F0' }}>
              Cancelar
            </button>
            <button onClick={handleReportar}
              disabled={!motivo || enviando}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition"
              style={{ background: !motivo || enviando ? '#CBD5E0' : '#C0350F' }}>
              {enviando ? 'Reportando...' : 'Confirmar reporte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}