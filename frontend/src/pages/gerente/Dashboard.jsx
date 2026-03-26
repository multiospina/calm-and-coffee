import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../api/axios';

export default function GerenteDashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData]         = useState(null);
  const [cargando, setCargando] = useState(true);
  const [vistaQR, setVistaQR]   = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/gerente/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const mesas = ['Mesa-1','Mesa-2','Mesa-3','Mesa-4','Mesa-5'];

  return (
    <div className="min-h-screen" style={{ background: '#EBF2FF' }}>

      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between"
        style={{ background: '#1B4F8A' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <span className="text-white font-serif font-bold text-sm">C</span>
          </div>
          <div>
            <span className="text-white font-serif font-semibold">Calm and Coffee</span>
            <span className="text-blue-200 text-xs ml-2">· Gerente</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-blue-200 text-sm">{usuario?.nombre?.split(' ')[0]}</span>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="text-blue-300 hover:text-white text-xs transition">
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-5 py-7">

        {cargando ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data && (
          <>
            {/* Saludo */}
            <div className="mb-6">
              <h1 className="font-serif text-2xl font-bold text-stone-800">
                {data.cafeteria?.nombre} ☕
              </h1>
              <p className="text-stone-500 text-sm mt-1">
                📍 {data.cafeteria?.municipio}
              </p>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
              {[
                { label:'Total pedidos',    value: data.metricas?.total_pedidos       || 0,   color:'#1B4F8A' },
                { label:'Entregados',       value: data.metricas?.pedidos_entregados  || 0,   color:'#1D7A4E' },
                { label:'Ingresos totales', value: `$${parseInt(data.metricas?.ingresos_totales || 0).toLocaleString('es-CO')}`, color:'#D4A847' },
                { label:'Satisfacción',     value: data.metricas?.satisfaccion_promedio ? `${data.metricas.satisfaccion_promedio}★` : '—', color:'#C0350F' },
              ].map((m,i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm"
                  style={{ border:'1px solid #C2D6F8' }}>
                  <div className="text-2xl font-bold font-serif mb-1" style={{ color:m.color }}>
                    {m.value}
                  </div>
                  <div className="text-stone-500 text-xs">{m.label}</div>
                </div>
              ))}
            </div>

            {/* QR de mesas */}
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-6"
              style={{ border:'1px solid #C2D6F8' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-serif font-bold text-stone-800">QR de mesas</h2>
                  <p className="text-stone-400 text-xs mt-0.5">
                    Imprime estos QR y colócalos en cada mesa
                  </p>
                </div>
                <button
                  onClick={() => setVistaQR(!vistaQR)}
                  className="px-4 py-2 rounded-xl text-xs font-medium transition"
                  style={{ background: vistaQR ? '#1B4F8A' : '#EBF2FF', color: vistaQR ? 'white' : '#1B4F8A' }}>
                  {vistaQR ? 'Ocultar QR' : 'Ver QR de mesas'}
                </button>
              </div>

              {vistaQR && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {mesas.map(mesa => (
                    <div key={mesa} className="text-center p-3 rounded-2xl"
                      style={{ background:'#EBF2FF', border:'1px solid #C2D6F8' }}>
                      <div className="flex justify-center mb-2">
                        <div className="p-2 bg-white rounded-xl">
                          <QRCodeSVG
                            value={`${window.location.origin}/menu/${data.cafeteria?.id}/${mesa}`}
                            size={80}
                            bgColor="#ffffff"
                            fgColor="#0c0a08"
                            level="M"
                          />
                        </div>
                      </div>
                      <p className="text-blue-700 text-xs font-medium">
                        {mesa.replace('-',' ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top cafés */}
            {data.top_cafes?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm mb-6"
                style={{ border:'1px solid #C2D6F8' }}>
                <h2 className="font-serif font-bold text-stone-800 mb-4">
                  Cafés más pedidos
                </h2>
                <div className="space-y-3">
                  {data.top_cafes.map((c,i) => (
                    <div key={i} className="flex items-center justify-between py-2"
                      style={{ borderBottom:'1px solid #EBF2FF' }}>
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background:'#EBF2FF', color:'#1B4F8A' }}>
                          {i+1}
                        </span>
                        <span className="text-stone-700 text-sm">{c.nombre}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {c.rating && (
                          <span className="text-amber-500 text-xs">★ {c.rating}</span>
                        )}
                        <span className="text-stone-400 text-xs">
                          {c.total_pedidos} pedidos
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cosechas disponibles */}
            {data.cosechas_disponibles?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm"
                style={{ border:'1px solid #C2D6F8' }}>
                <h2 className="font-serif font-bold text-stone-800 mb-4">
                  Cosechas disponibles
                </h2>
                <div className="space-y-3">
                  {data.cosechas_disponibles.map((c,i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background:'#EBF2FF' }}>
                      <div>
                        <p className="text-stone-700 text-sm font-medium capitalize">
                          {c.variedad} · {c.proceso}
                        </p>
                        <p className="text-stone-400 text-xs">
                          {c.nombre_finca} · {c.municipio}
                        </p>
                      </div>
                      {c.qr_codigo && (
                        <span className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ background:'#edfaf4', color:'#1D7A4E' }}>
                          QR activo
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}