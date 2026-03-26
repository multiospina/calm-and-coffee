import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RutaProtegida = ({ children, rol }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-caficultor-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;

  if (rol && !usuario.roles?.includes(rol)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RutaProtegida;