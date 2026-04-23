import { useForm, Controller } from "react-hook-form";
import { useMembership } from "../context/MembershipContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MembershipFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { createMembership, errors: membershipErrors } = useMembership();
  const navigate = useNavigate();
  const [isNewPlayer, setIsNewPlayer] = useState(true);

  const onSubmit = handleSubmit(async (data) => {
    // Inyectamos las banderas de negocio
    data.isNewPlayer = isNewPlayer;
    if (isNewPlayer) {
      data.amount = 35000; // Valor fijo de inscripción + mensualidad
      data.debtMonths = 0;
    } else {
      if (data.debtMonths === "") data.debtMonths = 0;
      data.amount = data.amount ? Number(data.amount) : 0;
    }

    const success = await createMembership(data);
    if (success) {
      navigate("/memberships");
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center mb-5">
      <div className="bg-black/30 backdrop-blur-xs border border-zinc-700/50 text-white rounded-2xl shadow-2xl w-full max-w-lg p-8 mx-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">
            Registrar Membresía
          </h1>
          <p className="text-red-400 text-sm">
            Completa la información del jugador
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
          {/* Opciones de tipo de jugador */}
          <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700 mb-6">
            <label className="block text-sm font-semibold text-red-400 mb-3">
              Tipo de Registro
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="playerType"
                  checked={isNewPlayer}
                  onChange={() => setIsNewPlayer(true)}
                  className="w-4 h-4 text-red-500 focus:ring-red-500 border-gray-300"
                />
                <span className="text-white text-sm">Jugador Nuevo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="playerType"
                  checked={!isNewPlayer}
                  onChange={() => setIsNewPlayer(false)}
                  className="w-4 h-4 text-red-500 focus:ring-red-500 border-gray-300"
                />
                <span className="text-white text-sm">Jugador Antiguo</span>
              </label>
            </div>

            {isNewPlayer ? (
              <p className="text-xs text-gray-400 mt-2">
                * Se le cobrará automáticamente Inscripción + Mensualidad
                inicial. Su próxima fecha de cobro se ajustará.
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-2">
                * Solo se registrará sin cobro de inscripción. Puedes añadir su
                deuda pendiente abajo.
              </p>
            )}
          </div>

          {!isNewPlayer && (
            <div className="animate-fade-in-down mb-4">
              <label className="block text-sm font-semibold text-red-400 mb-2">
                Deuda Histórica en meses
              </label>
              <input
                type="number"
                placeholder="¿Cuántos meses debe?"
                {...register("debtMonths")}
                defaultValue={0}
                className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                El valor en pesos se calculará orgánicamente.
              </p>
            </div>
          )}

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

          {/* Tipo de documento */}
          <div>
            <select
              {...register("documentType", {
                required: "Debes seleccionar un tipo de documento",
              })}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
            >
              <option value="" className="bg-zinc-800 text-gray-400">
                Selecciona un tipo de documento
              </option>
              <option value="TI" className="bg-zinc-800 text-white">
                TI
              </option>
              <option value="CC" className="bg-zinc-800 text-white">
                CC
              </option>
              <option value="CE" className="bg-zinc-800 text-white">
                CE
              </option>
            </select>
            {errors.documentType && (
              <p className="text-red-500 text-sm">
                {errors.documentType.message}
              </p>
            )}
          </div>

          {/* Documento */}
          <div>
            <input
              type="text"
              placeholder="Número de documento"
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
              type="tel"
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

          {/* Correo */}
          <div>
            <input
              type="email"
              placeholder="Correo electrónico"
              {...register("clientEmail", {
                required: "El correo es obligatorio",
              })}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.clientEmail && (
              <p className="text-red-500 text-sm">
                {errors.clientEmail.message}
              </p>
            )}
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label className="block text-sm font-semibold text-red-400 mb-2">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              {...register("birthdate", {
                required: "La fecha de nacimiento es obligatoria",
              })}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.birthdate && (
              <p className="text-red-500 text-sm">{errors.birthdate.message}</p>
            )}
          </div>

          {/* Cantidad a Pagar (Abono Inicial) */}
          {!isNewPlayer && (
            <div className="animate-fade-in-down">
              <label className="block text-sm font-semibold text-red-400 mb-2">
                Abono Inicial (Opcional)
              </label>
              <input
                type="number"
                placeholder="Ej: 20000"
                {...register("amount")}
                className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Si dejas este campo vacío, el abono inicial será $0.
              </p>
            </div>
          )}

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
