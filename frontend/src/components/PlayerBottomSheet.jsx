import {
  X,
  Eye,
  CreditCard,
  Edit,
  Calendar,
  SlidersHorizontal,
  Trash2,
  FileText,
} from "lucide-react";
import { useEffect } from "react";

function getInitials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function StatusPill({ status }) {
  const config = {
    Activa: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Pendiente: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    Expirada: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  const dot = {
    Activa: "bg-emerald-400",
    Pendiente: "bg-yellow-400",
    Expirada: "bg-red-400",
  };
  const cls = config[status] || config.Expirada;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot[status] || dot.Expirada}`} />
      {status}
    </span>
  );
}

export default function PlayerBottomSheet({
  member,
  isOpen,
  onClose,
  isAdmin,
  canCondone,
  onView,
  onEdit,
  onPay,
  onCondone,
  onAdjust,
  onDelete,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !member) return null;

  const actualId = member.id || member._id;
  const initials = getInitials(member.clientName);
  const deuda = member.deuda || 0;
  const totalPaid = member.totalPaid || 0;

  const actions = [
    { label: "Ver", icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", onClick: () => { onClose(); onView(member); } },
    { label: "Pagar", icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", onClick: () => { onClose(); onPay(member); } },
    { label: "Editar", icon: Edit, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", onClick: () => { onClose(); onEdit(member); } },
    { label: "Condonar", icon: Calendar, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20", disabled: !canCondone, onClick: () => { onClose(); onCondone(member); } },
    { label: "Ajustes", icon: SlidersHorizontal, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", onClick: () => { onClose(); onAdjust(member); } },
  ];

  if (isAdmin) {
    actions.push({ label: "Eliminar", icon: Trash2, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", onClick: () => { onClose(); onDelete(actualId); } });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Cerrar"
      />

      <div className="relative w-full max-w-lg bg-zinc-900 border-t border-x border-zinc-700/50 rounded-t-3xl animate-slide-up max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-zinc-700" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:text-white hover:bg-zinc-700/50 transition-all"
          aria-label="Cerrar hoja"
        >
          <X size={20} />
        </button>

        <div className="px-5 pb-8 pt-2">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-lg font-black text-white shadow-lg shadow-red-500/20">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-bold text-white">
                {member.clientName}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400">
                  {member.category || "—"}
                </span>
                <span className="text-xs text-gray-400">
                  {member.gender || "—"}
                </span>
              </div>
              <div className="mt-2">
                <StatusPill status={member.status} />
              </div>
            </div>
          </div>

          {/* Documento */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-3 py-2.5 text-sm text-gray-300">
            <FileText size={15} className="shrink-0 text-gray-500" />
            <span className="font-medium text-white">
              {member.documentType || "—"}
            </span>
            <span className="text-gray-400">
              {member.clientDocument || "—"}
            </span>
            {member.clientPhone && (
              <>
                <span className="mx-1 h-3 w-px bg-zinc-700" />
                <span className="text-gray-400">{member.clientPhone}</span>
              </>
            )}
          </div>

          {/* Resumen económico */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-zinc-700/50 bg-zinc-800/50 p-3">
              <p className="text-[11px] uppercase tracking-wider text-gray-400">
                Deuda actual
              </p>
              <p className={`mt-1 text-xl font-black ${deuda > 0 ? "text-red-400" : "text-emerald-400"}`}>
                ${deuda.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-700/50 bg-zinc-800/50 p-3">
              <p className="text-[11px] uppercase tracking-wider text-gray-400">
                Total pagado
              </p>
              <p className="mt-1 text-xl font-black text-white">
                ${totalPaid.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-6">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              Acciones rápidas
            </p>
            <div className={`grid grid-cols-3 gap-2.5 ${actions.length === 6 ? "" : "sm:grid-cols-5"}`}>
              {actions.map((action) => {
                const { label, color, bg, disabled, onClick } = action;
                const ActionIcon = action.icon;
                return (
                  <button
                    key={label}
                    onClick={onClick}
                    disabled={disabled}
                    className={`flex flex-col items-center gap-2 rounded-2xl border py-4 transition-all active:scale-95 ${bg} ${color} ${
                      disabled
                        ? "cursor-not-allowed border-zinc-700/40 bg-zinc-800/30 text-zinc-600 opacity-50 active:scale-100"
                        : "border-opacity-100 hover:brightness-110"
                    }`}
                  >
                    <ActionIcon size={20} />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                );
              })}
            </div>

            {!canCondone && (
              <p className="mt-3 text-center text-xs text-gray-500">
                No hay deuda condonable (el mes actual no se puede condonar)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}