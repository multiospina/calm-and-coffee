import { Coffee, Thermometer, Droplets, Wind } from 'lucide-react';

export default function MenuHoy({ menu }) {
  if (menu.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center"
        style={{ background: 'white', border: '1px solid #E2E8F0' }}>
        <Coffee size={32} color="#E2E8F0" className="mx-auto mb-3" />
        <p className="text-stone-300 text-sm">No hay menú disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-stone-400 tracking-wider">
        CAFÉS DISPONIBLES HOY — {menu.length} en carta
      </p>
      {menu.map((item, i) => (
        <div key={i} className="rounded-2xl p-4"
          style={{ background: 'white', border: '1px solid #E2E8F0' }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#FFF0EB' }}>
                <Coffee size={18} color="#C0350F" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-stone-800">{item.nombre}</h3>
                <p className="text-stone-400 text-xs mt-0.5 capitalize">
                  {item.variedad} · {item.proceso}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-stone-700">
                ${parseInt(item.precio).toLocaleString('es-CO')}
              </p>
              <p className="text-xs mt-0.5"
                style={{
                  color: item.stock > 5 ? '#1D7A4E' : item.stock > 0 ? '#D4A847' : '#DC2626'
                }}>
                {item.stock > 0 ? `${item.stock} tazas` : 'Agotado'}
              </p>
            </div>
          </div>

          {/* Parámetros de preparación */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-xl p-2.5 text-center" style={{ background: '#FFF0EB' }}>
              <Thermometer size={13} color="#C0350F" className="mx-auto mb-1" />
              <p className="text-xs font-medium" style={{ color: '#C0350F' }}>92°C</p>
              <p className="text-xs text-stone-400">Agua</p>
            </div>
            <div className="rounded-xl p-2.5 text-center" style={{ background: '#EBF2FF' }}>
              <Droplets size={13} color="#1B4F8A" className="mx-auto mb-1" />
              <p className="text-xs font-medium" style={{ color: '#1B4F8A' }}>1:15</p>
              <p className="text-xs text-stone-400">Ratio</p>
            </div>
            <div className="rounded-xl p-2.5 text-center" style={{ background: '#EDFAF4' }}>
              <Wind size={13} color="#1D7A4E" className="mx-auto mb-1" />
              <p className="text-xs font-medium" style={{ color: '#1D7A4E' }}>
                {item.altitud_msnm ? `${item.altitud_msnm}m` : '1800m'}
              </p>
              <p className="text-xs text-stone-400">Altitud</p>
            </div>
          </div>

          {item.descripcion && (
            <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">
              {item.descripcion}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
