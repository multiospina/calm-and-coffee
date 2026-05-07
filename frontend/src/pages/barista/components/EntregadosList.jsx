import { CheckCircle } from 'lucide-react';

export default function EntregadosList({ pedidos }) {
  if (pedidos.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center"
        style={{ background: 'white', border: '1px solid #E2E8F0' }}>
        <CheckCircle size={32} color="#E2E8F0" className="mx-auto mb-3" />
        <p className="text-stone-300 text-sm">Sin entregas aún hoy</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {pedidos.map((p, i) => (
        <div key={i} className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'white', border: '1px solid #E2E8F0' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#EDFAF4' }}>
            <CheckCircle size={16} color="#1D7A4E" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-stone-700 text-sm font-semibold truncate">{p.nombre_cafe}</p>
            <p className="text-stone-400 text-xs">{p.mesa} · {p.nombre_cliente}</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
            style={{ background: '#EDFAF4', color: '#1D7A4E' }}>
            ✓ Entregado
          </span>
        </div>
      ))}

      {/* Resumen del día */}
      <div className="rounded-2xl p-4 text-center mt-2"
        style={{ background: '#EDFAF4', border: '1px solid #A8E8CC' }}>
        <p className="font-serif font-bold text-green-700 text-lg">{pedidos.length}</p>
        <p className="text-green-600 text-xs">cafés entregados hoy ☕</p>
      </div>
    </div>
  );
}
