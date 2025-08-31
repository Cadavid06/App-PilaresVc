import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

function ProtectedRoutes() {
  const {user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <h1>Cargando...</h1>;

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
}

export default ProtectedRoutes;
