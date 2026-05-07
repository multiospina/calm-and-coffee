import { X, User, Coffee, MapPin, Award, Star, Zap } from 'lucide-react';

const NIVELES = ['Curioso', 'Explorador', 'Conocedor', 'Entendido', 'Maestro Catador'];

const NIVEL_COLOR = [
  { bg:'#F1F0EE', text:'#4A5568', borde:'#E2E8F0' },
  { bg:'#EDFAF4', text:'#1D7A4E', borde:'#A8E8CC' },
  { bg:'#EBF2FF', text:'#1B4F8A', borde:'#C2D6F8' },
  { bg:'#F3EEF5', text:'#6B3A8A', borde:'#D4B8E8' },
  { bg:'#FFF8E1', text:'#8A6200', borde:'#FFE082' },
];

const NIVEL_ICON = [Coffee, Zap, Star, Award, Award];

export default function PerfilCliente({ pedido, perfil, cargando, onCerrar }) {
  if (!pedido) return null;

  const nivel      = perfil?.pasaporte?.nivel || 0;
  const nivelInfo  = NIVEL_COLOR[nivel] || NIVEL_COLOR[0];
  const NivelIcon  = NIVEL_ICON[nivel] || Coffee;
  const progreso   = nivel < 4
    ? Math.min((perfil?.pasaporte?.puntos || 0) / [50,150,350,700,9999][nivel] * 100, 100)
    : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>

      <div className="w-full max-w-sm rounded-3xl overflow-hidden animate-slide-up"
        style={{ background:'white', boxShadow:'0 32px 80px rgba(0,0,0,0.25)' }}>

        {/* ── HEADER ──────────────────────────── */}
        <div className="relative px-6 pt-6 pb-5 overflow-hidden"
          style={{ background:'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)' }}>

          {/* Círculo decorativo */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
            style={{ background:'white' }} />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full opacity-10"
            style={{ background:'white' }} />

          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-bold text-xl flex-shrink-0"
                style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.2)' }}>
                {pedido.nombre_cliente?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-serif font-bold text-white text-lg leading-tight">
                  {pedido.nombre_cliente}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background:'rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.8)' }}>
                    {pedido.mesa}
                  </span>
                  {perfil?.pasaporte && (
                    <span className="text-xs font-medium" style={{ color:'rgba(255,255,255,0.6)' }}>
                      {NIVELES[nivel]}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onCerrar}
              className="p-2 rounded-xl flex-shrink-0"
              style={{ background:'rgba(255,255,255,0.1)', color:'white' }}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-3 max-h-96 overflow-y-auto">

          {/* ── PEDIDO ACTUAL ───────────────────── */}
          <div className="rounded-2xl p-4"
            style={{ background:'#FFF0EB', border:'1.5px solid #FECACA' }}>
            <p className="text-xs font-bold mb-2 tracking-wider" style={{ color:'#C0350F' }}>
              PEDIDO ACTUAL
            </p>
            <p className="font-serif font-bold text-stone-800 text-base mb-2">
              {pedido.nombre_cafe}
            </p>
            <div className="flex gap-2 flex-wrap">
              {pedido.variedad && (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background:'#F3EEF5', color:'#6B3A8A' }}>
                  {pedido.variedad}
                </span>
              )}
              {pedido.proceso && (
                <span className="text-xs px-2.5 py-1 rounded-full capitalize font-medium"
                  style={{ background:'#EBF2FF', color:'#1B4F8A' }}>
                  {pedido.proceso}
                </span>
              )}
            </div>
            {pedido.notas_cliente && (
              <div className="mt-3 pt-3 flex items-start gap-2"
                style={{ borderTop:'1px solid #FECACA' }}>
                <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background:'rgba(192,53,15,0.1)' }}>
                  <Coffee size={10} color="#C0350F" />
                </div>
                <p className="text-xs italic" style={{ color:'#C0350F' }}>
                  {pedido.notas_cliente}
                </p>
              </div>
            )}
          </div>

          {/* ── LOADER ──────────────────────────── */}
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-7 h-7 border-2 border-gray-200 border-t-stone-500 rounded-full animate-spin" />
              <p className="text-xs text-stone-300">Cargando perfil...</p>
            </div>
          ) : perfil ? (
            <>
              {/* ── PASAPORTE ───────────────────── */}
              <div className="rounded-2xl p-4"
                style={{ background:nivelInfo.bg, border:`1.5px solid ${nivelInfo.borde}` }}>
                <p className="text-xs font-bold mb-3 tracking-wider" style={{ color:nivelInfo.text }}>
                  PASAPORTE CAFETERO
                </p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background:`${nivelInfo.text}18` }}>
                      <NivelIcon size={18} color={nivelInfo.text} />
                    </div>
                    <div>
                      <p className="font-serif font-bold text-stone-800">
                        {NIVELES[nivel]}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color:nivelInfo.text }}>
                        {perfil.pasaporte.puntos} pts · {perfil.pasaporte.cafes_catados} cafés catados
                      </p>
                    </div>
                  </div>
                </div>

                {/* Barra de progreso del nivel */}
                {nivel < 4 && (
                  <div>
                    <div className="w-full h-1.5 rounded-full" style={{ background:`${nivelInfo.text}20` }}>
                      <div className="h-1.5 rounded-full transition-all"
                        style={{ width:`${progreso}%`, background:nivelInfo.text }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color:`${nivelInfo.text}99` }}>
                      {Math.round(progreso)}% hacia {NIVELES[nivel + 1]}
                    </p>
                  </div>
                )}
              </div>

              {/* ── PREFERENCIAS ────────────────── */}
              {perfil.preferencias && (
                <div className="rounded-2xl p-4"
                  style={{ background:'#F8F9FA', border:'1px solid #E2E8F0' }}>
                  <p className="text-xs font-bold mb-2 tracking-wider text-stone-400">PREFIERE</p>
                  <div className="flex flex-wrap gap-1.5">
                    {perfil.preferencias.intensidad && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                        style={{ background:'#FFF0EB', color:'#C0350F', border:'1px solid #FECACA' }}>
                        {perfil.preferencias.intensidad.replace('_', ' ')}
                      </span>
                    )}
                    {perfil.preferencias.sabores_favoritos?.map((s, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full capitalize"
                        style={{ background:'#FAF6F0', color:'#92400e', border:'1px solid #E8D9B8' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STATS ───────────────────────── */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label:'Catas',      value: perfil.pasaporte.cafes_catados       || 0, icon: Coffee, color:'#C0350F', bg:'#FFF0EB', borde:'#FECACA' },
                  { label:'Puntos',     value: perfil.pasaporte.puntos              || 0, icon: Award,  color:'#8A6200', bg:'#FFF8E1', borde:'#FFE082' },
                  { label:'Cafeterías', value: perfil.pasaporte.cafeterias_visitadas|| 0, icon: MapPin, color:'#1B4F8A', bg:'#EBF2FF', borde:'#C2D6F8' },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl p-3 text-center"
                    style={{ background:s.bg, border:`1px solid ${s.borde}` }}>
                    <s.icon size={15} color={s.color} className="mx-auto mb-1.5" />
                    <p className="font-serif font-bold text-xl leading-none" style={{ color:s.color }}>
                      {s.value}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background:'#F8F9FA' }}>
                <User size={20} color="#CBD5E0" />
              </div>
              <p className="text-stone-400 text-sm font-medium">Sin datos del cliente</p>
              <p className="text-stone-300 text-xs">El cliente no ha completado su perfil</p>
            </div>
          )}

          {/* ── BOTÓN CERRAR ────────────────────── */}
          <button onClick={onCerrar}
            className="w-full py-3 rounded-2xl text-sm font-medium transition"
            style={{ background:'#F8F9FA', color:'#4A5568', border:'1px solid #E2E8F0' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}