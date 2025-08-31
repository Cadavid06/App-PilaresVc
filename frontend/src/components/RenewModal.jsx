import { useForm } from "react-hook-form";
import { useMembership } from "../context/MembershipContext";

export default function RenewModal({ isOpen, onClose, membership }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { renewMembership, errors: membershipErrors } = useMembership();

  if (!isOpen || !membership) return null;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await renewMembership(membership._id, data);
      onClose();
    } catch (error) {
      console.error("Error en modal:", error);
    }
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <div className="bg-zinc-800/90 backdrop-blur-xl border border-zinc-700/50 text-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Renovar Membresía
              </h2>
              <p className="text-red-400 text-sm">
                Cliente: {membership.clientName}
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
              <p className="text-red-400 text-sm">
                {Array.isArray(membershipErrors)
                  ? membershipErrors.join(", ")
                  : membershipErrors.message || membershipErrors}
              </p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-red-400 mb-2">
                Tipo de Membresía
              </label>
              <select
                {...register("memberShipType", {
                  required: "Debes seleccionar una membresía",
                  validate: (value) =>
                    value !== "" || "Selecciona una membresía válida",
                })}
                className="w-full bg-zinc-700/50 text-white px-4 py-4 rounded-xl border border-zinc-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
              >
                <option value="">Selecciona una membresía</option>
                <option value="689a5bc060ac23972d5e7cf0">Diaria</option>
                <option value="689a5c4360ac23972d5e7cf2">Semanal</option>
                <option value="689a5c7e60ac23972d5e7cf4">Quincenal</option>
                <option value="689a5c9d60ac23972d5e7cf6">Mensual</option>
              </select>
              {errors.memberShipType && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.memberShipType.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-red-400 mb-2">
                Cantidad a Pagar
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400 font-bold">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("amount", {
                    required: "Cantidad a pagar requerida",
                  })}
                  className="w-full bg-zinc-700/50 text-white pl-8 pr-4 py-4 rounded-xl border border-zinc-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 text-lg font-semibold"
                />
              </div>
              {errors.amount && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg shadow-red-500/25"
              >
                Renovar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
