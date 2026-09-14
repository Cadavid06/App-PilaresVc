import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Menu, X, Volleyball, LogOut, Plus, Settings, Users } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) return null;
  
  const isAdmin = user?.role === "admin";

  return (
    <nav className="bg-zinc-800/90 backdrop-blur-sm border border-zinc-700/50 my-4 mx-4 rounded-xl shadow-lg">
      <div className="flex justify-between items-center px-6 py-3">
        <Link to="/memberships" className="flex items-center gap-3">
          <div className="p-1.5 bg-red-600 rounded-lg">
            <Volleyball className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-bold text-white hidden sm:block">
            Pilares VC
          </span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden text-gray-400 hover:text-white focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className="hidden sm:flex items-center gap-1">
          <li>
            <Link
              to="/memberships"
              className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white hover:bg-zinc-700/50 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Membresías
            </Link>
          </li>
          <li>
            <Link
              to="/add-memberships"
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
            >
              <Plus size={16} />
              Nuevo jugador
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link
                to="/users"
                className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white hover:bg-zinc-700/50 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              >
                <Users size={16} />
                Usuarios
              </Link>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white hover:bg-zinc-700/50 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              >
                <Settings size={16} />
              </Link>
            </li>
          )}
          <li className="ml-2 border-l border-zinc-700 pl-2">
            <span className="text-xs text-gray-500 mr-2">{user?.email}</span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-red-400 px-2 py-2 rounded-lg text-sm transition-all"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </li>
        </ul>
      </div>

      {isOpen && (
        <div className="sm:hidden border-t border-zinc-700/50 px-4 py-3 space-y-1">
          <Link
            to="/memberships"
            onClick={() => setIsOpen(false)}
            className="block text-gray-300 hover:text-white hover:bg-zinc-700/50 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          >
            Membresías
          </Link>
          <Link
            to="/add-memberships"
            onClick={() => setIsOpen(false)}
            className="block bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all text-center"
          >
            Nuevo jugador
          </Link>
          {isAdmin && (
            <Link
              to="/users"
              onClick={() => setIsOpen(false)}
              className="block text-gray-300 hover:text-white hover:bg-zinc-700/50 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Usuarios
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="block text-gray-300 hover:text-white hover:bg-zinc-700/50 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Configuración
            </Link>
          )}
          <div className="border-t border-zinc-700/50 pt-2 mt-2">
            <div className="flex items-center justify-between px-3">
              <span className="text-xs text-gray-500">{user?.email}</span>
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="text-gray-400 hover:text-red-400 text-sm transition-all"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}