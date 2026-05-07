import { useState, useEffect } from 'react';
import { Coffee, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import api from '../../../api/axios';

export default function StockCafeteria() {
  const [stock,    setStock]    = useState([]);
  const [cargando, setCargando] = useState(true);
  const [agotando, setAgotando] = useState(null);

  useEffect(() => { cargarStock(); }, []);

  const cargarStock = async () => {
    try {
      const res = await api.get('/barista/stock');
      setStock(res.data.stock || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const marcarAgotado = async (id, nombre) => {
    if (!window.confirm(`¿Marcar "${nombre}" como agotado?`)) return;
    setAgotando(id);
    try {
      await api.put(`/barista/stock/${id}/agotar`);
      cargarStock();
    } catch (err) {
      console.error(err);
    } finally {
      setAgotando(null);
    }
  };

  const getStockInfo = (stock) => {
    if (stock === 0)  return { color:'#DC2626', bg:'#FEF2F2', borde:'#FECACA', label:'Agotado',   icon: XCircle     };
    if (stock <= 5)   return { color:'#D4A847', bg:'#FFF8E1', borde:'#FFE082', label:'Poco stock', icon: AlertCircle };
    return              { color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC', label:'Disponible', icon: CheckCircle };
  };

  if (cargando) return (
    <div className="flex justify-center py-10">
      <div className="w-7 h-7 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
    </div>
  );

  const agotados    = stock.filter(s => s.stock === 0);
  const pocoStock   = stock.filter(s => s.stock > 0 && s.stock <= 5);
  const disponibles = stock.filter(s => s.stock > 5);

  return (
    <div className="space-y-4">

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Disponibles', value: disponibles.length, color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC' },
          { label:'Poco stock',  value: pocoStock.length,   color:'#D4A847', bg:'#FFF8E1', borde:'#FFE082' },
          { label:'Agotados',    value: agotados.length,    color:'#DC2626', bg:'#FEF2F2', borde:'#FECACA' },
        ].map((s,i) => (
          <div key={i} className="rounded-2xl p-3 text-center"
            style={{ background:s.bg, border:`1.5px solid ${s.borde}` }}>
            <p className="font-serif font-bold text-2xl" style={{ color:s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color:s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Alertas de poco stock */}
      {pocoStock.length > 0 && (
        <div className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background:'#FFF8E1', border:'1.5px solid #FFE082' }}>
          <AlertCircle size={16} color="#D4A847" className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold" style={{ color:'#8A6200' }}>
              {pocoStock.length} café{pocoStock.length > 1 ? 's' : ''} con poco stock
            </p>
            <p className="text-xs mt-0.5" style={{ color:'#D4A847' }}>
              {pocoStock.map(s => s.nombre).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Lista completa */}
      <p className="text-xs font-bold text-stone-400 tracking-wider">
        INVENTARIO ACTUAL — {stock.length} cafés
      </p>

      <div className="space-y-2">
        {stock.map((item, i) => {
          const info = getStockInfo(item.stock);
          const Icon = info.icon;
          return (
            <div key={i} className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background:'white', border:`1.5px solid ${item.stock <= 5 ? info.borde : '#E2E8F0'}` }}>

              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:info.bg }}>
                <Coffee size={18} color={info.color} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-800 text-sm truncate">{item.nombre}</p>
                <p className="text-stone-400 text-xs capitalize mt-0.5">
                  {item.variedad} · {item.proceso}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="font-serif font-bold text-lg" style={{ color:info.color }}>
                    {item.stock}
                  </p>
                  <p className="text-xs" style={{ color:info.color }}>{info.label}</p>
                </div>

                {item.stock > 0 && (
                  <button
                    onClick={() => marcarAgotado(item.id, item.nombre)}
                    disabled={agotando === item.id}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium transition"
                    style={{ background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA' }}>
                    {agotando === item.id ? '...' : 'Agotar'}
                  </button>
                )}

                {item.stock === 0 && (
                  <div className="px-3 py-1.5 rounded-xl"
                    style={{ background:'#FEF2F2' }}>
                    <XCircle size={14} color="#DC2626" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}