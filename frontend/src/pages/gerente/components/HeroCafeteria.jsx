import { useState } from 'react';
import { MapPin, Star, Coffee, Edit2, Check, X } from 'lucide-react';
import api from '../../../api/axios';

export default function HeroCafeteria({ cafeteria, onActualizar }) {
  const [editando,    setEditando]    = useState(false);
  const [guardando,   setGuardando]   = useState(false);
  const [form,        setForm]        = useState({
    descripcion: cafeteria?.descripcion || '',
    horario:     cafeteria?.horario     || '',
  });

  const guardar = async () => {
    setGuardando(true);
    try {
      await api.put('/gerente/cafeteria', form);
      onActualizar && onActualizar();
      setEditando(false);
    } catch (err) {
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  if (!cafeteria) return null;

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ boxShadow:'0 4px 24px rgba(27,79,138,0.12)' }}>

      {/* Banner */}
      <div className="px-6 py-8 relative overflow-hidden"
        style={{ background:'linear-gradient(135deg, #0F3366 0%, #1B4F8A 60%, #5B9BD5 100%)' }}>
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10"
          style={{ background:'white' }} />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-10"
          style={{ background:'white' }} />

        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium" style={{ color:'rgba(255,255,255,0.6)' }}>
                Cafetería activa
              </span>
            </div>
            <h1 className="font-serif text-white text-3xl font-bold mb-2">
              {cafeteria.nombre}
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} color="rgba(255,255,255,0.6)" />
                <span className="text-sm" style={{ color:'rgba(255,255,255,0.7)' }}>
                  {cafeteria.municipio}
                </span>
              </div>
              {cafeteria.rating_promedio && (
                <div className="flex items-center gap-1.5">
                  <Star size={13} color="#FFE082" fill="#FFE082" />
                  <span className="text-sm font-bold" style={{ color:'#FFE082' }}>
                    {cafeteria.rating_promedio}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Coffee size={13} color="rgba(255,255,255,0.6)" />
                <span className="text-sm" style={{ color:'rgba(255,255,255,0.7)' }}>
                  {cafeteria.total_items_menu} cafés en carta
                </span>
              </div>
            </div>
          </div>

          <button onClick={() => setEditando(!editando)}
            className="p-2.5 rounded-xl transition flex-shrink-0"
            style={{ background:'rgba(255,255,255,0.15)', color:'white' }}>
            <Edit2 size={15} />
          </button>
        </div>
      </div>

      {/* Info editable */}
      <div className="p-5" style={{ background:'white' }}>
        {editando ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Descripción
              </label>
              <textarea
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion:e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 rounded-2xl text-sm text-stone-700 outline-none resize-none"
                style={{ background:'#F0F6FF', border:'1.5px solid #C2D6F8' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Horario
              </label>
              <input
                value={form.horario}
                onChange={e => setForm(f => ({ ...f, horario:e.target.value }))}
                placeholder="Lun-Vie 7am-6pm, Sáb 8am-4pm"
                className="w-full px-4 py-3 rounded-2xl text-sm text-stone-700 outline-none"
                style={{ background:'#F0F6FF', border:'1.5px solid #C2D6F8' }}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditando(false)}
                className="flex-1 py-2.5 rounded-2xl text-sm font-medium flex items-center justify-center gap-1.5"
                style={{ background:'#F8F9FA', color:'#4A5568', border:'1px solid #E2E8F0' }}>
                <X size={13} /> Cancelar
              </button>
              <button onClick={guardar} disabled={guardando}
                className="flex-1 py-2.5 rounded-2xl text-sm font-medium text-white flex items-center justify-center gap-1.5"
                style={{ background: guardando ? '#CBD5E0' : '#1B4F8A' }}>
                <Check size={13} /> {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {cafeteria.descripcion && (
              <p className="text-stone-500 text-sm leading-relaxed">{cafeteria.descripcion}</p>
            )}
            {cafeteria.horario && (
              <p className="text-xs font-medium" style={{ color:'#1B4F8A' }}>
                {cafeteria.horario}
              </p>
            )}
            {cafeteria.direccion && (
              <p className="text-xs text-stone-400">{cafeteria.direccion}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}