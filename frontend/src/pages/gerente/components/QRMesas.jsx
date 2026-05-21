import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Plus, Minus, Printer, Check,
  X, Coffee, ChevronLeft, ChevronRight,
  Grid, QrCode
} from 'lucide-react';
import api from '../../../api/axios';

export default function QRMesas({ cafeteria, onActualizar }) {
  const [totalMesas,  setTotalMesas]  = useState(5);
  const [mesaActiva,  setMesaActiva]  = useState(1);
  const [guardando,   setGuardando]   = useState(false);
  const [editandoNum, setEditandoNum] = useState(false);
  const [nuevoTotal,  setNuevoTotal]  = useState(5);
  const [vistaTab,    setVistaTab]    = useState('mapa'); // mapa | todos
  const [toast,       setToast]       = useState(null);

  // ── Sincroniza cuando llega cafeteria ───────
  useEffect(() => {
    if (cafeteria?.total_mesas) {
      const total = parseInt(cafeteria.total_mesas);
      setTotalMesas(total);
      setNuevoTotal(total);
    }
  }, [cafeteria?.total_mesas]);

  const mostrarToast = (msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const guardarMesas = async () => {
    const total = parseInt(nuevoTotal);
    if (isNaN(total) || total < 1 || total > 50) {
      mostrarToast('El número debe ser entre 1 y 50', 'error');
      return;
    }
    setGuardando(true);
    try {
      await api.put('/gerente/cafeteria/mesas', { total_mesas: total });
      setTotalMesas(total);
      setEditandoNum(false);
      if (mesaActiva > total) setMesaActiva(1);
      mostrarToast(`Cafetería actualizada a ${total} mesas`);
      onActualizar && onActualizar();
    } catch (err) {
      console.error('Error mesas:', err.response?.data || err);
      mostrarToast(err.response?.data?.error || 'Error al actualizar', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const incrementar = () => setNuevoTotal(prev => Math.min(50, parseInt(prev || 1) + 1));
  const decrementar = () => setNuevoTotal(prev => Math.max(1,  parseInt(prev || 1) - 1));

  const urlMesa = (num) =>
    `${window.location.origin}/menu/${cafeteria?.id}/Mesa-${num}`;

  const mesas = Array.from({ length: totalMesas }, (_, i) => i + 1);

  // Columnas responsivas según total de mesas
  const cols =
    totalMesas <= 2 ? 2 :
    totalMesas <= 4 ? 2 :
    totalMesas <= 6 ? 3 :
    totalMesas <= 9 ? 3 : 4;

  return (
    <div className="space-y-4">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium"
          style={{
            background:  toast.tipo === 'ok' ? '#EDFAF4' : '#FEF2F2',
            border:      `1px solid ${toast.tipo === 'ok' ? '#A8E8CC' : '#FECACA'}`,
            color:       toast.tipo === 'ok' ? '#1D7A4E' : '#DC2626',
            boxShadow:   '0 8px 30px rgba(0,0,0,0.12)',
          }}>
          {toast.tipo === 'ok' ? <Check size={15} /> : <X size={15} />}
          {toast.msg}
        </div>
      )}

      {/* ── Panel control de mesas ── */}
      <div className="rounded-2xl p-5"
        style={{ background: 'white', border: '1px solid #E2E8F0' }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
          <div>
            <p className="font-serif font-bold text-stone-800">Mesas de la cafetería</p>
            <p className="text-xs text-stone-400 mt-0.5">
              Gestiona cuántas mesas tiene tu local
            </p>
          </div>

          {!editandoNum ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                style={{ background: '#EBF2FF' }}>
                <Grid size={13} color="#1B4F8A" />
                <span className="font-serif font-bold text-lg" style={{ color: '#1B4F8A' }}>
                  {totalMesas}
                </span>
                <span className="text-xs text-stone-400">mesas</span>
              </div>
              <button
                onClick={() => { setEditandoNum(true); setNuevoTotal(totalMesas); }}
                className="px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: '#F0F6FF', color: '#1B4F8A', border: '1px solid #C2D6F8' }}>
                Editar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Decrementar */}
              <button onClick={decrementar}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition active:scale-95"
                style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                <Minus size={15} />
              </button>

              {/* Input */}
              <input
                type="number"
                value={nuevoTotal}
                min={1} max={50}
                onChange={e => {
                  const v = parseInt(e.target.value);
                  if (!isNaN(v)) setNuevoTotal(v);
                }}
                className="w-16 text-center font-serif font-bold text-xl outline-none rounded-xl py-1.5 flex-shrink-0"
                style={{ background: '#F0F6FF', color: '#1B4F8A', border: '1.5px solid #C2D6F8' }}
              />

              {/* Incrementar */}
              <button onClick={incrementar}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition active:scale-95"
                style={{ background: '#EDFAF4', color: '#1D7A4E', border: '1px solid #A8E8CC' }}>
                <Plus size={15} />
              </button>

              {/* Guardar */}
              <button
                onClick={guardarMesas}
                disabled={guardando}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0 transition active:scale-95"
                style={{ background: guardando ? '#CBD5E0' : '#1B4F8A', minWidth: '72px' }}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>

              {/* Cancelar */}
              <button
                onClick={() => { setEditandoNum(false); setNuevoTotal(totalMesas); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#F8F9FA', color: '#94A3B8' }}>
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Mostrador */}
        <div className="flex justify-center mb-5">
          <div className="px-8 py-2 rounded-xl flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #5C3D2E 0%, #92400e 100%)' }}>
            <Coffee size={13} color="white" />
            <span className="text-white text-xs font-bold tracking-wider">MOSTRADOR</span>
          </div>
        </div>

        {/* Grid de mesas — responsive */}
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {mesas.map(num => {
            const sel = mesaActiva === num;
            return (
              <button key={num}
                onClick={() => setMesaActiva(num)}
                className="flex flex-col items-center rounded-2xl py-3 px-1 transition-all active:scale-95"
                style={{
                  background: sel ? '#1B4F8A' : '#F8F9FA',
                  border:     `2px solid ${sel ? '#1B4F8A' : '#E2E8F0'}`,
                  transform:  sel ? 'scale(1.05)' : 'scale(1)',
                  boxShadow:  sel ? '0 4px 16px rgba(27,79,138,0.3)' : 'none',
                }}>
                {/* Sillas arriba */}
                <div className="flex gap-1 mb-0.5">
                  {[0, 1].map(s => (
                    <div key={s} className="w-3 h-2 rounded-t-full"
                      style={{ background: sel ? 'rgba(255,255,255,0.35)' : '#CBD5E0' }} />
                  ))}
                </div>
                {/* Mesa */}
                <div className="w-10 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: sel ? 'rgba(255,255,255,0.2)' : '#E2E8F0' }}>
                  <span className="text-xs font-bold"
                    style={{ color: sel ? 'white' : '#4A5568' }}>
                    {num}
                  </span>
                </div>
                {/* Sillas abajo */}
                <div className="flex gap-1 mt-0.5">
                  {[0, 1].map(s => (
                    <div key={s} className="w-3 h-2 rounded-b-full"
                      style={{ background: sel ? 'rgba(255,255,255,0.35)' : '#CBD5E0' }} />
                  ))}
                </div>
                <span className="text-xs font-medium mt-1.5"
                  style={{ color: sel ? 'white' : '#94A3B8' }}>
                  M{num}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-stone-400 text-center mt-3">
          Toca una mesa para ver su QR
        </p>
      </div>

      {/* ── QR de mesa seleccionada ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'white', border: '1.5px solid #C2D6F8' }}>

        {/* Header QR */}
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #0F3366 0%, #1B4F8A 100%)' }}>
          <div>
            <p className="text-xs font-bold tracking-widest mb-0.5"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              QR ACTIVO
            </p>
            <p className="font-serif font-bold text-white text-lg leading-none">
              Mesa {mesaActiva}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {cafeteria?.nombre}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMesaActiva(Math.max(1, mesaActiva - 1))}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition active:scale-95"
              style={{ background: 'rgba(255,255,255,0.15)' }}>
              <ChevronLeft size={18} color="white" />
            </button>
            <button
              onClick={() => setMesaActiva(Math.min(totalMesas, mesaActiva + 1))}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition active:scale-95"
              style={{ background: 'rgba(255,255,255,0.15)' }}>
              <ChevronRight size={18} color="white" />
            </button>
          </div>
        </div>

        <div className="p-5 flex flex-col items-center gap-4">
          {/* QR grande */}
          <div className="p-5 rounded-2xl"
            style={{ background: '#F0F6FF', border: '1px solid #C2D6F8' }}>
            <QRCodeSVG
              value={urlMesa(mesaActiva)}
              size={180}
              bgColor="#F0F6FF"
              fgColor="#0F3366"
              level="M"
            />
          </div>

          {/* URL */}
          <div className="w-full px-4 py-3 rounded-xl"
            style={{ background: '#F8F9FA', border: '1px solid #E2E8F0' }}>
            <p className="text-xs font-mono text-stone-400 break-all text-center">
              {urlMesa(mesaActiva)}
            </p>
          </div>

          {/* Navegación rápida */}
          <div className="flex gap-2 flex-wrap justify-center">
            {mesas.map(num => (
              <button key={num} onClick={() => setMesaActiva(num)}
                className="w-9 h-9 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={{
                  background: mesaActiva === num ? '#1B4F8A' : '#F0F6FF',
                  color:      mesaActiva === num ? 'white'   : '#1B4F8A',
                  border:     mesaActiva === num ? 'none'    : '1px solid #C2D6F8',
                }}>
                {num}
              </button>
            ))}
          </div>

          {/* Imprimir */}
          <button onClick={() => window.print()}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition active:scale-95"
            style={{ background: '#1B4F8A' }}>
            <Printer size={16} />
            Imprimir QR de Mesa {mesaActiva}
          </button>
        </div>
      </div>

      {/* ── Todos los QR ── */}
      <div className="rounded-2xl p-5"
        style={{ background: 'white', border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <QrCode size={15} color="#1B4F8A" />
            <p className="font-serif font-bold text-stone-800">Todos los QR</p>
          </div>
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
            style={{ background: '#EBF2FF', color: '#1B4F8A' }}>
            <Printer size={12} />
            Imprimir todos
          </button>
        </div>

        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {mesas.map(num => (
            <button key={num}
              onClick={() => setMesaActiva(num)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95"
              style={{
                background: mesaActiva === num ? '#EBF2FF' : '#F8F9FA',
                border:     `1.5px solid ${mesaActiva === num ? '#C2D6F8' : '#E2E8F0'}`,
              }}>
              <QRCodeSVG
                value={urlMesa(num)}
                size={55}
                bgColor="transparent"
                fgColor="#0F3366"
                level="M"
              />
              <span className="text-xs font-medium text-stone-500">M{num}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
