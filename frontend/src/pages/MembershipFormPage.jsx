import { useForm } from "react-hook-form";
import { useMembership } from "../context/MembershipContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MembershipFormPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const { createMembership, errors: membershipErrors, settings } = useMembership();
  const navigate = useNavigate();
  const [isNewPlayer, setIsNewPlayer] = useState(true);

  const debtAmount = watch("debtAmount") || 0;
  const monthlyFee = settings?.monthlyFee || 20000;
  const inscriptionFee = settings?.inscriptionFee || 15000;

  // Total = deuda que digita el admin + mes actual (automático)
  const debtTotal = isNewPlayer
    ? monthlyFee + inscriptionFee
    : Math.max(0, Number(debtAmount) || 0) + monthlyFee;

  const onSubmit = handleSubmit(async (data) => {
    data.isNewPlayer = isNewPlayer;
    if (isNewPlayer) {
      data.amount = 0;
      data.debtAmount = 0;
    } else {
      if (data.debtAmount === "") data.debtAmount = 0;
      data.amount = data.amount ? Number(data.amount) : 0;
    }

    const success = await createMembership(data);
    if (success) {
      navigate("/memberships");
    }
  });

  return (
    <div className="min-h-screen flex items-start justify-center px-3 py-4 sm:items-center sm:px-4 sm:py-8">
      <div className="bg-black/30 backdrop-blur-xs border border-zinc-700/50 text-white rounded-2xl shadow-2xl w-full max-w-lg p-4 sm:p-8">
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
          {/* Tipo de jugador */}
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
                * Se le cobrará automáticamente Inscripción + Mensualidad inicial.
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-2">
                * Sin cobro de inscripción. Ingresa la deuda total abajo.
              </p>
            )}

            {/* Resumen de cobro */}
            <div className="mt-3 bg-zinc-700/40 rounded-lg p-3 border border-zinc-600/30">
              <p className="text-xs text-gray-300 mb-1 font-semibold">Resumen de cobro:</p>
              {isNewPlayer ? (
                <div className="text-xs text-gray-400 space-y-0.5">
                  <p>Inscripción: <span className="text-white">${inscriptionFee.toLocaleString()}</span></p>
                  <p>Mensualidad: <span className="text-white">${monthlyFee.toLocaleString()}</span></p>
                  <p className="text-red-400 font-semibold">Total a cobrar: ${debtTotal.toLocaleString()}</p>
                </div>
              ) : (
                <div className="text-xs text-gray-400 space-y-0.5">
                  <p>Deuda que digita el admin: <span className="text-white">${Number(debtAmount).toLocaleString()}</span></p>
                  <p>Mes actual (automático): <span className="text-white">${monthlyFee.toLocaleString()}</span></p>
                  <p className="text-red-400 font-semibold">Total a pagar: ${debtTotal.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {!isNewPlayer && (
            <div>
              <label className="block text-sm font-semibold text-red-400 mb-2">
                Deuda total en pesos
              </label>
              <input
                type="number"
                min="0"
                onKeyDown={(e) => { if (e.key === "-" || e.key === "e") e.preventDefault(); }}
                placeholder="Ej: 80000"
                {...register("debtAmount", {
                  min: { value: 0, message: "No puede ser negativo" }
                })}
                className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Ingresa cuánto debe en total. El sistema suma el mes actual.
              </p>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-red-400 mb-1">Nombre completo</label>
            <input
              type="text"
              placeholder="Nombre completo"
              onInput={(e) => (e.target.value = e.target.value.replace(/[^A-Za-zÁ-ÿ\s]/g, ""))}
              {...register("clientName", {
                required: "El nombre es obligatorio",
                pattern: { value: /^[A-Za-zÁ-ÿ\s]+$/, message: "El nombre solo puede contener letras y espacios" }
              })}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.clientName && (
              <p className="text-red-500 text-sm mt-1">{errors.clientName.message}</p>
            )}
          </div>

          {/* Género */}
          <div>
            <label className="block text-sm font-semibold text-red-400 mb-1">Género</label>
            <select
              {...register("gender", {
                required: "Debes seleccionar el género",
              })}
              defaultValue="Masculino"
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
            >
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
            )}
          </div>

          {/* Grupo familiar (opcional) */}
          <div>
            <label className="block text-sm font-semibold text-red-400 mb-1">
              Grupo familiar <span className="text-gray-500">(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Hermanos García"
              {...register("familyId")}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Ingresa el mismo nombre del grupo para hermanos. Esto permite aplicar descuentos grupales.
            </p>
          </div>

          {/* Tipo de documento */}
          <div>
            <label className="block text-sm font-semibold text-red-400 mb-1">Tipo de documento</label>
            <select
              {...register("documentType", {
                required: "Debes seleccionar un tipo de documento",
              })}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
            >
              <option value="">Selecciona un tipo de documento</option>
              <option value="TI">TI</option>
              <option value="CC">CC</option>
              <option value="CE">CE</option>
            </select>
            {errors.documentType && (
              <p className="text-red-500 text-sm mt-1">{errors.documentType.message}</p>
            )}
          </div>

          {/* Documento */}
          <div>
            <label className="block text-sm font-semibold text-red-400 mb-1">Número de documento</label>
            <input
              type="text"
              placeholder="Número de documento"
              onInput={(e) => (e.target.value = e.target.value.replace(/[^A-Za-z0-9]/g, ""))}
              {...register("clientDocument", {
                required: "El documento es obligatorio",
                pattern: { value: /^[A-Za-z0-9]+$/, message: "El documento no puede contener símbolos" }
              })}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.clientDocument && (
              <p className="text-red-500 text-sm mt-1">{errors.clientDocument.message}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-semibold text-red-400 mb-1">Teléfono</label>
            <input
              type="tel"
              placeholder="Teléfono"
              onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9+]/g, ""))}
              {...register("clientPhone", {
                required: "El teléfono es obligatorio",
                pattern: { value: /^[0-9+]+$/, message: "El teléfono solo puede contener números y el signo +" }
              })}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.clientPhone && (
              <p className="text-red-500 text-sm mt-1">{errors.clientPhone.message}</p>
            )}
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-semibold text-red-400 mb-1">Correo electrónico</label>
            <input
              type="email"
              placeholder="Correo electrónico"
              {...register("clientEmail", {
                required: "El correo es obligatorio",
              })}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.clientEmail && (
              <p className="text-red-500 text-sm mt-1">{errors.clientEmail.message}</p>
            )}
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label className="block text-sm font-semibold text-red-400 mb-1">Fecha de nacimiento</label>
            <input
              type="date"
              {...register("birthdate", {
                required: "La fecha de nacimiento es obligatoria",
              })}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.birthdate && (
              <p className="text-red-500 text-sm mt-1">{errors.birthdate.message}</p>
            )}
          </div>

          {/* Abono inicial */}
          {!isNewPlayer && (
            <div>
              <label className="block text-sm font-semibold text-red-400 mb-1">
                Abono Inicial (Opcional)
              </label>
              <input
                type="number"
                min="0"
                onKeyDown={(e) => { if (e.key === "-" || e.key === "e") e.preventDefault(); }}
                placeholder="Ej: 20000"
                {...register("amount", {
                  min: { value: 0, message: "No puede ser negativo" }
                })}
                className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Si dejas este campo vacío, el abono inicial será $0.
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/memberships")}
              className="px-6 py-3 rounded-xl bg-zinc-600 hover:bg-zinc-700 text-white font-semibold transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all duration-200 shadow-lg shadow-red-500/25"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MembershipFormPage;
