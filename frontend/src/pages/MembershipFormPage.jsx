import { useForm } from "react-hook-form";
import { useMembership } from "../context/MembershipContext";
import { useNavigate } from "react-router-dom";

function MembershipFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { createMembership, errors: membershipErrors } = useMembership();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    await createMembership(data);
    navigate("/memberships");
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 mb-5">
      <div className="bg-zinc-800/90 backdrop-blur-xl border border-zinc-700/50 text-white rounded-2xl shadow-2xl w-full max-w-lg p-8 mx-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">
            Registrar Membresía
          </h1>
          <p className="text-red-400 text-sm">
            Completa la información del cliente
          </p>
        </div>

        {membershipErrors && (
          <p className="text-red-500 text-sm mb-4">
            {Array.isArray(membershipErrors)
              ? membershipErrors.join(", ")
              : membershipErrors.message || membershipErrors}
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <input
              type="text"
              placeholder="Nombre completo"
              {...register("clientName", {
                required: "El nombre es obligatorio",
              })}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.clientName && (
              <p className="text-red-500 text-sm">
                {errors.clientName.message}
              </p>
            )}
          </div>

          {/* Documento */}
          <div>
            <input
              type="text"
              placeholder="Identificación"
              {...register("clientDocument", {
                required: "El documento es obligatorio",
              })}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.clientDocument && (
              <p className="text-red-500 text-sm">
                {errors.clientDocument.message}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <input
              type="text"
              placeholder="Teléfono"
              {...register("clientPhone", {
                required: "El teléfono es obligatorio",
              })}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.clientPhone && (
              <p className="text-red-500 text-sm">
                {errors.clientPhone.message}
              </p>
            )}
          </div>

          {/* Tipo de membresía */}
          <div>
            <select
              {...register("memberShipType", {
                required: "Debes seleccionar una membresía",
              })}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
            >
              <option value="" className="bg-zinc-800 text-gray-400">
                Selecciona una membresía
              </option>
              <option
                value="689a5bc060ac23972d5e7cf0"
                className="bg-zinc-800 text-white"
              >
                Diaria
              </option>
              <option
                value="689a5c4360ac23972d5e7cf2"
                className="bg-zinc-800 text-white"
              >
                Semanal
              </option>
              <option
                value="689a5c7e60ac23972d5e7cf4"
                className="bg-zinc-800 text-white"
              >
                Quincenal
              </option>
              <option
                value="689a5c9d60ac23972d5e7cf6"
                className="bg-zinc-800 text-white"
              >
                Mensual
              </option>
            </select>
            {errors.memberShipType && (
              <p className="text-red-500 text-sm">
                {errors.memberShipType.message}
              </p>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <input
              type="number"
              placeholder="Cantidad a pagar"
              {...register("amount", {
                required: "La cantidad es obligatoria",
              })}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm">{errors.amount.message}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all duration-200 shadow-lg shadow-red-500/25"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => navigate("/memberships")}
              className="px-6 py-3 rounded-xl bg-zinc-600 hover:bg-zinc-700 text-white font-semibold transition-all duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MembershipFormPage;
