import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getUsersRequest,
  updateUserRoleRequest,
  deleteUserRequest,
} from "../api/users";
import { Users, Shield, Trash2, Plus, RefreshCw, AlertTriangle } from "lucide-react";
import ConfirmModal from "../components/DeleteMembershipModal";

function UsersPage() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const loadUsers = async () => {
    try {
      const res = await getUsersRequest();
      setUsers(res.data);
    } catch (err) {
      setErrors(err.response?.data?.message || "Error al cargar usuarios");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errors) {
      const t = setTimeout(() => setErrors(""), 4000);
      return () => clearTimeout(t);
    }
  }, [errors]);

  const handleToggleRole = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "entrenador" : "admin";
    try {
      await updateUserRoleRequest(id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
      setSuccessMsg("Rol actualizado correctamente");
    } catch (err) {
      setErrors(err.response?.data?.message || "Error al cambiar rol");
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteUserRequest(confirmDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
      setConfirmDelete(null);
      setSuccessMsg("Usuario eliminado correctamente");
    } catch (err) {
      setErrors(err.response?.data?.message || "Error al eliminar usuario");
      setConfirmDelete(null);
    }
  };

  const getBadge = (role) =>
    role === "admin"
      ? "bg-red-500/20 text-red-400 border border-red-500/30"
      : "bg-blue-500/20 text-blue-400 border border-blue-500/30";

  return (
    <div className="relative z-10 my-6 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Usuarios
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {users.length} usuario{users.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate("/register")}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all"
          >
            <Plus size={16} />
            Nuevo usuario
          </button>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
            {successMsg}
          </div>
        )}
        {errors && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            {errors}
          </div>
        )}

        <div className="bg-zinc-800/70 backdrop-blur-sm border border-zinc-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-white">
              <thead className="bg-gradient-to-r from-red-600/20 to-red-500/20 border-b border-red-500/30">
                <tr>
                  <th className="px-6 py-4 text-red-400 font-semibold text-sm uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-red-400 font-semibold text-sm uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-red-400 font-semibold text-sm uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-4 text-red-400 font-semibold text-sm uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700/50">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const adminCount = users.filter((x) => x.role === "admin").length;
                  const canDelete =
                    !isSelf &&
                    !(u.role === "admin" && adminCount <= 1);
                  const canToggleRole =
                    !isSelf &&
                    !(u.role === "admin" && adminCount <= 1);

                  return (
                    <tr key={u.id} className="hover:bg-zinc-700/30 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{u.email}</span>
                          {isSelf && (
                            <span className="text-[10px] bg-zinc-600/60 text-gray-400 px-2 py-0.5 rounded-full">
                              tú
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getBadge(u.role)}`}>
                          <Shield size={12} />
                          {u.role === "admin" ? "Admin" : "Entrenador"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            disabled={!canToggleRole}
                            onClick={() => handleToggleRole(u.id, u.role)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                              canToggleRole
                                ? "bg-zinc-600/40 hover:bg-zinc-600/70 text-gray-300 border border-zinc-500/30"
                                : "bg-zinc-700/30 text-gray-600 cursor-not-allowed border border-zinc-700/20"
                            }`}
                            title={
                              !canToggleRole
                                ? isSelf
                                  ? "No puedes cambiar tu propio rol"
                                  : "No puedes degradar al último admin"
                                : `Cambiar a ${u.role === "admin" ? "entrenador" : "admin"}`
                            }
                          >
                            <RefreshCw size={12} />
                            <span className="hidden sm:inline">Cambiar rol</span>
                          </button>
                          <button
                            disabled={!canDelete}
                            onClick={() => setConfirmDelete(u)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                              canDelete
                                ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                                : "bg-zinc-700/30 text-gray-600 cursor-not-allowed border border-zinc-700/20"
                            }`}
                            title={
                              !canDelete
                                ? isSelf
                                  ? "No puedes eliminar tu propia cuenta"
                                  : "No puedes eliminar al último admin"
                                : "Eliminar usuario"
                            }
                          >
                            <Trash2 size={12} />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleConfirmDelete}
          message={`¿Seguro que deseas eliminar al usuario "${confirmDelete.email}"? Esta acción no se puede deshacer.`}
        />
      )}
    </div>
  );
}

export default UsersPage;
