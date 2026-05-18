import { useState, useEffect } from 'react';
import {
  Coffee, Plus, Edit2, X, Check,
  ToggleLeft, ToggleRight, Search,
  AlertCircle, Star, Package
} from 'lucide-react';
import api from '../../../api/axios';

const TIPO_INFO = {
  bebida_cafe:    { label:'Bebida', color:'#C0350F', bg:'#FFF0EB' },
  producto_fisico:{ label:'Producto', color:'#1B4F8A', bg:'#EBF2FF' },
};

export default function GestionMenu() {
  const [menu,      setMenu]      = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [busqueda,  setBusqueda]  = useState('');
  const [filtro,    setFiltro]    = useState('todos');
  const [editando,  setEditando]  = useState(null);
  const [creando,   setCreando]   = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [toast,     setToast]     = useState(null);
  const [form,      setForm]      = useState({
    nombre:'', precio:'', stock:'', descripcion:'', tipo:'bebida_cafe'
  });
  const [formEdit, setFormEdit] = useState({});

  useEffect(() => { cargarMenu(); }, []);

  const cargarMenu = async () => {
    setCargando(true);
    try {
      const res = await api.get('/gerente/menu');
      setMenu(res.data.menu || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const mostrarToast = (msg, tipo='ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const crearItem = async () => {
    if (!form.nombre || !form.precio) return;
    setGuardando(true);
    try {
      await api.post('/gerente/menu', {
        ...form,
        precio: parseFloat(form.precio),
        stock:  parseInt(form.stock) || 0,
      });
      setCreando(false);
      setForm({ nombre:'', precio:'', stock:'', descripcion:'', tipo:'bebida_cafe' });
      mostrarToast(`"${form.nombre}" añadido al menú`);
      cargarMenu();
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error al crear', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const guardarEdicion = async () => {
    if (!editando) return;
    setGuardando(true);
    try {
      await api.put(`/gerente/menu/${editando.id}`, {
        nombre:      formEdit.nombre      || editando.nombre,
        precio:      parseFloat(formEdit.precio)  || editando.precio,
        stock:       formEdit.stock !== '' ? parseInt(formEdit.stock) : editando.stock,
        descripcion: formEdit.descripcion !== undefined ? formEdit.descripcion : editando.descripcion,
      });
      mostrarToast(`"${editando.nombre}" actualizado`);
      setEditando(null);
      setFormEdit({});
      cargarMenu();
    } catch (err) {
      mostrarToast('Error al actualizar', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const toggleActivo = async (item) => {
    try {
      await api.put(`/gerente/menu/${item.id}`, { activo: !item.activo });
      mostrarToast(`"${item.nombre}" ${!item.activo ? 'activado' : 'desactivado'}`);
      cargarMenu();
    } catch (err) {
      mostrarToast('Error', 'error');
    }
  };

  const menuFiltrado = menu.filter(item => {
    const porBusqueda = item.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const porFiltro   = filtro === 'todos'     ? true :
                        filtro === 'activos'   ? item.activo :
                        filtro === 'agotados'  ? item.stock === 0 :
                        filtro === 'inactivos' ? !item.activo : true;
    return porBusqueda && porFiltro;
  });

  const agotados  = menu.filter(m => m.stock === 0 && m.activo).length;
  const activos   = menu.filter(m => m.activo).length;
  const inactivos = menu.filter(m => !m.activo).length;

  return (
    <div className="space-y-4">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium"
          style={{
            background: toast.tipo==='ok' ? '#EDFAF4' : '#FEF2F2',
            border: `1px solid ${toast.tipo==='ok' ? '#A8E8CC' : '#FECACA'}`,
            color:  toast.tipo==='ok' ? '#1D7A4E' : '#DC2626',
            boxShadow:'0 8px 30px rgba(0,0,0,0.12)'
          }}>
          {toast.tipo==='ok' ? <Check size={15}/> : <AlertCircle size={15}/>}
          {toast.msg}
        </div>
      )}

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Activos',   value: activos,   color:'#1D7A4E', bg:'#EDFAF4', borde:'#A8E8CC' },
          { label:'Agotados',  value: agotados,  color:'#C0350F', bg:'#FFF0EB', borde:'#FECACA' },
          { label:'Inactivos', value: inactivos, color:'#94A3B8', bg:'#F8F9FA', borde:'#E2E8F0' },
        ].map((s,i) => (
          <button key={i}
            onClick={() => setFiltro(s.label.toLowerCase())}
            className="rounded-2xl p-3 text-center transition-all"
            style={{
              background: s.bg,
              border: `1.5px solid ${filtro===s.label.toLowerCase() ? s.color : s.borde}`,
              transform: filtro===s.label.toLowerCase() ? 'scale(1.03)' : 'scale(1)',
            }}>
            <p className="font-serif font-bold text-2xl" style={{ color:s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color:s.color }}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* Alerta agotados */}
      {agotados > 0 && (
        <div className="rounded-2xl p-3 flex items-center gap-3"
          style={{ background:'#FFF0EB', border:'1.5px solid #FECACA' }}>
          <AlertCircle size={16} color="#C0350F" />
          <p className="text-sm font-medium" style={{ color:'#C0350F' }}>
            {agotados} café{agotados>1?'s':''} agotado{agotados>1?'s':''} — actualiza el stock
          </p>
        </div>
      )}

      {/* Buscador + botón crear */}
      <div className="flex gap-2">
        <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-2xl"
          style={{ background:'white', border:'1px solid #E2E8F0' }}>
          <Search size={14} color="#94A3B8" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar café..."
            className="flex-1 text-sm outline-none bg-transparent text-stone-700 placeholder-stone-300"
          />
        </div>
        <button onClick={() => setCreando(!creando)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition"
          style={{
            background: creando ? '#FEF2F2' : '#1D7A4E',
            color:      creando ? '#DC2626' : 'white',
          }}>
          {creando ? <X size={15}/> : <Plus size={15}/>}
          {creando ? 'Cancelar' : 'Añadir'}
        </button>
      </div>

      {/* Filtros rápidos */}
      <div className="flex gap-2">
        {['todos','activos','agotados','inactivos'].map(f => (
          <button key={f}
            onClick={() => setFiltro(f)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition"
            style={{
              background: filtro===f ? '#1B4F8A' : '#F0F6FF',
              color:      filtro===f ? 'white'   : '#1B4F8A',
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* Formulario crear */}
      {creando && (
        <div className="rounded-2xl p-5 space-y-3"
          style={{ background:'#F0FFF8', border:'1.5px solid #A8E8CC' }}>
          <p className="text-xs font-bold tracking-wider" style={{ color:'#1D7A4E' }}>
            NUEVO CAFÉ AL MENÚ
          </p>

          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Nombre del café *"
              value={form.nombre}
              onChange={e => setForm(f=>({...f,nombre:e.target.value}))}
              className="px-3 py-2.5 rounded-xl text-sm outline-none col-span-2"
              style={{ background:'white', border:'1px solid #A8E8CC' }}
            />
            <input
              placeholder="Precio (COP) *"
              type="number"
              value={form.precio}
              onChange={e => setForm(f=>({...f,precio:e.target.value}))}
              className="px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background:'white', border:'1px solid #A8E8CC' }}
            />
            <input
              placeholder="Stock (tazas)"
              type="number"
              value={form.stock}
              onChange={e => setForm(f=>({...f,stock:e.target.value}))}
              className="px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background:'white', border:'1px solid #A8E8CC' }}
            />
            <input
              placeholder="Descripción"
              value={form.descripcion}
              onChange={e => setForm(f=>({...f,descripcion:e.target.value}))}
              className="px-3 py-2.5 rounded-xl text-sm outline-none col-span-2"
              style={{ background:'white', border:'1px solid #A8E8CC' }}
            />
          </div>

          {/* Tipo */}
          <div className="flex gap-2">
            {['bebida_cafe','producto_fisico'].map(t => (
              <button key={t}
                onClick={() => setForm(f=>({...f,tipo:t}))}
                className="flex-1 py-2 rounded-xl text-xs font-medium transition"
                style={{
                  background: form.tipo===t ? '#1D7A4E' : '#F8F9FA',
                  color:      form.tipo===t ? 'white'   : '#4A5568',
                }}>
                {t==='bebida_cafe' ? 'Bebida de café' : 'Producto físico'}
              </button>
            ))}
          </div>

          <button
            onClick={crearItem}
            disabled={guardando || !form.nombre || !form.precio}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white transition"
            style={{ background: guardando || !form.nombre || !form.precio ? '#CBD5E0' : '#1D7A4E' }}>
            {guardando ? 'Creando...' : '+ Añadir al menú'}
          </button>
        </div>
      )}

      {/* Lista */}
      {cargando ? (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" />
        </div>
      ) : menuFiltrado.length === 0 ? (
        <div className="rounded-2xl py-12 text-center"
          style={{ background:'white', border:'1px solid #E2E8F0' }}>
          <Coffee size={28} color="#E2E8F0" className="mx-auto mb-3" />
          <p className="text-stone-300 text-sm">Sin cafés en este filtro</p>
        </div>
      ) : (
        <div className="space-y-2">
          {menuFiltrado.map((item,i) => {
            const tipo = TIPO_INFO[item.tipo] || TIPO_INFO.bebida_cafe;
            const stockColor = item.stock === 0 ? '#DC2626' : item.stock <= 5 ? '#D4A847' : '#1D7A4E';
            const stockBg    = item.stock === 0 ? '#FEF2F2' : item.stock <= 5 ? '#FFF8E1' : '#EDFAF4';

            return (
              <div key={i} className="rounded-2xl overflow-hidden transition-all"
                style={{
                  background:'white',
                  border:`1.5px solid ${item.activo ? '#E2E8F0' : '#F1F0EE'}`,
                  opacity: item.activo ? 1 : 0.65,
                }}>

                {editando?.id === item.id ? (
                  /* ── MODO EDICIÓN ── */
                  <div className="p-4 space-y-3"
                    style={{ background:'#F0F6FF', borderBottom:'2px solid #C2D6F8' }}>
                    <p className="text-xs font-bold tracking-wider" style={{ color:'#1B4F8A' }}>
                      EDITANDO: {item.nombre}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        defaultValue={item.nombre}
                        onChange={e => setFormEdit(f=>({...f,nombre:e.target.value}))}
                        className="px-3 py-2 rounded-xl text-sm outline-none col-span-2"
                        style={{ background:'white', border:'1px solid #C2D6F8' }}
                      />
                      <input
                        defaultValue={item.precio}
                        type="number"
                        placeholder="Precio"
                        onChange={e => setFormEdit(f=>({...f,precio:e.target.value}))}
                        className="px-3 py-2 rounded-xl text-sm outline-none"
                        style={{ background:'white', border:'1px solid #C2D6F8' }}
                      />
                      <input
                        defaultValue={item.stock}
                        type="number"
                        placeholder="Stock"
                        onChange={e => setFormEdit(f=>({...f,stock:e.target.value}))}
                        className="px-3 py-2 rounded-xl text-sm outline-none"
                        style={{ background:'white', border:'1px solid #C2D6F8' }}
                      />
                      <input
                        defaultValue={item.descripcion}
                        placeholder="Descripción"
                        onChange={e => setFormEdit(f=>({...f,descripcion:e.target.value}))}
                        className="px-3 py-2 rounded-xl text-sm outline-none col-span-2"
                        style={{ background:'white', border:'1px solid #C2D6F8' }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditando(null); setFormEdit({}); }}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                        style={{ background:'#F8F9FA', color:'#4A5568' }}>
                        Cancelar
                      </button>
                      <button
                        onClick={guardarEdicion}
                        disabled={guardando}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                        style={{ background: guardando ? '#CBD5E0' : '#1B4F8A' }}>
                        {guardando ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── MODO NORMAL ── */
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: item.activo ? '#FFF0EB' : '#F1F0EE' }}>
                        <Coffee size={18} color={item.activo ? '#C0350F' : '#94A3B8'} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-serif font-bold text-stone-800 text-base leading-tight">
                              {item.nombre}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background:tipo.bg, color:tipo.color }}>
                                {tipo.label}
                              </span>
                              {item.variedad && (
                                <span className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ background:'#F3EEF5', color:'#6B3A8A' }}>
                                  {item.variedad}
                                </span>
                              )}
                              {item.rating && (
                                <div className="flex items-center gap-0.5">
                                  <Star size={10} color="#D4A847" fill="#D4A847" />
                                  <span className="text-xs font-medium" style={{ color:'#8A6200' }}>
                                    {item.rating}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => { setEditando(item); setFormEdit({}); }}
                              className="p-2 rounded-xl transition"
                              style={{ background:'#F0F6FF', color:'#1B4F8A' }}>
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => toggleActivo(item)}
                              className="p-2 rounded-xl transition"
                              style={{
                                background: item.activo ? '#EDFAF4' : '#F8F9FA',
                                color:      item.activo ? '#1D7A4E' : '#94A3B8'
                              }}>
                              {item.activo
                                ? <ToggleRight size={16} />
                                : <ToggleLeft  size={16} />}
                            </button>
                          </div>
                        </div>

                        {/* Descripción */}
                        {item.descripcion && (
                          <p className="text-stone-400 text-xs mt-1.5 leading-relaxed line-clamp-1">
                            {item.descripcion}
                          </p>
                        )}

                        {/* Precio + Stock */}
                        <div className="flex items-center justify-between mt-2 pt-2"
                          style={{ borderTop:'1px solid #F8F9FA' }}>
                          <p className="font-serif font-bold text-stone-700">
                            ${parseInt(item.precio).toLocaleString('es-CO')}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <Package size={11} color={stockColor} />
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ background:stockBg, color:stockColor }}>
                              {item.stock === 0 ? 'Agotado' : `${item.stock} tazas`}
                            </span>
                            {item.total_pedidos > 0 && (
                              <span className="text-xs text-stone-300">
                                · {item.total_pedidos} pedidos
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}