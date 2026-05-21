import { ClipboardList, Clock, Star, Award, TrendingUp } from 'lucide-react';

export default function InicioCatador({ data, usuario, onTabChange }) {
  return (
    <div className="space-y-4">

      {/* Hero */}
      <div className="rounded-3xl overflow-hidden relative"
        style={{
          background:'linear-gradient(135deg, #5C4000 0%, #8A6200 60%, #B8860B 100%)',
          boxShadow:'0 8px 32px rgba(138,98,0,0.4)'
        }}>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
          style={{ background:'white', transform:'translate(30%,-30%)' }} />
        <div className="p-6 relative">
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} color="rgba(255,255,255,0.6)" />
            <span className="text-xs font-medium" style={{ color:'rgba(255,255,255,0.6)' }}>
              Panel del Catador SCA
            </span>
          </div>
          <h1 className="font-serif text-white text-2xl font-bold mb-1">
            Hola, {usuario?.nombre?.split(' ')[0]}
          </h1>
          <p className="text-sm mb-5" style={{ color:'rgba(255,255,255,0.6)' }}>
            Evalúa cosechas con el protocolo SCA
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:'Cataciones realizadas', value: data?.stats?.total_cataciones   || 0 },
              { label:'Puntaje promedio',       value: data?.stats?.promedio_puntaje   ? `${data.stats.promedio_puntaje}/100` : '—' },
            ].map((s,i) => (
              <div key={i} className="rounded-2xl p-3 text-center"
                style={{ background:'rgba(255,255,255,0.12)' }}>
                <p className="font-serif font-bold text-white text-2xl">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.5)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Protocolo SCA */}
      <div className="rounded-2xl p-5"
        style={{ background:'white', border:'1.5px solid #FFE082' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:'#FFF8E1' }}>
            <Award size={15} color="#8A6200" />
          </div>
          <p className="font-serif font-bold text-stone-800">Protocolo SCA</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            'Fragancia / Aroma', 'Sabor',
            'Post-gusto',        'Acidez',
            'Cuerpo',            'Balance',
            'Uniformidad',       'Taza limpia',
            'Dulzor',            'Impresión global',
          ].map((cat,i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background:'#FFF8E1' }}>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background:'#D4A847' }} />
              <span className="text-xs text-stone-600 font-medium">{cat}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 px-3 py-2 rounded-xl text-center"
          style={{ background:'#FFF8E1' }}>
          <p className="text-xs font-bold" style={{ color:'#8A6200' }}>
            Puntaje máximo: 100 puntos SCA
          </p>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label:'Solicitudes',    sub:'Cosechas por evaluar',   color:'#8A6200', bg:'#FFF8E1', borde:'#FFE082', tab:'solicitudes', icon: ClipboardList },
          { label:'Historial',      sub:'Cataciones realizadas',  color:'#1B4F8A', bg:'#EBF2FF', borde:'#C2D6F8', tab:'historial',   icon: Clock        },
        ].map((a,i) => (
          <button key={i} onClick={() => onTabChange(a.tab)}
            className="rounded-2xl p-4 text-left flex flex-col gap-2 transition-all active:scale-95"
            style={{ background:'white', border:`1.5px solid ${a.borde}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background:a.bg }}>
              <a.icon size={18} color={a.color} />
            </div>
            <div>
              <p className="font-semibold text-stone-800 text-sm">{a.label}</p>
              <p className="text-xs text-stone-400">{a.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Pendientes rápido */}
      {data?.pendientes?.length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background:'white', border:'1.5px solid #FFE082' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} color="#8A6200" />
              <p className="font-serif font-bold text-stone-800">Pendientes</p>
            </div>
            <button onClick={() => onTabChange('solicitudes')}
              className="text-xs font-medium" style={{ color:'#8A6200' }}>
              Ver todas →
            </button>
          </div>
          <div className="space-y-2">
            {data.pendientes.slice(0,3).map((c,i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background:'#FFF8E1' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:'#FFE082' }}>
                  <Star size={14} color="#8A6200" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-800 text-sm truncate">{c.variedad}</p>
                  <p className="text-xs text-stone-400 truncate capitalize">
                    {c.proceso} · {c.nombre_finca}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0"
                  style={{ background:'#FFF8E1', color:'#8A6200', border:'1px solid #FFE082' }}>
                  Pendiente
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
