import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Coffee, MapPin, ChevronLeft, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

export default function ClientePedido() {
  const { cafeteria_id, item_id } = useParams();
  const [searchParams]            = useSearchParams();
  const navigate                  = useNavigate();

  const [item,     setItem]     = useState(null);
  const [cafeteria,setCafeteria]= useState(null);
  const [mesa,     setMesa]     = useState('');
  const [notas,    setNotas]    = useState('');
  const [pedido,   setPedido]   = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get(`/cliente/cafeterias/${cafeteria_id}/menu`);
        setCafeteria(res.data.cafeteria);
        const itemEncontrado = res.data.menu.find(m => m.id === item_id);
        setItem(itemEncontrado);

        // Si viene mesa desde URL (QR scan) la pre-selecciona
        const mesaUrl = searchParams.get('mesa');
        if (mesaUrl) {
          setMesa(mesaUrl.replace('-', ' '));
        } else {
          setMesa('Mesa 1');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    if (cafeteria_id && item_id) cargar();
  }, [cafeteria_id, item_id]);

  // Genera opciones de mesa dinámicamente según total_mesas de la cafetería
  const opcionesMesa = () => {
    const total = parseInt(cafeteria?.total_mesas) || 5;
    const opciones = [];
    for (let i = 1; i <= total; i++) {
      opciones.push(`Mesa ${i}`);
    }
    opciones.push('Barra');
    return opciones;
  };

  const hacerPedido = async () => {
    if (!mesa) { setError('Selecciona una mesa'); return; }
    setEnviando(true);
    setError('');
    try {
      const res = await api.post('/cliente/pedidos', {
        menu_item_id:  item_id,
        cafeteria_id,
        mesa,
        notas_cliente: notas || null,
      });
      setPedido(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el pedido');
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#F0FFF8' }}>
      <div className="w-8 h-8 border-2 border-green-200 border-t-green-500 rounded-full animate-spin" />
    </div>
  );

  // ── Vista confirmación ──────────────────────────────────────
  if (pedido) return (
    <div className="min-h-screen" style={{ background:'#F0FFF8' }}>
      <div className="px-5 pt-8 pb-5"
        style={{ background:'linear-gradient(135deg, #0F4A2E 0%, #1D7A4E 100%)' }}>
        <div className="max-w-lg mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background:'rgba(255,255,255,0.15)' }}>
            <CheckCircle size={32} color="white" />
          </div>
          <h1 className="font-serif text-white text-2xl font-bold mb-1">
            ¡Pedido realizado!
          </h1>
          <p className="text-sm" style={{ color:'rgba(255,255,255,0.7)' }}>
            Tu {item?.nombre} está siendo preparado en {mesa}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-4">

        {/* QR pocillo */}
        <div className="rounded-2xl p-5 text-center"
          style={{ background:'white', border:'1px solid #A8E8CC' }}>
          <p className="text-xs font-bold tracking-wider mb-4" style={{ color:'#1D7A4E' }}>
            QR DE TU POCILLO
          </p>
          <div className="flex justify-center mb-3">
            <div className="p-4 rounded-2xl" style={{ background:'#F0FFF8', border:'1px solid #A8E8CC' }}>
              <QRCodeSVG
                value={`${window.location.origin}/trazabilidad/${item?.qr_codigo || 'sin-qr'}`}
                size={150}
                bgColor="#F0FFF8"
                fgColor="#0F4A2E"
                level="M"
              />
            </div>
          </div>
          <p className="font-mono text-xs text-stone-400">{pedido.qr_pocillo}</p>
          <p className="text-xs text-stone-400 mt-1">
            Escanea para ver la trazabilidad completa
          </p>
        </div>

        {/* Info pedido */}
        <div className="rounded-2xl p-5"
          style={{ background:'white', border:'1px solid #A8E8CC' }}>
          {[
            { label:'Café',      value: item?.nombre        },
            { label:'Mesa',      value: mesa                },
            { label:'Cafetería', value: cafeteria?.nombre   },
            { label:'Precio',    value: `$${parseInt(item?.precio||0).toLocaleString('es-CO')}` },
          ].map((r,i) => (
            <div key={i} className="flex justify-between py-2"
              style={{ borderBottom: i < 3 ? '1px solid #F0FFF8' : 'none' }}>
              <span className="text-stone-400 text-sm">{r.label}</span>
              <span className="text-stone-700 text-sm font-medium">{r.value}</span>
            </div>
          ))}
        </div>

        <button onClick={() => navigate(`/trazabilidad/${item?.qr_codigo}`)}
          className="w-full py-3.5 rounded-2xl text-white text-sm font-bold"
          style={{ background:'#1D7A4E' }}>
          Ver trazabilidad del café
        </button>
        <button onClick={() => navigate(`/cliente/pedidos/${pedido.pedido?.id}/cata`)}
          className="w-full py-3.5 rounded-2xl text-sm font-bold"
          style={{ background:'#EDFAF4', color:'#1D7A4E' }}>
          Ir a la cata →
        </button>
        <button onClick={() => navigate('/cliente')}
          className="w-full py-3 rounded-2xl text-sm text-stone-400">
          Volver al inicio
        </button>
      </div>
    </div>
  );

  // ── Vista formulario ────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background:'#F0FFF8' }}>

      {/* Navbar */}
      <div className="flex items-center gap-3 px-5 h-14"
        style={{ background:'#1D7A4E' }}>
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background:'rgba(255,255,255,0.15)' }}>
          <ChevronLeft size={18} color="white" />
        </button>
        <span className="text-white font-serif font-semibold">Hacer pedido</span>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Info del café */}
        {item && (
          <div className="rounded-2xl p-5"
            style={{ background:'white', border:'1.5px solid #A8E8CC' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h2 className="font-serif text-xl font-bold text-stone-800">{item.nombre}</h2>
                <p className="text-stone-400 text-sm capitalize mt-0.5">
                  {item.variedad} · {item.proceso}
                </p>
                {item.nombre_finca && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={11} color="#94A3B8" />
                    <p className="text-stone-400 text-xs">
                      {item.nombre_finca} · {item.municipio_finca}
                    </p>
                  </div>
                )}
              </div>
              <p className="font-serif font-bold text-stone-800 text-2xl ml-3">
                ${parseInt(item.precio).toLocaleString('es-CO')}
              </p>
            </div>
            {item.descripcion && (
              <p className="text-stone-500 text-sm leading-relaxed mb-3">{item.descripcion}</p>
            )}
            <span className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{
                background: item.stock > 0 ? '#EDFAF4' : '#FEF2F2',
                color:      item.stock > 0 ? '#1D7A4E' : '#DC2626'
              }}>
              {item.stock > 0 ? `${item.stock} tazas disponibles` : 'Agotado'}
            </span>
          </div>
        )}

        {/* Formulario */}
        <div className="rounded-2xl p-5"
          style={{ background:'white', border:'1px solid #A8E8CC' }}>
          <h3 className="font-serif font-bold text-stone-800 mb-4">Detalles del pedido</h3>

          {/* Mesa — dinámica según cafetería */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-stone-500 mb-1.5">
              Mesa
              {cafeteria?.total_mesas && (
                <span className="ml-1 text-stone-300">
                  ({cafeteria.total_mesas} disponibles + Barra)
                </span>
              )}
            </label>
            <select
              value={mesa}
              onChange={e => setMesa(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition"
              style={{ border:'1px solid #A8E8CC', background:'#F0FFF8' }}>
              {opcionesMesa().map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">
              Notas especiales (opcional)
            </label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Sin azúcar, temperatura extra caliente..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ border:'1px solid #A8E8CC', background:'#F0FFF8' }}
            />
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA' }}>
            {error}
          </div>
        )}

        <button
          onClick={hacerPedido}
          disabled={enviando || item?.stock <= 0}
          className="w-full py-4 rounded-2xl text-white text-sm font-bold transition active:scale-95"
          style={{ background: enviando || item?.stock <= 0 ? '#CBD5E0' : '#1D7A4E' }}>
          {enviando
            ? 'Procesando...'
            : `Pedir ahora · $${parseInt(item?.precio || 0).toLocaleString('es-CO')}`
          }
        </button>
      </div>
    </div>
  );
}
