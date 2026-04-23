import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMembership } from "../context/MembershipContext";
import { Calendar, X, AlertCircle } from "lucide-react";

export default function AttendanceModal({ isOpen, onClose, membership }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      monthsToForgive: 0,
    }
  });
  
  const { adjustDebt, errors: membershipErrors } = useMembership();
  const [successMsg, setSuccessMsg] = useState("");

  const actualId = membership?.id || membership?._id;
  const currentDebt = membership?.deuda || 0;
  
  // Calcular límite máximo de condonación
  // Deuda: 40000 -> 2 meses. Se puede perdonar máximo 1.
  const maxMonthsToForgive = Math.max(0, Math.floor(currentDebt / 20000) - 1);

  // Observar meses a condonar para mostrar cuánto le quedará debiendo dinámicamente
  const watchedMonths = watch("monthsToForgive") || 0;
  const projectedDebt = Math.max(0, currentDebt - (watchedMonths * 20000));

  // Reset del formulario al abrir
  useEffect(() => {
    if (isOpen) {
      reset({ monthsToForgive: 0, amountToPay: "" });
      setSuccessMsg("");
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      setSuccessMsg("");
      const payload = {
        monthsToForgive: parseInt(data.monthsToForgive, 10),
      };

      const res = await adjustDebt(actualId, payload);
      setSuccessMsg(res.message || "Ajuste de deuda procesado correctamente.");
      
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen || !membership) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
              <Calendar size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Ajustar Deuda</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-zinc-800 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-400 mb-6">
            Ajustando la cuenta de <strong className="text-white">{membership.clientName}</strong>. 
            Actualmente su deuda total asciende a: <strong className="text-red-400">${currentDebt.toLocaleString()}</strong>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Input Condonación */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meses a condonar (por inasistencia)
              </label>
              <input
                type="number"
                min="0"
                max={maxMonthsToForgive}
                {...register("monthsToForgive", { 
                  required: "Especifica los meses a perdonar",
                  min: { value: 0, message: "No puede ser menor a 0" },
                  max: { value: maxMonthsToForgive, message: `Solo puedes condonar hasta ${maxMonthsToForgive} meses` }
                })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-2">
                Máximo permitido: <strong>{maxMonthsToForgive} meses</strong> (El mes actual no se puede condonar).
              </p>
            </div>

            {/* Dinámica de Deuda Restante */}
            <div className="bg-black/30 border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
              <span className="text-sm text-gray-400">Deuda Restante Tras Ajuste:</span>
              <span className="text-lg font-bold text-red-400">${projectedDebt.toLocaleString()}</span>
            </div>

            {/* Error & Success Messages */}
            {errors.monthsToForgive ? (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle size={14} /> Revisa los valores ingresados. {errors.monthsToForgive.message}
              </p>
            ) : null}
            
            {membershipErrors && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm flex gap-2 items-center">
                  <AlertCircle size={16} />
                  {Array.isArray(membershipErrors)
                    ? membershipErrors.join(", ")
                    : membershipErrors.message || membershipErrors}
                </p>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-emerald-400 text-sm font-medium flex gap-2 items-center">
                  <Calendar size={16} />
                  {successMsg}
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-200"
              >
                Ajustar Deuda
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
