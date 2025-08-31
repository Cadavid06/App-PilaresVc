import { useState, useEffect } from "react";
import { useMembership } from "../context/MembershipContext";

export default function UpdateModals({ isOpen, onClose, membership }) {
  const { updateMembership, errors: membershipErrors } = useMembership();

  const [formData, setFormData] = useState({
    clientName: "",
    clientDocument: "",
    clientPhone: "",
  });

  useEffect(() => {
    if (membership) {
      setFormData({
        clientName: membership.clientName || "",
        clientDocument: membership.clientDocument || "",
        clientPhone: membership.clientPhone || "",
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
      <div className="bg-zinc-800/90 backdrop-blur-xl border border-zinc-700/50 p-6 rounded-2xl max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Actualizar Cliente
            </h2>
            <p className="text-red-400 text-sm">
              Modifica los datos del cliente
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-zinc-700/50 rounded-full p-2 transition-all duration-200"
          >
            <svg
              className="w-6 h-6"
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
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{membershipErrors.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-red-400 mb-2">
              Nombre del Cliente
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="w-full bg-zinc-700/50 text-white px-4 py-3 rounded-xl border border-zinc-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-red-400 mb-2">
              Documento
            </label>
            <input
              type="text"
              name="clientDocument"
              value={formData.clientDocument}
              onChange={handleChange}
              className="w-full bg-zinc-700/50 text-white px-4 py-3 rounded-xl border border-zinc-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-red-400 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              className="w-full bg-zinc-700/50 text-white px-4 py-3 rounded-xl border border-zinc-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
              required
            />
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg shadow-red-500/25"
            >
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
