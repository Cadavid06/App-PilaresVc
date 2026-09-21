import { useEffect } from "react";
import { X, Shield, RefreshCw, Edit, Trash2 } from "lucide-react";

export default function UserBottomSheet({
  isOpen,
  onClose,
  user,
  currentUser,
  totalAdmins,
  onToggleRole,
  onEdit,
  onDelete,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const isSelf = user.id === currentUser?.id;
  const canModifyRoleOrDelete =
    !isSelf && !(user.role === "admin" && totalAdmins <= 1);

  const getInitials = (email) => {
    return email ? email.substring(0, 2).toUpperCase() : "U";
  };

  const initials = getInitials(user.email);

  const getBadge = (role) =>
    role === "admin"
      ? "bg-red-500/10 text-red-400 border border-red-500/30"
      : "bg-blue-500/10 text-blue-400 border border-blue-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Cerrar"
      />

      <div className="relative w-full max-w-lg bg-zinc-900 border-t border-x border-zinc-700/50 rounded-t-3xl animate-slide-up max-h-[85vh] overflow-y-auto overscroll-contain shadow-2xl">
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
              <h2 className="truncate text-lg font-bold text-white flex items-center gap-2">
                {user.email}
                {isSelf && (
                  <span className="text-[10px] bg-zinc-600/60 text-gray-400 px-2 py-0.5 rounded-full font-normal">
                    tú
                  </span>
                )}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getBadge(user.role)}`}>
                  <Shield size={12} />
                  {user.role === "admin" ? "Admin" : "Entrenador"}
                </span>
                <span className="text-xs text-gray-500">
                  Creado: {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              Acciones de usuario
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  onClose();
                  onToggleRole(user.id, user.role);
                }}
                disabled={!canModifyRoleOrDelete}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border py-4 transition-all ${
                  canModifyRoleOrDelete
                    ? "bg-zinc-800 border-zinc-700/50 text-gray-300 hover:bg-zinc-700 active:scale-95"
                    : "cursor-not-allowed border-zinc-700/30 bg-zinc-800/30 text-zinc-600 opacity-50"
                }`}
              >
                <RefreshCw size={20} />
                <span className="text-xs font-medium text-center">Cambiar<br/>Rol</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:brightness-110 active:scale-95 transition-all py-4"
              >
                <Edit size={20} />
                <span className="text-xs font-medium">Editar</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onDelete(user);
                }}
                disabled={!canModifyRoleOrDelete}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border py-4 transition-all ${
                  canModifyRoleOrDelete
                    ? "bg-red-500/10 border-red-500/20 text-red-400 hover:brightness-110 active:scale-95"
                    : "cursor-not-allowed border-zinc-700/30 bg-zinc-800/30 text-zinc-600 opacity-50"
                }`}
              >
                <Trash2 size={20} />
                <span className="text-xs font-medium">Eliminar</span>
              </button>
            </div>

            {!canModifyRoleOrDelete && isSelf && (
              <p className="mt-4 text-center text-xs text-gray-500">
                No puedes cambiar tu propio rol ni eliminarte a ti mismo.
              </p>
            )}
            {!canModifyRoleOrDelete && !isSelf && user.role === "admin" && (
              <p className="mt-4 text-center text-xs text-gray-500">
                No puedes modificar al último administrador.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
