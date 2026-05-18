import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut, RefreshCw, Users,
  LayoutDashboard, ShoppingBag,
  UtensilsCrossed, Clock, Settings
} from 'lucide-react';
import api from '../../api/axios';

import HeroCafeteria    from './components/HeroCafeteria';
import MetricasGerente  from './components/MetricasGerente';
import QRMesas          from './components/QRMesas';
import RankingCafes     from './components/RankingCafes';
import GestionMenu      from './components/GestionMenu';
import GestionTurnos    from './components/GestionTurnos';
import PedidosHoy       from './components/PedidosHoy';
import CosechasGerente  from './components/CosechasGerente';
import EquipoBaristas   from './components/EquipoBaristas';
import VisionGeneral    from './components/VisionGeneral';
import GraficaVentas    from './components/GraficaVentas';

const TABS = [
  { id:'dashboard', label:'Dashboard', icon: LayoutDashboard },
  { id:'pedidos',   label:'Pedidos',   icon: ShoppingBag     },
  { id:'menu',      label:'Menú',      icon: UtensilsCrossed },
  { id:'turnos',    label:'Turnos',    icon: Clock           },
  { id:'equipo',    label:'Equipo',    icon: Users           },
  { id:'config',    label:'Config',    icon: Settings        },
];

export default function GerenteDashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [tab,      setTab]      = useState('dashboard');
  const [data,     setData]     = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const res = await api.get('/gerente/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background:'#EBF2FF' }}>

      {/* ── NAVBAR ───────────────────────────────── */}
      <nav className="sticky top-0 z-20"
        style={{ background:'#1B4F8A', boxShadow:'0 2px 16px rgba(27,79,138,0.3)' }}>
        <div className="max-w-2xl mx-auto px-4">

          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="logo"
                className="w-8 h-8 object-contain rounded-lg" />
              <div>
                <span className="font-serif text-white text-sm font-semibold">
                  {data?.cafeteria?.nombre || 'Calm and Coffee'}
                </span>
                <span className="text-xs ml-2" style={{ color:'rgba(255,255,255,0.4)' }}>
                  · Gerente
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={cargarDatos}
                className="p-1.5 rounded-lg"
                style={{ background:'rgba(255,255,255,0.12)' }}>
                <RefreshCw size={13} color="white" />
              </button>
              <span className="text-blue-200 text-xs hidden sm:block">
                {usuario?.nombre?.split(' ')[0]}
              </span>
              <button onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-white"
                style={{ background:'rgba(255,255,255,0.12)' }}>
                <LogOut size={11} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto" style={{ scrollbarWidth:'none' }}>
            {TABS.map(t => (
              <button key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium flex-shrink-0 transition-all"
                style={{
                  color:        tab === t.id ? 'white' : 'rgba(255,255,255,0.4)',
                  borderBottom: tab === t.id ? '2px solid white' : '2px solid transparent',
                  background:   'transparent',
                }}>
                <t.icon size={13} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── CONTENIDO ───────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {cargando ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── DASHBOARD ─────────────────────── */}
            {tab === 'dashboard' && (
              <div className="space-y-4">
                <HeroCafeteria
                  cafeteria={data?.cafeteria}
                  onActualizar={cargarDatos}
                />
                <MetricasGerente metricas={data?.metricas} />
                <GraficaVentas />
                <RankingCafes topCafes={data?.top_cafes} />
              </div>
            )}

            {/* ── PEDIDOS ───────────────────────── */}
            {tab === 'pedidos' && (
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden"
                  style={{ boxShadow:'0 4px 24px rgba(27,79,138,0.1)' }}>
                  <div className="px-5 py-5"
                    style={{ background:'linear-gradient(135deg, #0F3366 0%, #1B4F8A 100%)' }}>
                    <p className="text-xs font-bold tracking-widest mb-1"
                      style={{ color:'rgba(255,255,255,0.5)' }}>
                      ACTIVIDAD EN TIEMPO REAL
                    </p>
                    <h2 className="font-serif text-white text-xl font-bold">
                      Pedidos de hoy
                    </h2>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.6)' }}>
                      {data?.cafeteria?.nombre}
                    </p>
                  </div>
                </div>
                <PedidosHoy />
              </div>
            )}

            {/* ── MENÚ ──────────────────────────── */}
            {tab === 'menu' && (
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden"
                  style={{ boxShadow:'0 4px 24px rgba(29,122,78,0.1)' }}>
                  <div className="px-5 py-5"
                    style={{ background:'linear-gradient(135deg, #0F4A2E 0%, #1D7A4E 100%)' }}>
                    <p className="text-xs font-bold tracking-widest mb-1"
                      style={{ color:'rgba(255,255,255,0.5)' }}>
                      GESTIÓN DE CARTA
                    </p>
                    <h2 className="font-serif text-white text-xl font-bold">
                      Menú y stock
                    </h2>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.6)' }}>
                      Añade, edita y gestiona los cafés disponibles
                    </p>
                  </div>
                </div>
                <GestionMenu />
                <CosechasGerente />
              </div>
            )}

            {/* ── TURNOS ────────────────────────── */}
            {tab === 'turnos' && (
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden"
                  style={{ boxShadow:'0 4px 24px rgba(27,79,138,0.1)' }}>
                  <div className="px-5 py-5"
                    style={{ background:'linear-gradient(135deg, #1B4F8A 0%, #2E7BC4 100%)' }}>
                    <p className="text-xs font-bold tracking-widest mb-1"
                      style={{ color:'rgba(255,255,255,0.5)' }}>
                      EQUIPO DE TRABAJO
                    </p>
                    <h2 className="font-serif text-white text-xl font-bold">
                      Turnos y baristas
                    </h2>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.6)' }}>
                      Gestiona tu equipo y programa los turnos
                    </p>
                  </div>
                </div>
                <GestionTurnos />
              </div>
            )}

            {/* ── EQUIPO ────────────────────────── */}
            {tab === 'equipo' && (
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden"
                  style={{ boxShadow:'0 4px 24px rgba(27,79,138,0.1)' }}>
                  <div className="px-5 py-5"
                    style={{ background:'linear-gradient(135deg, #0F3366 0%, #1B4F8A 100%)' }}>
                    <p className="text-xs font-bold tracking-widest mb-1"
                      style={{ color:'rgba(255,255,255,0.5)' }}>
                      VISIÓN GENERAL
                    </p>
                    <h2 className="font-serif text-white text-xl font-bold">
                      Mi equipo hoy
                    </h2>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.6)' }}>
                      Estado en tiempo real de todos tus baristas
                    </p>
                  </div>
                </div>
                <VisionGeneral />
                <div className="rounded-2xl p-5"
                  style={{ background:'white', border:'1px solid #E2E8F0' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background:'#EBF2FF' }}>
                      <Users size={15} color="#1B4F8A" />
                    </div>
                    <div>
                      <p className="font-serif font-bold text-stone-800">Gestión del equipo</p>
                      <p className="text-xs text-stone-400">Crea y administra tus baristas</p>
                    </div>
                  </div>
                  <EquipoBaristas />
                </div>
              </div>
            )}

            {/* ── CONFIG ────────────────────────── */}
            {tab === 'config' && (
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden"
                  style={{ boxShadow:'0 4px 24px rgba(107,58,138,0.1)' }}>
                  <div className="px-5 py-5"
                    style={{ background:'linear-gradient(135deg, #3D1A5C 0%, #6B3A8A 100%)' }}>
                    <p className="text-xs font-bold tracking-widest mb-1"
                      style={{ color:'rgba(255,255,255,0.5)' }}>
                      CONFIGURACIÓN
                    </p>
                    <h2 className="font-serif text-white text-xl font-bold">
                      Mi cafetería
                    </h2>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.6)' }}>
                      QR de mesas, información y ajustes
                    </p>
                  </div>
                </div>
                <HeroCafeteria
                  cafeteria={data?.cafeteria}
                  onActualizar={cargarDatos}
                />
                <QRMesas
                  cafeteria={data?.cafeteria}
                  onActualizar={cargarDatos}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}