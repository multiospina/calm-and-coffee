import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../api/axios';

export default function ClientePedido() {
  const { cafeteria_id, item_id } = useParams();
  const navigate = useNavigate();

  const [item, setItem]           = useState(null);
  const [cafeteria, setCafeteria] = useState(null);
  const [mesa, setMesa]           = useState('Mesa 1');
  const [notas, setNotas]         = useState('');
  const [pedido, setPedido]       = useState(null);
  const [cargando, setCargando]   = useState(true);
  const [enviando, setEnviando]   = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get(`/cliente/cafeterias/${cafeteria_id}/menu`);
        setCafeteria(res.data.cafeteria);
        const itemEncontrado = res.data.menu.find(m => m.id === item_id);
        setItem(itemEncontrado);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    if (cafeteria_id && item_id) cargar();
  }, [cafeteria_id, item_id]);

  const hacerPedido = async () => {
    setEnviando(true);
    setError('');
    try {
      const res = await api.post('/cliente/pedidos', {
        menu_item_id: item_id,
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0fff8' }}>
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Vista de confirmación después del pedido
  if (pedido) return (
    <div className="min-h-screen" style={{ background: '#f0fff8' }}>
      <nav className="px-6 py-4" style={{ background: '#1D7A4E' }}>
        <span className="text-white font-serif font-semibold">Pedido confirmado</span>
      </nav>

      <div className="max-w-lg mx-auto px-5 py-8 text-center">
        <div className="text-6xl mb-4">☕</div>
        <h1 className="font-serif text-2xl font-bold text-stone-800 mb-2">
          ¡Pedido realizado!
        </h1>
        <p className="text-stone-500 text-sm mb-6">
          Tu {item?.nombre} está siendo preparado
        </p>

        {/* QR del pocillo */}
        <div className="bg-white rounded-2xl p-6 mb-5 shadow-sm"
          style={{ border: '1px solid #A8E8CC' }}>
          <p className="text-stone-500 text-xs font-medium mb-4 tracking-wider">
            QR DE TU POCILLO
          </p>
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-white rounded-xl border border-stone-100">
              <QRCodeSVG
                value={`${window.location.origin}/trazabilidad/${item?.qr_codigo || 'sin-qr'}`}
                size={160}
                bgColor="#ffffff"
                fgColor="#0c0a08"
                level="M"
              />
            </div>
          </div>
          <p className="text-stone-400 font-mono text-xs">{pedido.qr_pocillo}</p>
          <p className="text-stone-400 text-xs mt-2">
            Escanea este QR para ver la trazabilidad completa de tu café
          </p>
        </div>

        {/* Info del pedido */}
        <div className="bg-white rounded-2xl p-5 mb-5 text-left"
          style={{ border: '1px solid #A8E8CC' }}>
          <div className="space-y-2">
            {[
              { label: 'Café',      value: item?.nombre },
              { label: 'Mesa',      value: mesa },
              { label: 'Cafetería', value: cafeteria?.nombre },
              { label: 'Precio',    value: `$${parseInt(item?.precio).toLocaleString('es-CO')}` },
            ].map((r, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-stone-400 text-sm">{r.label}</span>
                <span className="text-stone-700 text-sm font-medium">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate(`/trazabilidad/${item?.qr_codigo}`)}
            className="w-full py-3 rounded-2xl text-white text-sm font-medium"
            style={{ background: '#1D7A4E' }}>
            Ver trazabilidad del café ☕
          </button>
          <button
            onClick={() => navigate(`/cliente/pedidos/${pedido.pedido.id}/cata`)}
            className="w-full py-3 rounded-2xl text-sm font-medium"
            style={{ background: '#edfaf4', color: '#1D7A4E' }}>
            Ir a la cata →
          </button>
          <button
            onClick={() => navigate('/cliente')}
            className="w-full py-3 rounded-2xl text-sm text-stone-400">
            Volver al dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#f0fff8' }}>
      <nav className="px-6 py-4 flex items-center gap-3" style={{ background: '#1D7A4E' }}>
        <button onClick={() => navigate(-1)}
          className="text-green-200 hover:text-white text-sm transition">
          ←
        </button>
        <span className="text-white font-serif font-semibold">Hacer pedido</span>
      </nav>

      <div className="max-w-lg mx-auto px-5 py-8">

        {/* Info del café */}
        {item && (
          <div className="bg-white rounded-2xl p-5 mb-5 shadow-sm"
            style={{ border: '1px solid #A8E8CC' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-800">{item.nombre}</h2>
                <p className="text-stone-400 text-sm capitalize mt-0.5">
                  {item.variedad} · {item.proceso}
                </p>
                {item.nombre_finca && (
                  <p className="text-stone-400 text-xs mt-0.5">
                    {item.nombre_finca} · {item.municipio_finca}
                  </p>
                )}
              </div>
              <p className="font-bold text-stone-800 text-xl">
                ${parseInt(item.precio).toLocaleString('es-CO')}
              </p>
            </div>
            {item.descripcion && (
              <p className="text-stone-500 text-sm leading-relaxed">{item.descripcion}</p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full"
                style={{ background: item.stock > 0 ? '#edfaf4' : '#fee2e2', color: item.stock > 0 ? '#1D7A4E' : '#dc2626' }}>
                {item.stock > 0 ? `${item.stock} tazas disponibles` : 'Agotado'}
              </span>
            </div>
          </div>
        )}

        {/* Formulario del pedido */}
        <div className="bg-white rounded-2xl p-5 mb-5 shadow-sm"
          style={{ border: '1px solid #A8E8CC' }}>
          <h3 className="font-semibold text-stone-800 mb-4">Detalles del pedido</h3>

          <div className="mb-4">
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Mesa</label>
            <select
              value={mesa}
              onChange={e => setMesa(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-stone-200 outline-none focus:border-green-400 transition">
              {['Mesa 1','Mesa 2','Mesa 3','Mesa 4','Mesa 5','Mesa 6','Barra'].map(m => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">
              Notas especiales (opcional)
            </label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Sin azúcar, temperatura extra caliente..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-stone-200 outline-none focus:border-green-400 transition resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm mb-4"
            style={{ background: '#fee2e2', color: '#dc2626' }}>
            {error}
          </div>
        )}

        <button
          onClick={hacerPedido}
          disabled={enviando || item?.stock <= 0}
          className="w-full py-3.5 rounded-2xl text-white text-sm font-medium transition"
          style={{ background: enviando || item?.stock <= 0 ? '#9CA3AF' : '#1D7A4E' }}>
          {enviando ? 'Procesando...' : `Pedir ahora · $${parseInt(item?.precio || 0).toLocaleString('es-CO')}`}
        </button>
      </div>
    </div>
  );
}