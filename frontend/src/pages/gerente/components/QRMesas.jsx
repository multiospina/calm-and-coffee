import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Plus, Minus, Printer, QrCode,
  Coffee, Check, X
} from 'lucide-react';
import api from '../../../api/axios';

const ESTADO_MESA = {
  libre:        { color:'#94A3B8', bg:'#F8F9FA', borde:'#E2E8F0', label:'Libre'     },
  ocupada:      { color:'#C0350F', bg:'#FFF0EB', borde:'#FECACA', label:'Ocupada'   },
  lista:        { color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC', label:'Lista'     },
  reservada:    { color:'#1B4F8A', bg:'#EBF2FF', borde:'#C2D6F8', label:'Reservada' },
};

export default function QRMesas({ cafeteria, onActualizar }) {
  const [totalMesas,   setTotalMesas]   = useState(cafeteria?.total_mesas || 5);
  const [mesaActiva,   setMesaActiva]   = useState(1);
  const [guardando,    setGuardando]    = useState(false);
  const [editandoNum,  setEditandoNum]  = useState(false);
  const [nuevoTotal,   setNuevoTotal]   = useState(cafeteria?.total_mesas || 5);
  const [toast,        setToast]        = useState(null);
  const [vistaQR,      setVistaQR]      = useState('individual');

  useEffect(() => {
    if (cafeteria?.total_mesas) {
      setTotalMesas(cafeteria.total_mesas);
      setNuevoTotal(cafeteria.total_mesas);
    }
  }, [cafeteria]);

  const mostrarToast = (msg, tipo='ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const guardarMesas = async () => {
    if (nuevoTotal < 1 || nuevoTotal > 50) {
      mostrarToast('El número de mesas debe ser entre 1 y 50', 'error');
      return;
    }
    setGuardando(true);
    try {
      await api.put('/gerente/cafeteria/mesas', { total_mesas: nuevoTotal });
      setTotalMesas(nuevoTotal);
      setEditandoNum(false);
      mostrarToast(`Actualizado a ${nuevoTotal} mesas`);
      onActualizar && onActualizar();
    } catch (err) {
      mostrarToast('Error al actualizar mesas', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const urlMesa = (num) =>
    `${window.location.origin}/menu/${cafeteria?.id}/Mesa-${num}`;

  const mesas = Array.from({ length: totalMesas }, (_, i) => i + 1);

  const imprimir = () => window.print();

  return (
    <div className="space-y-4">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium"
          style={{
            background: toast.tipo==='ok' ? '#EDFAF4' : '#FEF2F2',
            border:`1px solid ${toast.tipo==='ok' ? '#A8E8CC' : '#FECACA'}`,
            color: toast.tipo==='ok' ? '#1D7A4E' : '#DC2626',
            boxShadow:'0 8px 30px rgba(0,0,0,0.12)'
          }}>
          {toast.tipo==='ok' ? <Check size={15}/> : <X size={15}/>}
          {toast.msg}
        </div>
      )}

      {/* Header con control de mesas */}
      <div className="rounded-2xl p-5"
        style={{ background:'white', border:'1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-serif font-bold text-stone-800">Mesas de la cafetería</p>
            <p className="text-xs text-stone-400 mt-0.5">
              Gestiona el número de mesas y sus QR
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editandoNum ? (
              <>
                <span className="font-serif font-bold text-2xl" style={{ color:'#1B4F8A' }}>
                  {totalMesas}
                </span>
                <span className="text-xs text-stone-400">mesas</span>
                <button
                  onClick={() => setEditandoNum(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium ml-2"
                  style={{ background:'#EBF2FF', color:'#1B4F8A' }}>
                  Editar
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNuevoTotal(Math.max(1, nuevoTotal - 1))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background:'#FEF2F2', color:'#DC2626' }}>
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  value={nuevoTotal}
                  onChange={e => setNuevoTotal(parseInt(e.target.value)||1)}
                  min={1} max={50}
                  className="w-16 text-center font-serif font-bold text-xl outline-none rounded-xl py-1"
                  style={{ background:'#F0F6FF', color:'#1B4F8A', border:'1.5px solid #C2D6F8' }}
                />
                <button
                  onClick={() => setNuevoTotal(Math.min(50, nuevoTotal + 1))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background:'#EDFAF4', color:'#1D7A4E' }}>
                  <Plus size={14} />
                </button>
                <button
                  onClick={guardarMesas}
                  disabled={guardando}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                  style={{ background: guardando ? '#CBD5E0' : '#1B4F8A' }}>
                  {guardando ? '...' : 'Guardar'}
                </button>
                <button
                  onClick={() => { setEditandoNum(false); setNuevoTotal(totalMesas); }}
                  className="p-1.5 rounded-xl"
                  style={{ background:'#F8F9FA', color:'#94A3B8' }}>
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mapa visual tipo cine */}
        <div className="mb-4">
          <p className="text-xs font-bold text-stone-400 tracking-wider mb-3">
            PLANO DE MESAS — {cafeteria?.nombre}
          </p>

          {/* Zona de café / mostrador */}
          <div className="flex items-center justify-center mb-4">
            <div className="px-8 py-2 rounded-xl flex items-center gap-2"
              style={{ background:'linear-gradient(135deg, #5C3D2E 0%, #92400e 100%)' }}>
              <Coffee size={14} color="white" />
              <span className="text-white text-xs font-bold tracking-wider">MOSTRADOR</span>
            </div>
          </div>

          {/* Grid de mesas estilo cine */}
          <div className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${Math.min(5, totalMesas)}, 1fr)` }}>
            {mesas.map(num => {
              const seleccionada = mesaActiva === num;
              return (
                <button
                  key={num}
                  onClick={() => setMesaActiva(num)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all"
                  style={{
                    background: seleccionada ? '#1B4F8A' : '#F8F9FA',
                    border: `2px solid ${seleccionada ? '#1B4F8A' : '#E2E8F0'}`,
                    transform: seleccionada ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: seleccionada ? '0 4px 16px rgba(27,79,138,0.3)' : 'none',
                  }}>
                  {/* Silueta de mesa estilo cine */}
                  <div className="relative">
                    {/* Mesa */}
                    <div className="w-10 h-6 rounded-lg flex items-center justify-center"
                      style={{
                        background: seleccionada ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                      }}>
                      <span className="text-xs font-bold"
                        style={{ color: seleccionada ? 'white' : '#4A5568' }}>
                        {num}
                      </span>
                    </div>
                    {/* Sillas arriba */}
                    <div className="flex justify-around absolute -top-2 left-0 right-0">
                      {[0,1].map(s => (
                        <div key={s} className="w-3 h-2 rounded-t-full"
                          style={{ background: seleccionada ? 'rgba(255,255,255,0.3)' : '#CBD5E0' }} />
                      ))}
                    </div>
                    {/* Sillas abajo */}
                    <div className="flex justify-around absolute -bottom-2 left-0 right-0">
                      {[0,1].map(s => (
                        <div key={s} className="w-3 h-2 rounded-b-full"
                          style={{ background: seleccionada ? 'rgba(255,255,255,0.3)' : '#CBD5E0' }} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs font-medium mt-1"
                    style={{ color: seleccionada ? 'white' : '#94A3B8' }}>
                    M{num}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex items-center gap-4 justify-center pt-2"
          style={{ borderTop:'1px solid #F8F9FA' }}>
          <p className="text-xs text-stone-400">
            Toca una mesa para ver su QR
          </p>
        </div>
      </div>

      {/* QR de la mesa seleccionada */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background:'white', border:'1.5px solid #C2D6F8' }}>

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ background:'linear-gradient(135deg, #0F3366 0%, #1B4F8A 100%)' }}>
          <div>
            <p className="text-xs font-bold tracking-widest"
              style={{ color:'rgba(255,255,255,0.5)' }}>
              QR ACTIVO
            </p>
            <p className="font-serif font-bold text-white text-lg">
              Mesa {mesaActiva}
            </p>
            <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.6)' }}>
              {cafeteria?.nombre}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMesaActiva(Math.max(1, mesaActiva - 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background:'rgba(255,255,255,0.15)', color:'white' }}>
              ‹
            </button>
            <button
              onClick={() => setMesaActiva(Math.min(totalMesas, mesaActiva + 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background:'rgba(255,255,255,0.15)', color:'white' }}>
              ›
            </button>
          </div>
        </div>

        <div className="p-5 flex flex-col items-center gap-4">
          {/* QR grande */}
          <div className="p-5 rounded-2xl"
            style={{ background:'#F0F6FF', border:'1px solid #C2D6F8' }}>
            <QRCodeSVG
              value={urlMesa(mesaActiva)}
              size={200}
              bgColor="#F0F6FF"
              fgColor="#0F3366"
              level="M"
            />
          </div>

          {/* URL */}
          <div className="w-full px-4 py-3 rounded-xl text-center"
            style={{ background:'#F8F9FA', border:'1px solid #E2E8F0' }}>
            <p className="text-xs font-mono text-stone-400 break-all">
              {urlMesa(mesaActiva)}
            </p>
          </div>

          {/* Navegación rápida entre mesas */}
          <div className="flex gap-2 flex-wrap justify-center">
            {mesas.map(num => (
              <button key={num}
                onClick={() => setMesaActiva(num)}
                className="w-9 h-9 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: mesaActiva===num ? '#1B4F8A' : '#F0F6FF',
                  color:      mesaActiva===num ? 'white'   : '#1B4F8A',
                  border:     mesaActiva===num ? 'none'    : '1px solid #C2D6F8',
                }}>
                {num}
              </button>
            ))}
          </div>

          {/* Botón imprimir */}
          <button onClick={imprimir}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{ background:'#1B4F8A' }}>
            <Printer size={16} />
            Imprimir QR de Mesa {mesaActiva}
          </button>
        </div>
      </div>

      {/* Todos los QR pequeños */}
      <div className="rounded-2xl p-5"
        style={{ background:'white', border:'1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-serif font-bold text-stone-800">Todos los QR</p>
          <button onClick={imprimir}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
            style={{ background:'#EBF2FF', color:'#1B4F8A' }}>
            <Printer size={12} />
            Imprimir todos
          </button>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {mesas.map(num => (
            <button key={num}
              onClick={() => setMesaActiva(num)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
              style={{
                background: mesaActiva===num ? '#F0F6FF' : '#F8F9FA',
                border:`1.5px solid ${mesaActiva===num ? '#C2D6F8' : '#E2E8F0'}`,
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