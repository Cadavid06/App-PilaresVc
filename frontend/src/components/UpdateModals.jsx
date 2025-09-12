import { useState, useEffect } from "react";
import { useMembership } from "../context/MembershipContext"; // <-- el hook real

export default function UpdateModals({ isOpen, onClose, membership }) {
  const { updateMembership, errors: membershipErrors } = useMembership();

  const [formData, setFormData] = useState({
    clientName: "",
    documentType: "",
    clientDocument: "",
    clientPhone: "",
    clientEmail: "",
    birthdate: "",
  });

  useEffect(() => {
    if (membership) {
      setFormData({
        clientName: membership.clientName || "",
        documentType: membership.documentType || "",
        clientDocument: membership.clientDocument || "",
        clientPhone: membership.clientPhone || "",
        clientEmail: membership.clientEmail || "",
        birthdate: membership.birthdate
          ? new Date(membership.birthdate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [membership]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (membership?._id) {
      await updateMembership(membership._id, formData);
      onClose();
    }
  };

  if (!isOpen || !membership) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800/90 backdrop-blur-xl border border-zinc-700/50 p-4 rounded-2xl max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Actualizar Jugador</h2>
            <p className="text-red-400 text-xs">Modifica los datos del jugador</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-zinc-700/50 rounded-full p-2 transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {membershipErrors && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <p className="text-red-400 text-sm">{membershipErrors.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-red-400 mb-1">
              Nombre del jugador
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="w-full bg-zinc-700/50 text-white px-3 py-2 rounded-xl border border-zinc-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
              required
            />
          </div>

          {/* Tipo de documento */}
          <div>
            <label className="block text-xs font-semibold text-red-400 mb-1">
              Tipo de documento
            </label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              required
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
            >
              <option value="" className="bg-zinc-800 text-gray-400">
                Selecciona un tipo de documento
              </option>
              <option value="689a5bc060ac23972d5e7cf0">TI</option>
              <option value="689a5c4360ac23972d5e7cf2">CC</option>
              <option value="689a5c7e60ac23972d5e7cf4">CE</option>
            </select>
          </div>

          {/* Documento */}
          <div>
            <label className="block text-xs font-semibold text-red-400 mb-1">
              Documento
            </label>
            <input
              type="text"
              name="clientDocument"
              value={formData.clientDocument}
              onChange={handleChange}
              className="w-full bg-zinc-700/50 text-white px-3 py-2 rounded-xl border border-zinc-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
              required
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-semibold text-red-400 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              className="w-full bg-zinc-700/50 text-white px-3 py-2 rounded-xl border border-zinc-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
              required
            />
          </div>

          {/* Correo */}
          <div>
            <label className="block text-xs font-semibold text-red-400 mb-1">
              Correo
            </label>
            <input
              type="email"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              className="w-full bg-zinc-700/50 text-white px-3 py-2 rounded-xl border border-zinc-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
              required
            />
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label className="block text-xs font-semibold text-red-400 mb-1">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className="w-full bg-zinc-700/50 text-white px-3 py-2 rounded-xl border border-zinc-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
              required
            />
          </div>

          {/* Botón */}
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-2 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg shadow-red-500/25"
            >
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
