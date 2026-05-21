import { useNavigate } from 'react-router-dom';
import { User, Star, MapPin, Award, LogOut, TrendingUp } from 'lucide-react';

export default function PerfilCatador({ usuario, data, logout }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">

      {/* Hero perfil */}
      <div className="rounded-3xl overflow-hidden"
        style={{ boxShadow:'0 8px 32px rgba(138,98,0,0.3)' }}>
        <div className="px-5 py-8 flex flex-col items-center text-center"
          style={{ background:'linear-gradient(135deg, #5C4000 0%, #8A6200 100%)' }}>
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4 font-serif font-bold"
            style={{
              background:'rgba(255,255,255,0.15)', color:'white', fontSize:'40px',
              border:'3px solid rgba(255,255,255,0.2)',
              boxShadow:'0 8px 24px rgba(0,0,0,0.3)'
            }}>
            {usuario?.nombre?.charAt(0).toUpperCase()}
          </div>
          <h2 className="font-serif text-white text-2xl font-bold">{usuario?.nombre}</h2>
          <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.6)' }}>{usuario?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            <span className="text-xs" style={{ color:'rgba(255,255,255,0.5)' }}>Catador SCA activo</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 w-full">
            {[
              { label:'Cataciones',     value: data?.stats?.total_cataciones || 0 },
              { label:'Puntaje prom.',  value: data?.stats?.promedio_puntaje ? `${data.stats.promedio_puntaje}` : '—' },
            ].map((s,i) => (
              <div key={i} className="rounded-2xl p-3 text-center"
                style={{ background:'rgba(255,255,255,0.1)' }}>
                <p className="font-serif font-bold text-white text-2xl">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.5)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background:'white', border:'1px solid #E2E8F0' }}>
        {[
          { label:'Nombre',    value: usuario?.nombre,                       icon: User   },
          { label:'Correo',    value: usuario?.email,                        icon: Star   },
          { label:'Municipio', value: usuario?.municipio || 'No registrado', icon: MapPin },
          { label:'Rol',       value: 'Catador SCA',                         icon: Award  },
        ].map((item,i,arr) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4"
            style={{ borderBottom: i < arr.length-1 ? '1px solid #F8F9FA':'none' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:'#FFF8E1' }}>
              <item.icon size={14} color="#8A6200" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-stone-400 font-medium">{item.label}</p>
              <p className="text-sm font-semibold text-stone-700 truncate">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Protocolo SCA card */}
      <div className="rounded-2xl p-5"
        style={{ background:'white', border:'1.5px solid #FFE082' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:'#FFF8E1' }}>
            <TrendingUp size={15} color="#8A6200" />
          </div>
          <p className="font-serif font-bold text-stone-800">Mi especialidad</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['Especialidad SCA', 'Protocolo Q-grader', 'Análisis sensorial', 'Trazabilidad'].map((s,i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background:'#FFF8E1' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background:'#D4A847' }} />
              <span className="text-xs text-stone-600">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cerrar sesión */}
      <button onClick={() => { logout(); navigate('/login'); }}
        className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold"
        style={{ background:'#FEF2F2', color:'#DC2626', border:'1.5px solid #FECACA' }}>
        <LogOut size={16} />
        Cerrar sesión
      </button>
    </div>
  );
}
