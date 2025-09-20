import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"
import { Menu, X, Volleyball } from "lucide-react" 


export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!isAuthenticated) return null

  return (
    <nav className="bg-gradient-to-r from-red-800 via-red-950 to-red-800 backdrop-blur-xl border border-red-500/20 my-4 mx-4 rounded-2xl shadow-2xl">
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
        <ul className="hidden sm:flex gap-4">
          <li>
            <Link
              to="/add-memberships"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold px-5 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Añadir jugadores
            </Link>
          </li>

          <li>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold px-5 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Registrar admin
            </Link>
          </li>

          <li>
            <Link
              onClick={logout}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold px-5 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </Link>
          </li>
        </ul>
      </div>

      {/* Links (mobile) */}
      {isOpen && (
        <ul className="flex flex-col gap-3 px-6 pb-4 sm:hidden">
          <li>
            <Link
              to="/add-memberships"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-2 justify-center bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold px-5 py-3 rounded-lg transition-all duration-200 shadow-lg"
            >
              Añadir jugadores
            </Link>
          </li>

          <li>
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-2 justify-center bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold px-5 py-3 rounded-lg transition-all duration-200 shadow-lg"
            >
              Registrar admin
            </Link>
          </li>

          <li>
            <Link
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              className="inline-flex items-center gap-2 justify-center bg-gray-700/50 hover:bg-red-600/80 text-gray-200 hover:text-white font-semibold px-5 py-3 rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-red-500/30"
            >
              Logout
            </Link>
          </li>
        </ul>
      )}
    </nav>
  )
}

