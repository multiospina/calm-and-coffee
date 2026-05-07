import { Thermometer, Droplets, Clock, Wind, ChevronRight, Coffee } from 'lucide-react';

const GUIAS = {
  'v60':       { temp:93, ratio:'1:15', tiempo:'3-4 min', molienda:'Media-fina',   pasos:['Precalienta el filtro y la taza','Vierte 50ml y espera 30s (bloom)','Vierte en espiral hasta 750ml','Disfruta en 3-4 minutos'] },
  'chemex':    { temp:94, ratio:'1:16', tiempo:'4-5 min', molienda:'Media-gruesa', pasos:['Dobla el filtro y precalienta','Vierte 60ml y espera 45s','Continúa en espiral lenta','Retira el filtro al terminar'] },
  'aeropress': { temp:85, ratio:'1:13', tiempo:'2-3 min', molienda:'Fina',         pasos:['Precalienta el émbolo','Agrega café y agua a 85°C','Remueve 10 segundos','Presiona lentamente en 30s'] },
  'prensa':    { temp:96, ratio:'1:15', tiempo:'4 min',   molienda:'Gruesa',       pasos:['Agrega café molido grueso','Vierte agua a 96°C','Tapa sin presionar 4 min','Presiona lentamente y sirve'] },
  'espresso':  { temp:92, ratio:'1:2',  tiempo:'25-30s',  molienda:'Muy fina',     pasos:['Dosa 18g y tamperiza uniform.','Extrae entre 25-30 segundos','El líquido debe ser color avellana','Sirve inmediatamente'] },
  'cold brew': { temp:4,  ratio:'1:8',  tiempo:'12-24h',  molienda:'Muy gruesa',   pasos:['Mezcla café con agua fría','Refrigera 12-24 horas','Filtra lentamente','Sirve sobre hielo'] },
};

const PROCESO_TIPS = {
  'lavado':   { tip:'Resalta acidez brillante y sabores limpios. Ideal para notas cítricas y florales.', color:'#1B4F8A', bg:'#EBF2FF' },
  'natural':  { tip:'Intensifica el dulzor y el cuerpo. Espera notas frutales pronunciadas.',           color:'#1D7A4E', bg:'#EDFAF4' },
  'honey':    { tip:'Balance entre lavado y natural. Dulzor moderado con buena acidez.',                color:'#8A6200', bg:'#FFF8E1' },
  'anaerobic':{ tip:'Fermentación controlada. Perfil complejo y único. Sirve con atención.',            color:'#6B3A8A', bg:'#F3EEF5' },
};

export default function GuiaPreparacion({ pedido }) {
  if (!pedido) return null;

  const metodo  = pedido.metodo_preparacion?.toLowerCase() || 'v60';
  const guia    = GUIAS[metodo] || GUIAS['v60'];
  const proceso = PROCESO_TIPS[pedido.proceso?.toLowerCase()] || PROCESO_TIPS['lavado'];

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ boxShadow:'0 4px 24px rgba(92,61,46,0.12)' }}>

      {/* Header grande */}
      <div className="px-6 py-5 relative overflow-hidden"
        style={{ background:'linear-gradient(135deg, #3A2018 0%, #92400e 60%, #C47A45 100%)' }}>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10"
          style={{ background:'white' }} />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full opacity-10"
          style={{ background:'white' }} />

        <div className="relative">
          <p className="text-xs font-bold tracking-widest mb-1"
            style={{ color:'rgba(255,220,150,0.7)' }}>
            PREPARANDO AHORA
          </p>
          <h2 className="font-serif text-white font-bold text-2xl leading-tight mb-3">
            {pedido.nombre_cafe}
          </h2>
          <div className="flex gap-2 flex-wrap">
            {pedido.variedad && (
              <span className="text-sm px-3 py-1 rounded-full font-medium"
                style={{ background:'rgba(255,255,255,0.15)', color:'white' }}>
                {pedido.variedad}
              </span>
            )}
            {pedido.proceso && (
              <span className="text-sm px-3 py-1 rounded-full font-medium capitalize"
                style={{ background:'rgba(255,255,255,0.15)', color:'white' }}>
                {pedido.proceso}
              </span>
            )}
            {pedido.nombre_finca && (
              <span className="text-sm px-3 py-1 rounded-full"
                style={{ background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)' }}>
                {pedido.nombre_finca}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4" style={{ background:'white' }}>

        {/* Parámetros grandes — fáciles de leer de lejos */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Thermometer, label:'Temperatura', value:`${guia.temp}°C`, color:'#C0350F', bg:'#FFF0EB', borde:'#FECACA' },
            { icon: Droplets,    label:'Ratio',       value: guia.ratio,      color:'#1B4F8A', bg:'#EBF2FF', borde:'#C2D6F8' },
            { icon: Clock,       label:'Tiempo',      value: guia.tiempo,     color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC' },
            { icon: Wind,        label:'Molienda',    value: guia.molienda,   color:'#8A6200', bg:'#FFF8E1', borde:'#FFE082' },
          ].map((p, i) => (
            <div key={i} className="rounded-2xl p-3 text-center"
              style={{ background:p.bg, border:`1.5px solid ${p.borde}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background:`${p.color}20` }}>
                <p.icon size={18} color={p.color} />
              </div>
              <p className="font-serif font-bold text-base leading-tight" style={{ color:p.color }}>
                {p.value}
              </p>
              <p className="text-stone-400 text-xs mt-1">{p.label}</p>
            </div>
          ))}
        </div>

        {/* Pasos de preparación */}
        <div className="rounded-2xl p-4"
          style={{ background:'#FAF6F0', border:'1px solid #E8D9B8' }}>
          <p className="text-xs font-bold text-stone-400 mb-3 tracking-wider">PASOS</p>
          <div className="space-y-2">
            {guia.pasos.map((paso, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5"
                  style={{ background:'#92400e', color:'white' }}>
                  {i + 1}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">{paso}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tip del proceso */}
        <div className="rounded-2xl px-4 py-3 flex items-start gap-3"
          style={{ background:proceso.bg, border:`1px solid ${proceso.color}30` }}>
          <Coffee size={15} color={proceso.color} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed" style={{ color:proceso.color }}>
            {proceso.tip}
          </p>
        </div>

        {/* Nota del cliente */}
        {pedido.notas_cliente && (
          <div className="rounded-2xl px-4 py-3"
            style={{ background:'#FFF8E1', border:'1.5px solid #FFE082' }}>
            <p className="text-xs font-bold mb-1" style={{ color:'#8A6200' }}>
              NOTA DEL CLIENTE
            </p>
            <p className="text-sm italic" style={{ color:'#5C3D2E' }}>
              {pedido.notas_cliente}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}