import { useState, useEffect } from "react";
import { updateUserRequest } from "../api/users";
import { AlertCircle } from "lucide-react";

export default function EditUserModal({ isOpen, onClose, user, onUpdate }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        password: "", // Contraseña vacía por defecto
      });
      setError(null);
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setError(null);
    setLoading(true);

    try {
      // Solo enviamos la contraseña si se escribió algo
      const payload = { email: formData.email };
      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      const res = await updateUserRequest(user.id, payload);
      onUpdate(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar usuario");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-zinc-900/60 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800/90 backdrop-blur-xl border border-zinc-700/50 p-5 rounded-2xl max-w-sm w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Editar Usuario</h2>
            <p className="text-red-400 text-xs">Modifica las credenciales</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
            aria-label="Cerrar modal"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-300 text-xs font-semibold mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-zinc-700/50 border border-zinc-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-xs font-semibold mb-1">
              Nueva Contraseña (Opcional)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Dejar en blanco para no cambiar"
              className="w-full bg-zinc-700/50 border border-zinc-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder:text-gray-500"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-2 rounded-xl transition-colors text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-xl transition-colors text-sm disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
