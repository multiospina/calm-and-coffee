import { useState, useEffect } from 'react';
import { Leaf, ChevronDown, ChevronUp, MapPin, Star } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../../api/axios';

export default function CosechasGerente() {
  const [cosechas, setCosechas] = useState([]);
  const [visible,  setVisible]  = useState(false);
  const [cargando, setCargando] = useState(false);
  const [qrActivo, setQrActivo] = useState(null);

  useEffect(() => { if (visible) cargar(); }, [visible]);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await api.get('/gerente/cosechas');
      setCosechas(res.data.cosechas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background:'white', border:'1px solid #E2E8F0' }}>

      <button onClick={() => setVisible(!visible)}
        className="w-full px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:'#F3EEF5' }}>
            <Leaf size={16} color="#6B3A8A" />
          </div>
          <div className="text-left">
            <p className="font-serif font-bold text-stone-800">Cosechas disponibles</p>
            <p className="text-xs text-stone-400">{cosechas.length} asignadas a tu cafetería</p>
          </div>
        </div>
        {visible ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
      </button>

      {visible && (
        <div className="px-5 pb-5 space-y-3" style={{ borderTop:'1px solid #F8F9FA' }}>
          {cargando ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-purple-400 rounded-full animate-spin" />
            </div>
          ) : cosechas.length === 0 ? (
            <div className="py-8 text-center">
              <Leaf size={28} color="#E2E8F0" className="mx-auto mb-2" />
              <p className="text-stone-300 text-sm">Sin cosechas asignadas</p>
            </div>
          ) : cosechas.map((c,i) => (
            <div key={i} className="rounded-2xl overflow-hidden"
              style={{ border:'1px solid #E8D4F8' }}>

              {/* Header cosecha */}
              <div className="p-4" style={{ background:'#FAF5FF' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background:'#F3EEF5' }}>
                      <Leaf size={18} color="#6B3A8A" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-stone-800">{c.variedad}</h3>
                      <p className="text-stone-400 text-xs capitalize mt-0.5">{c.proceso}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={10} color="#94A3B8" />
                        <span className="text-xs text-stone-400">
                          {c.nombre_finca} · {c.municipio}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {c.rating && (
                      <div className="flex items-center gap-1 justify-end">
                        <Star size={11} color="#D4A847" fill="#D4A847" />
                        <span className="text-xs font-bold" style={{ color:'#8A6200' }}>{c.rating}</span>
                      </div>
                    )}
                    <p className="text-xs text-stone-400 mt-1">{c.total_pedidos} pedidos</p>
                    {c.altitud_msnm && (
                      <p className="text-xs font-medium mt-0.5" style={{ color:'#6B3A8A' }}>
                        {c.altitud_msnm} msnm
                      </p>
                    )}
                  </div>
                </div>

                {/* Tags info */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background:'#EBF2FF', color:'#1B4F8A' }}>
                    {c.nombre_caficultor}
                  </span>
                  {c.kg_producidos && (
                    <span className="text-xs px-2.5 py-1 rounded-full"
                      style={{ background:'#EDFAF4', color:'#1D7A4E' }}>
                      {c.kg_producidos} kg producidos
                    </span>
                  )}
                </div>
              </div>

              {/* QR de la cosecha */}
              {c.qr_codigo && (
                <div style={{ borderTop:'1px solid #E8D4F8' }}>
                  <button
                    onClick={() => setQrActivo(qrActivo === c.id ? null : c.id)}
                    className="w-full px-4 py-2.5 text-xs font-medium text-left flex items-center justify-between"
                    style={{ background:'white', color:'#6B3A8A' }}>
                    <span>Ver QR de trazabilidad</span>
                    {qrActivo === c.id
                      ? <ChevronUp size={13} color="#6B3A8A" />
                      : <ChevronDown size={13} color="#6B3A8A" />}
                  </button>

                  {qrActivo === c.id && (
                    <div className="px-4 pb-4 flex flex-col items-center gap-3"
                      style={{ background:'white' }}>
                      <div className="p-4 rounded-2xl"
                        style={{ background:'#FAF5FF', border:'1px solid #E8D4F8' }}>
                        <QRCodeSVG
                          value={`${window.location.origin}/trazabilidad/${c.qr_codigo}`}
                          size={140}
                          bgColor="#FAF5FF"
                          fgColor="#3D1A5C"
                          level="M"
                        />
                      </div>
                      <p className="text-xs font-mono text-center" style={{ color:'#6B3A8A' }}>
                        {c.qr_codigo}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}