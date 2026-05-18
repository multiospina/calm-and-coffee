import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar
} from 'recharts';
import { TrendingUp, ShoppingBag, Star, DollarSign } from 'lucide-react';
import api from '../../../api/axios';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl px-4 py-3 text-xs"
        style={{ background:'#1A202C', color:'white', border:'1px solid #2D3748', boxShadow:'0 8px 24px rgba(0,0,0,0.3)' }}>
        <p className="font-bold mb-2">{label}</p>
        {payload.map((p,i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background:p.color }} />
            <span style={{ color:'rgba(255,255,255,0.7)' }}>{p.name}:</span>
            <span className="font-bold">{p.name === 'Ingresos' ? `$${parseInt(p.value).toLocaleString('es-CO')}` : p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function GraficaVentas() {
  const [ventas,   setVentas]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [vista,    setVista]    = useState('pedidos');

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/gerente/ventas');
        const data = res.data.ventas.map(v => ({
          fecha:      new Date(v.fecha).toLocaleDateString('es-CO', { weekday:'short', day:'numeric' }),
          pedidos:    parseInt(v.total_pedidos) || 0,
          entregados: parseInt(v.entregados)    || 0,
          ingresos:   parseInt(v.ingresos)      || 0,
          satisfaccion: parseFloat(v.satisfaccion) || 0,
        }));
        setVentas(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const totalPedidos   = ventas.reduce((a,v) => a + v.pedidos,    0);
  const totalIngresos  = ventas.reduce((a,v) => a + v.ingresos,   0);
  const satisfPromedio = ventas.length > 0
    ? (ventas.reduce((a,v) => a + v.satisfaccion, 0) / ventas.filter(v=>v.satisfaccion>0).length || 0).toFixed(1)
    : '—';

  if (cargando) return (
    <div className="flex justify-center py-10">
      <div className="w-7 h-7 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Métricas de la semana */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Pedidos 7 días', value: totalPedidos,  color:'#1B4F8A', bg:'#EBF2FF', borde:'#C2D6F8', icon: ShoppingBag },
          { label:'Ingresos 7 días',value: `$${totalIngresos.toLocaleString('es-CO')}`, color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC', icon: DollarSign },
          { label:'Satisfacción',   value: satisfPromedio > 0 ? `${satisfPromedio}★` : '—', color:'#8A6200', bg:'#FFF8E1', borde:'#FFE082', icon: Star },
        ].map((m,i) => (
          <div key={i} className="rounded-2xl p-3"
            style={{ background:'white', border:`1.5px solid ${m.borde}` }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
              style={{ background:m.bg }}>
              <m.icon size={14} color={m.color} />
            </div>
            <p className="font-serif font-bold text-lg leading-none" style={{ color:m.color }}>
              {m.value}
            </p>
            <p className="text-xs text-stone-400 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Gráfica */}
      <div className="rounded-2xl p-5"
        style={{ background:'white', border:'1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background:'#EBF2FF' }}>
              <TrendingUp size={15} color="#1B4F8A" />
            </div>
            <div>
              <p className="font-serif font-bold text-stone-800">Tendencia semanal</p>
              <p className="text-xs text-stone-400">Últimos 7 días</p>
            </div>
          </div>
          {/* Selector de métrica */}
          <div className="flex gap-1">
            {[
              { id:'pedidos',   label:'Pedidos'  },
              { id:'ingresos',  label:'Ingresos' },
              { id:'satisfaccion', label:'Satisf.' },
            ].map(v => (
              <button key={v.id}
                onClick={() => setVista(v.id)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition"
                style={{
                  background: vista===v.id ? '#1B4F8A' : '#F0F6FF',
                  color:      vista===v.id ? 'white'   : '#1B4F8A',
                }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {ventas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <TrendingUp size={28} color="#E2E8F0" className="mb-3" />
            <p className="text-stone-300 text-sm">Sin datos de ventas aún</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            {vista === 'pedidos' ? (
              <AreaChart data={ventas}>
                <defs>
                  <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1B4F8A" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1B4F8A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEntregados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1D7A4E" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1D7A4E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EE" />
                <XAxis dataKey="fecha" tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="pedidos"    name="Pedidos"    stroke="#1B4F8A" fill="url(#colorPedidos)"    strokeWidth={2} dot={{ fill:'#1B4F8A', r:4 }} />
                <Area type="monotone" dataKey="entregados" name="Entregados" stroke="#1D7A4E" fill="url(#colorEntregados)" strokeWidth={2} dot={{ fill:'#1D7A4E', r:4 }} />
              </AreaChart>
            ) : vista === 'ingresos' ? (
              <BarChart data={ventas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EE" />
                <XAxis dataKey="fecha" tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="ingresos" name="Ingresos" fill="#1D7A4E" radius={[6,6,0,0]} />
              </BarChart>
            ) : (
              <AreaChart data={ventas}>
                <defs>
                  <linearGradient id="colorSatisf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#D4A847" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#D4A847" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EE" />
                <XAxis dataKey="fecha" tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,5]} tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="satisfaccion" name="Satisfacción" stroke="#D4A847" fill="url(#colorSatisf)" strokeWidth={2} dot={{ fill:'#D4A847', r:4 }} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}