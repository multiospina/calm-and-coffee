import { Clock } from 'lucide-react';

const ESTADO_COLOR = {
  pendiente_pago: '#D4A847',
  pagado:         '#1B4F8A',
  en_preparacion: '#C0350F',
  listo:          '#1D7A4E',
};

export default function ProximosPedidos({ pedidos, pedidoActual }) {
  const proximos = pedidos
    .filter(p => p.id !== pedidoActual?.id)
    .slice(0, 3);

  if (proximos.length === 0) return null;

  return (
    <div className="rounded-2xl p-4"
      style={{ background:'white', border:'1px solid #E2E8F0' }}>
      <p className="text-xs font-bold text-stone-400 mb-3 tracking-wider">
        EN COLA — {proximos.length} próximo{proximos.length > 1 ? 's' : ''}
      </p>
      <div className="space-y-2">
        {proximos.map((p, i) => {
          const mins = Math.floor((new Date() - new Date(p.creado_en)) / 60000);
          const color = ESTADO_COLOR[p.estado] || '#94A3B8';
          return (
            <div key={i} className="flex items-center gap-3 py-2"
              style={{ borderBottom: i < proximos.length-1 ? '1px solid #F8F9FA' : 'none' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background:color }} />
              <div className="flex-1 min-w-0">
                <p className="text-stone-700 text-sm font-semibold truncate">{p.nombre_cafe}</p>
                <p className="text-stone-400 text-xs">{p.mesa}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Clock size={10} color="#94A3B8" />
                <span className="text-xs font-mono" style={{ color: mins >= 10 ? '#C0350F' : '#94A3B8' }}>
                  {mins}m
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}