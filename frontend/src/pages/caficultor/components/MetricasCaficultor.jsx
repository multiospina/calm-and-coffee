import { Leaf, Package, Star, Coffee, MapPin, TrendingUp } from 'lucide-react';

export default function MetricasCaficultor({ data }) {
  if (!data) return null;

  const items = [
    { label:'Hectáreas',      value: data.fincas?.total_hectareas    ? `${parseFloat(data.fincas.total_hectareas).toFixed(1)} ha` : '—', color:'#3D1A5C', bg:'#F3EEF5', borde:'#D4B8E8', icon: MapPin     },
    { label:'Árboles',        value: data.fincas?.total_arboles       || '—',                                                                                                                  color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC', icon: Leaf       },
    { label:'Kg producidos',  value: data.cosechas?.kg_totales        ? `${parseInt(data.cosechas.kg_totales)} kg` : '—',                                                                      color:'#1B4F8A', bg:'#EBF2FF', borde:'#C2D6F8', icon: Package    },
    { label:'Satisfacción',   value: data.satisfaccion?.promedio      ? `${data.satisfaccion.promedio}★` : '—',                                                                               color:'#8A6200', bg:'#FFF8E1', borde:'#FFE082', icon: Star       },
    { label:'Valoraciones',   value: data.satisfaccion?.total_valoraciones || 0,                                                                                                              color:'#C0350F', bg:'#FFF0EB', borde:'#FECACA', icon: Coffee     },
    { label:'Cafeterías',     value: data.cafeterias?.total_cafeterias  || 0,                                                                                                                 color:'#6B3A8A', bg:'#F3EEF5', borde:'#D4B8E8', icon: TrendingUp },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {items.map((m,i) => (
          <div key={i} className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background:'white', border:`1.5px solid ${m.borde}` }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background:m.bg }}>
              <m.icon size={18} color={m.color} />
            </div>
            <div>
              <p className="font-serif font-bold text-2xl leading-none" style={{ color:m.color }}>
                {m.value}
              </p>
              <p className="text-stone-500 text-xs font-medium mt-1">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top cosechas */}
      {data.top_cosechas?.length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background:'white', border:'1px solid #E2E8F0' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background:'#F3EEF5' }}>
              <TrendingUp size={15} color="#6B3A8A" />
            </div>
            <p className="font-serif font-bold text-stone-800">Tus cafés más pedidos</p>
          </div>
          <div className="space-y-3">
            {data.top_cosechas.map((c,i) => (
              <div key={i} className="flex items-center gap-3 py-2"
                style={{ borderBottom: i < data.top_cosechas.length-1 ? '1px solid #F8F9FA':'none' }}>
                <span className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: i===0?'#F3EEF5':'#F8F9FA', color: i===0?'#6B3A8A':'#4A5568' }}>
                  {i+1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-700 text-sm truncate">{c.variedad}</p>
                  <p className="text-xs text-stone-400 capitalize">{c.proceso} · {c.nombre_finca}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {c.rating && (
                    <p className="text-xs font-bold" style={{ color:'#D4A847' }}>★ {c.rating}</p>
                  )}
                  <p className="text-xs text-stone-400">{c.total_pedidos} pedidos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}