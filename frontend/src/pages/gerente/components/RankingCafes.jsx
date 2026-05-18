import { TrendingUp, Star } from 'lucide-react';

export default function RankingCafes({ topCafes }) {
  if (!topCafes || topCafes.length === 0) return null;

  const maxPedidos = Math.max(...topCafes.map(c => parseInt(c.total_pedidos) || 0));

  return (
    <div className="rounded-2xl p-5"
      style={{ background:'white', border:'1px solid #E2E8F0' }}>

      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background:'#EBF2FF' }}>
          <TrendingUp size={15} color="#1B4F8A" />
        </div>
        <h2 className="font-serif font-bold text-stone-800">Cafés más pedidos</h2>
      </div>

      <div className="space-y-4">
        {topCafes.map((c, i) => {
          const pct = maxPedidos > 0 ? (parseInt(c.total_pedidos) / maxPedidos) * 100 : 0;
          const colores = ['#1B4F8A','#1D7A4E','#6B3A8A','#C0350F','#8A6200'];
          const color = colores[i] || colores[0];

          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background:`${color}15`, color }}>
                    {i+1}
                  </span>
                  <p className="text-stone-700 text-sm font-medium">{c.nombre}</p>
                </div>
                <div className="flex items-center gap-2">
                  {c.rating && (
                    <div className="flex items-center gap-0.5">
                      <Star size={11} color="#D4A847" fill="#D4A847" />
                      <span className="text-xs font-medium" style={{ color:'#8A6200' }}>{c.rating}</span>
                    </div>
                  )}
                  <span className="text-xs font-bold" style={{ color }}>
                    {c.total_pedidos} pedidos
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background:'#F8F9FA' }}>
                <div className="h-2 rounded-full transition-all duration-700"
                  style={{ width:`${pct}%`, background:color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}