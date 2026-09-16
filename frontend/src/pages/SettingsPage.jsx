import { useEffect, useState } from "react";
import { useMembership } from "../context/MembershipContext";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Settings as SettingsIcon } from "lucide-react";

function SettingsPage() {
  const { settings, updateSettings } = useMembership();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    monthlyFee: 20000,
    inscriptionFee: 15000,
    reactivationFee: 20000,
    siblingDiscount: 0,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        monthlyFee: settings.monthlyFee,
        inscriptionFee: settings.inscriptionFee,
        reactivationFee: settings.reactivationFee,
        siblingDiscount: settings.siblingDiscount || 0,
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateSettings(form);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const inputCls =
    "w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500";

  return (
    <div className="relative z-10 my-6 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">
            Configuración
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Valores económicos del club
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6 text-red-400">
            <SettingsIcon size={22} />
            <h2 className="text-xl font-semibold text-white">
              Tarifas del club
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-red-400 mb-2">
                Mensualidad (COP)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                name="monthlyFee"
                value={form.monthlyFee}
                onChange={handleChange}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">
                Se cobra a todos los jugadores el día 1 de cada mes.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-red-400 mb-2">
                Inscripción (COP)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                name="inscriptionFee"
                value={form.inscriptionFee}
                onChange={handleChange}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">
                Solo se cobra a jugadores nuevos.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-red-400 mb-2">
                Reincorporación (COP)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                name="reactivationFee"
                value={form.reactivationFee}
                onChange={handleChange}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">
                Se cobra automáticamente a un jugador expirado con 6+ meses de
                deuda que vuelve a ponerse al día.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-red-400 mb-2">
                Descuento por hermano (COP)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                name="siblingDiscount"
                value={form.siblingDiscount}
                onChange={handleChange}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">
                Se aplica automáticamente a jugadores con "Grupo familiar" asignado. Se resta de la mensualidad cada mes.
              </p>
            </div>
          </div>

          {saved && (
            <div className="mt-6 flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <CheckCircle2 size={18} />
              <span className="text-sm font-medium">
                Valores guardados correctamente
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all duration-200 shadow-lg shadow-red-500/25"
            >
              Guardar cambios
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

export default SettingsPage;