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
      amountToForgive: 0,
    }
  });
  
  const { adjustDebt, errors: membershipErrors, settings } = useMembership();
  const [successMsg, setSuccessMsg] = useState("");
  const [localError, setLocalError] = useState("");

  const actualId = membership?.id || membership?._id;
  const currentDebt = membership?.deuda || 0;
  const monthlyFee = settings?.monthlyFee || 20000;

  const watchedAmount = watch("amountToForgive") || 0;
  const projectedDebt = Math.max(0, currentDebt - Number(watchedAmount));
  const maxAllowed = Math.max(0, currentDebt - monthlyFee);
  const canForgive = maxAllowed > 0;

  useEffect(() => {
    if (isOpen) {
      reset({ amountToForgive: 0 });
      setSuccessMsg("");
      setLocalError("");
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      setSuccessMsg("");
      setLocalError("");
      const payload = {
        amountToForgive: parseFloat(data.amountToForgive) || 0,
      };

      const res = await adjustDebt(actualId, payload);
      setSuccessMsg(res.message || "Ajuste de deuda procesado correctamente.");
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error(error);
      setLocalError(error.response?.data?.message || "Hubo un error al ajustar la deuda.");
    }
  };

  if (!isOpen || !membership) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-zinc-800/30">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
              <Calendar size={18} />
            </div>
            <h2 className="text-lg font-bold text-white">Ajustar Deuda</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-zinc-800 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-400 mb-6">
            Ajustando la cuenta de <strong className="text-white">{membership.clientName}</strong>. 
            Actualmente su deuda total asciende a: <strong className="text-red-400">${currentDebt.toLocaleString()}</strong>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {!canForgive ? (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-4">
                <p className="text-yellow-400 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>
                    No hay deuda condonable. La deuda actual es <strong>${currentDebt.toLocaleString()}</strong>, pero el sistema no permite condonar el mes en curso (mensualidad de ${monthlyFee.toLocaleString()}).
                  </span>
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monto a condonar (por inasistencia)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    max={maxAllowed}
                    step="1000"
                    placeholder="0"
                    {...register("amountToForgive", { 
                      required: "Especifica el monto a condonar",
                      min: { value: 0, message: "No puede ser menor a 0" },
                      max: { value: maxAllowed, message: `No puede superar el máximo permitido de $${maxAllowed.toLocaleString()}` }
                    })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-8 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Máximo permitido: <strong>${maxAllowed.toLocaleString()}</strong> (el mes actual no se condona).
                </p>
              </div>
            )}

            <div className="bg-black/30 border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
              <span className="text-sm text-gray-400">Deuda Restante Tras Ajuste:</span>
              <span className="text-lg font-bold text-red-400">${projectedDebt.toLocaleString()}</span>
            </div>

            {errors.amountToForgive ? (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle size={14} /> Revisa los valores ingresados. {errors.amountToForgive.message}
              </p>
            ) : null}
            
            {(membershipErrors || localError) && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm flex gap-2 items-center">
                  <AlertCircle size={16} />
                  {localError || (Array.isArray(membershipErrors)
                    ? membershipErrors.join(", ")
                    : membershipErrors.message || membershipErrors)}
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
                disabled={!canForgive}
                className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-200 ${
                  canForgive 
                    ? "bg-indigo-600 hover:bg-indigo-700" 
                    : "bg-zinc-700 cursor-not-allowed opacity-50"
                }`}
              >
                Condonar Deuda
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}