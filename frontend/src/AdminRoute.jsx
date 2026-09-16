import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

function AdminRoute() {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <h1>Cargando...</h1>;

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (user?.role !== "admin") return <Navigate to="/memberships" replace />;

  return <Outlet />;
}

export default AdminRoute;
