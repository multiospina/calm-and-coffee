import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RutaProtegida from './components/shared/RutaProtegida';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import ClienteCata from './pages/cliente/Cata';
import ClientePedido from './pages/cliente/Pedido';
import ClienteDashboard from './pages/cliente/Dashboard';
import ClienteQR        from './pages/cliente/Trazabilidad';
import ClientePasaporte from './pages/cliente/Pasaporte';
import ClienteHistorial from './pages/cliente/Historial';
import ClienteExplorar  from './pages/cliente/Explorar';

import CaficultorDashboard from './pages/caficultor/Dashboard';
import CaficultorFincas    from './pages/caficultor/Fincas';
import CaficultorCosechas  from './pages/caficultor/Cosechas';
import CaficultorCosecha   from './pages/caficultor/CosechaDetalle';

import BaristaDashboard from './pages/barista/Dashboard';
import GerenteDashboard from './pages/gerente/Dashboard';
import AdminDashboard   from './pages/admin/Dashboard';
import CatadorDashboard from './pages/catador/Dashboard';

import Onboarding from './pages/cliente/Onboarding';

import MenuMesa from './pages/publico/MenuMesa';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/trazabilidad/:qr" element={<ClienteQR />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/cliente" element={<RutaProtegida rol="cliente"><ClienteDashboard /></RutaProtegida>} />
          <Route path="/cliente/pasaporte" element={<RutaProtegida rol="cliente"><ClientePasaporte /></RutaProtegida>} />
          <Route path="/cliente/historial" element={<RutaProtegida rol="cliente"><ClienteHistorial /></RutaProtegida>} />
          <Route path="/cliente/explorar" element={<RutaProtegida rol="cliente"><ClienteExplorar /></RutaProtegida>} />
          <Route path="/cliente/pedido/:cafeteria_id/:item_id" element={<RutaProtegida rol="cliente"><ClientePedido /></RutaProtegida>} />
          <Route path="/cliente/pedidos/:pedido_id/cata" element={<RutaProtegida rol="cliente"><ClienteCata /></RutaProtegida>} />

          <Route path="/caficultor" element={<RutaProtegida rol="caficultor"><CaficultorDashboard /></RutaProtegida>} />
          <Route path="/caficultor/fincas" element={<RutaProtegida rol="caficultor"><CaficultorFincas /></RutaProtegida>} />
          <Route path="/caficultor/cosechas" element={<RutaProtegida rol="caficultor"><CaficultorCosechas /></RutaProtegida>} />
          <Route path="/caficultor/cosechas/:id" element={<RutaProtegida rol="caficultor"><CaficultorCosecha /></RutaProtegida>} />

          <Route path="/barista" element={<RutaProtegida rol="barista"><BaristaDashboard /></RutaProtegida>} />
          <Route path="/gerente" element={<RutaProtegida rol="gerente"><GerenteDashboard /></RutaProtegida>} />
          <Route path="/admin"   element={<RutaProtegida rol="admin"><AdminDashboard /></RutaProtegida>} />
          <Route path="/catador" element={<RutaProtegida rol="catador"><CatadorDashboard /></RutaProtegida>} />

          <Route path="/onboarding" element={<Onboarding />} />



          <Route path="/menu/:cafeteria_id/:mesa" element={<MenuMesa />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;