import { useState, useEffect } from "react";
import {
  getAdjustmentsByMemberRequest,
  createAdjustmentRequest,
  deleteAdjustmentRequest,
} from "../api/billingAdjustments";
import { X, Plus, Trash2, Users, AlertCircle } from "lucide-react";

const TYPES = [
  { value: "descuento_hermano", label: "Descuento hermano", color: "text-green-400" },
  { value: "penalidad", label: "Penalidad", color: "text-red-400" },
  { value: "colaboracion", label: "Colaboración", color: "text-blue-400" },
  { value: "manual", label: "Manual", color: "text-yellow-400" },
];

export default function AdjustmentsModal({ isOpen, onClose, membership }) {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    cycle: "",
    amount: "",
    type: "descuento_hermano",
    description: "",
    applyToSiblings: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen && membership?.id) {
      loadAdjustments();
      const now = new Date();
      const cycle = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      setForm((f) => ({ ...f, cycle }));
    }
  }, [isOpen, membership?.id]);

  const loadAdjustments = async () => {
    setLoading(true);
    try {
      const { data } = await getAdjustmentsByMemberRequest(membership.id);
      setAdjustments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const amount = parseFloat(form.amount);
    if (!Number.isFinite(amount) || amount === 0) {
      setError("El monto debe ser un número válido y diferente de 0");
      return;
    }

    // Negativo para descuentos, positivo para penalidades
    const finalAmount =
      form.type === "descuento_hermano" || form.type === "colaboracion"
        ? -Math.abs(amount)
        : Math.abs(amount);

    try {
      const { data } = await createAdjustmentRequest(membership.id, {
        cycle: form.cycle,
        amount: finalAmount,
        type: form.type,
        description: form.description,
        applyToSiblings: form.applyToSiblings,
      });

      setSuccess(data.message);
      setForm((f) => ({ ...f, amount: "", description: "", applyToSiblings: false }));
      loadAdjustments();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear ajuste");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este ajuste?")) return;
    try {
      await deleteAdjustmentRequest(id);
      loadAdjustments();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen || !membership) return null;

  const hasSiblings = !!membership.familyId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900/95 border border-zinc-700/50 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-700/50">
          <div>
            <h2 className="text-lg font-bold text-white">Ajustes de Cobro</h2>
            <p className="text-sm text-gray-400">{membership.clientName}</p>
            {hasSiblings && (
              <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                <Users size={12} />
                Grupo familiar: {membership.familyId}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mb-3 bg-red-500/10 px-3 py-2 rounded-lg">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-400 text-sm mb-3 bg-green-500/10 px-3 py-2 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Ciclo</label>
                <input
                  type="month"
                  value={form.cycle}
                  onChange={(e) => setForm({ ...form, cycle: e.target.value })}
                  required
                  className="w-full bg-zinc-800/50 border border-zinc-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Monto ($)
              </label>
              <input
                type="number"
                placeholder="Ej: 5000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                className="w-full bg-zinc-800/50 border border-zinc-600/50 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {form.type === "descuento_hermano" || form.type === "colaboracion"
                  ? "Se restará de la deuda (negativo)"
                  : "Se sumará a la deuda (positivo)"}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Descripción</label>
              <input
                type="text"
                placeholder="Ej: Descuento hermano Oct-Nicolas"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-zinc-800/50 border border-zinc-600/50 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {hasSiblings && (
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.applyToSiblings}
                  onChange={(e) => setForm({ ...form, applyToSiblings: e.target.checked })}
                  className="w-4 h-4 text-red-500 rounded border-zinc-600 bg-zinc-800"
                />
                Aplicar a todos los hermanos del grupo
              </label>
            )}

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Registrar ajuste
            </button>
          </form>

          <div className="border-t border-zinc-700/50 pt-3">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Historial de ajustes</h3>
            {loading ? (
              <p className="text-xs text-gray-500">Cargando...</p>
            ) : adjustments.length === 0 ? (
              <p className="text-xs text-gray-500">No hay ajustes registrados</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {adjustments.map((adj) => {
                  const typeInfo = TYPES.find((t) => t.value === adj.type) || TYPES[3];
                  return (
                    <div
                      key={adj.id}
                      className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-3 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          <span className="text-xs text-gray-500">{adj.cycle}</span>
                        </div>
                        {adj.description && (
                          <p className="text-xs text-gray-400 truncate">{adj.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className={`text-sm font-bold ${adj.amount < 0 ? "text-green-400" : "text-red-400"}`}>
                          {adj.amount < 0 ? "-" : "+"}${Math.abs(adj.amount).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleDelete(adj.id)}
                          className="text-gray-500 hover:text-red-400 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}