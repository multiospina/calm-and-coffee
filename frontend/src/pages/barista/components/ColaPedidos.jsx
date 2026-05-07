import { Coffee } from 'lucide-react';
import PedidoCard from './PedidoCard';

export default function ColaPedidos({ pedidos, onAvanzar, onVerPerfil, actualizando, onReportado }) {
  if (pedidos.length === 0) {
    return (
      <div className="rounded-2xl py-14 text-center"
        style={{ background: 'white', border: '1px solid #E2E8F0' }}>
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
          style={{ background: '#FFF0EB' }}>
          <Coffee size={28} color="#E8C4B8" />
        </div>
        <p className="font-serif font-semibold text-stone-500 mb-2 text-lg">
          Todo tranquilo
        </p>
        <p className="text-stone-300 text-sm mb-5">
          Los pedidos aparecerán aquí en tiempo real
        </p>
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: '#E8D9B8', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pedidos.map(p => (
        <PedidoCard
          key={p.id}
          pedido={p}
          onAvanzar={onAvanzar}
          onVerPerfil={onVerPerfil}
          actualizando={actualizando}
          onReportado={onReportado}
        />
      ))}
    </div>
  );
}