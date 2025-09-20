import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Menu, X, Volleyball, UserPlus, LogOut, Plus } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-gradient-to-r from-red-800/80 via-red-950/80 to-red-800/80 backdrop-blur-xl border border-red-500/20 my-4 mx-4 rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <Volleyball className="w-8 h-8 text-red-400" />
          <span className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
            Pilares Voleibol Club
          </span>
        </Link>

        {/* Botón menú móvil */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden text-red-300 hover:text-red-100 focus:outline-none"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Links (desktop) */}
        <ul className="hidden sm:flex items-center gap-6">
          <li>
            <Link
              to="/add-memberships"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg transition-all duration-200 shadow-md"
            >
              <Plus size={20} />
              Añadir jugador
            </Link>
          </li>
          <li>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg transition-all duration-200 shadow-md"
            >
              <UserPlus size={18} />
              Añadir admin
            </Link>
          </li>
          <li>
            <Link
              onClick={logout}
              className="inline-flex items-center gap-2 text-red-300 hover:text-white transition-all duration-200"
            >
              <LogOut size={22} />
              Cerrar sesión
            </Link>
          </li>
        </ul>
      </div>

      {/* Links (mobile) */}
      {isOpen && (
        <ul className="flex flex-col gap-3 px-6 pb-4 sm:hidden">
          <li>
            <Link
              to="/memberships"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-2 w-full text-white font-semibold px-5 py-3 rounded-lg transition-all duration-200 bg-red-600 hover:bg-red-700 shadow-lg"
            >
              Jugadores
            </Link>
          </li>
          <li>
            <Link
              to="/add-memberships"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-2 w-full text-white font-semibold px-5 py-3 rounded-lg transition-all duration-200 bg-red-600 hover:bg-red-700 shadow-lg"
            >
              <Plus size={20} />
              Añadir jugador
            </Link>
          </li>
          <li>
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-2 w-full text-white font-semibold px-5 py-3 rounded-lg transition-all duration-200 bg-red-600 hover:bg-red-700 shadow-lg"
            >
              <UserPlus size={20} />
              Añadir admin
            </Link>
          </li>
          <li>
            <Link
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="inline-flex items-center justify-center gap-2 w-full text-red-300 hover:text-white transition-all duration-200 px-5 py-3 rounded-lg border border-red-500/30"
            >
              <LogOut size={20} />
              Cerrar sesión
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}