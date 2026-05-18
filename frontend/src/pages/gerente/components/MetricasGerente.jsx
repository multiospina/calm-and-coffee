import { ShoppingBag, CheckCircle, DollarSign, Star, Users, TrendingUp } from 'lucide-react';

export default function MetricasGerente({ metricas }) {
  if (!metricas) return null;

  const items = [
    { label:'Total pedidos',    value: metricas.total_pedidos        || 0,   color:'#1B4F8A', bg:'#EBF2FF', borde:'#C2D6F8', icon: ShoppingBag,  sub:'registrados'       },
    { label:'Entregados',       value: metricas.pedidos_entregados   || 0,   color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC', icon: CheckCircle,  sub:'completados'       },
    { label:'Ingresos totales', value: `$${parseInt(metricas.ingresos_totales||0).toLocaleString('es-CO')}`, color:'#8A6200', bg:'#FFF8E1', borde:'#FFE082', icon: DollarSign, sub:'acumulados' },
    { label:'Satisfacción',     value: metricas.satisfaccion_promedio ? `${metricas.satisfaccion_promedio}★` : '—', color:'#C0350F', bg:'#FFF0EB', borde:'#FECACA', icon: Star, sub:'promedio clientes' },
    { label:'Clientes únicos',  value: metricas.clientes_unicos      || 0,   color:'#6B3A8A', bg:'#F3EEF5', borde:'#D4B8E8', icon: Users,        sub:'visitantes'        },
    { label:'Tasa entrega',     value: metricas.total_pedidos > 0 ? `${Math.round((metricas.pedidos_entregados/metricas.total_pedidos)*100)}%` : '—', color:'#2D3748', bg:'#F1F0EE', borde:'#E2E8F0', icon: TrendingUp, sub:'de pedidos' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {items.map((m, i) => (
        <div key={i} className="rounded-2xl p-4"
          style={{ background:'white', border:`1.5px solid ${m.borde}`, boxShadow:'0 1px 8px rgba(0,0,0,0.04)' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background:m.bg }}>
              <m.icon size={16} color={m.color} />
            </div>
          </div>
          <p className="font-serif font-bold text-2xl leading-none mb-1" style={{ color:m.color }}>
            {m.value}
          </p>
          <p className="text-stone-600 text-xs font-medium">{m.label}</p>
          <p className="text-stone-300 text-xs mt-0.5">{m.sub}</p>
        </div>
      ))}
    </div>
  );
}