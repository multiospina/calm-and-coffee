import { Coffee, CheckCircle, Clock, Package } from 'lucide-react';

export default function MetricasGrid({ metricas, compacto = false }) {
  if (!metricas) return null;

  // Filtrar tiempo promedio incorrecto (pedidos de prueba)
  const tiempoPromedio = metricas.tiempo_promedio_min && metricas.tiempo_promedio_min < 300
    ? `${metricas.tiempo_promedio_min} min`
    : '—';

  const items = [
    { label:'Pedidos hoy',  value: metricas.total_pedidos_hoy  || 0,                    color:'#C0350F', bg:'#FFF0EB', icon: Package,     sub:'total del turno'   },
    { label:'Entregados',   value: metricas.entregados          || 0,                    color:'#1D7A4E', bg:'#EDFAF4', icon: CheckCircle, sub:'completados hoy'   },
    { label:'Satisfacción', value: metricas.satisfaccion_promedio ? `${metricas.satisfaccion_promedio} ★` : '—', color:'#8A6200', bg:'#FFF8E1', icon: Coffee, sub:'promedio clientes' },
    { label:'T. promedio',  value: tiempoPromedio,                                       color:'#1B4F8A', bg:'#EBF2FF', icon: Clock,       sub:'por pedido'        },
  ];

  if (compacto) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {items.map((m, i) => (
          <div key={i} className="rounded-xl p-2.5 text-center"
            style={{ background:'white', border:'1px solid #E2E8F0' }}>
            <p className="font-serif font-bold text-lg leading-none" style={{ color:m.color }}>
              {m.value}
            </p>
            <p className="text-stone-400 text-xs mt-1 leading-tight">{m.label}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((m, i) => (
        <div key={i} className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background:'white', border:'1px solid #E2E8F0' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background:m.bg }}>
            <m.icon size={20} color={m.color} />
          </div>
          <div>
            <p className="font-serif font-bold text-2xl leading-none" style={{ color:m.color }}>
              {m.value}
            </p>
            <p className="text-stone-600 text-xs font-medium mt-1">{m.label}</p>
            <p className="text-stone-300 text-xs">{m.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}