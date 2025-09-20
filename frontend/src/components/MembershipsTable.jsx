import React, { useState } from "react";
import { useMembership } from "../context/MembershipContext";
import {
  ChevronDown,
  Eye,
  Edit,
  CreditCard,
  RefreshCw,
  Trash2,
} from "lucide-react";
import MembershipsModal from "./MembershipsModals";
import UpdateModals from "./UpdateModals";
import PaymentsModals from "./PaymentsModals";
import RenewModal from "./RenewModal";
import ConfirmModal from "./DeleteMembershipModal";

export default function MembershipsTable({
  membership,
  currentPage,
  itemsPerPage,
}) {
  const { getMembershipById, deleteMembership } = useMembership();
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [isModalOpenMembership, setIsModalOpenMembership] = useState(false);
  const [update, setUpdate] = useState(null);
  const [isModalOpenUpdate, setIsModalOpenUpdate] = useState(false);
  const [payments, setPayments] = useState();
  const [isModalOpenPayments, setisModalOpenPayments] = useState();
  const [renew, setrenew] = useState();
  const [isModalOpenRenew, setisModalOpenRenew] = useState();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [membershipToDelete, setMembershipToDelete] = useState(null);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getMembership = async (id) => {
    const data = await getMembershipById(id);
    setSelectedMembership(data);
    setIsModalOpenMembership(true);
  };

  const updateClient = async (membership) => {
    setUpdate(membership);
    setIsModalOpenUpdate(true);
  };

  const addPayments = async (membership) => {
    setPayments(membership);
    setisModalOpenPayments(true);
  };

  const renewMembership = async (membership) => {
    setrenew(membership);
    setisModalOpenRenew(true);
  };

  const confirmDelete = (id) => {
    setMembershipToDelete(id);
    setIsConfirmOpen(true);
  };

  return (
    <>
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-white">
            <thead className="bg-gradient-to-r from-red-600/20 to-red-500/20 border-b border-red-500/30">
              <tr>
                <th className="px-6 py-4 text-red-400 font-semibold text-sm uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-4 text-red-400 font-semibold text-sm uppercase tracking-wider">
                  Jugador
                </th>
                <th className="px-6 py-4 text-red-400 font-semibold text-sm uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-red-400 font-semibold text-sm uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700/50">
              {membership.map((m, index) => (
                <React.Fragment key={m._id}>
                  <tr className="hover:bg-zinc-700/30 transition-all duration-200">
                    {/* Numeración global */}
                    <td className="px-6 py-4 text-gray-400">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">
                          {m.clientName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {m.status === "Activa" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          Activo
                        </span>
                      ) : m.status === "Expirada" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
                          Expirado
                        </span>
                      ) : m.status === "Pendiente" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                          Pendiente
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                          Desconocido
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleRow(m._id)}
                        className="flex items-center gap-2 text-white-400 hover:text-white-300 hover:bg-white-500/10 px-3 py-2 rounded-lg transition-all duration-200 font-medium"
                      >
                        Acciones
                        <ChevronDown
                          size={16}
                          className={`transform transition-transform duration-200 ${
                            expandedRow === m._id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                  {expandedRow === m._id && (
                    <tr key={`${m._id}-expanded`}>
                      <td colSpan="4" className="px-6 py-4 bg-zinc-700/20">
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => getMembership(m._id)}
                            className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                          >
                            <Eye size={16} />
                            <span className="hidden sm:inline">Ver</span>
                          </button>
                          <button
                            onClick={() => updateClient(m)}
                            className="flex items-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                          >
                            <Edit size={16} />
                            <span className="hidden sm:inline">Actualizar</span>
                          </button>
                          <button
                            onClick={() => addPayments(m)}
                            className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                          >
                            <CreditCard size={16} />
                            <span className="hidden sm:inline">Pagar</span>
                          </button>
                          <button
                            onClick={() => renewMembership(m)}
                            className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                          >
                            <RefreshCw size={16} />
                            <span className="hidden sm:inline">Renovar</span>
                          </button>
                          <button
                            onClick={() => confirmDelete(m._id)}
                            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                          >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ver */}
      <MembershipsModal
        isOpen={isModalOpenMembership}
        onClose={() => setIsModalOpenMembership(false)}
        membership={selectedMembership}
      />
      {/* Modal para actualizar */}
      <UpdateModals
        key={`update-${update?._id}`}
        isOpen={isModalOpenUpdate}
        onClose={() => setIsModalOpenUpdate(false)}
        membership={update}
      />
      {/* Modal para pagos */}
      <PaymentsModals
        key={`payments-${payments?._id}`}
        isOpen={isModalOpenPayments}
        onClose={() => setisModalOpenPayments(false)}
        membership={payments}
      />
      {/* Modal para eliminar */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => deleteMembership(membershipToDelete)}
        message="¿Estás seguro que deseas eliminar esta membresía? Esta acción no se puede deshacer."
      />
      {/* Modal para renovar membresía */}
      <RenewModal
        key={`renew-${renew?._id}`}
        isOpen={isModalOpenRenew}
        onClose={() => setisModalOpenRenew(false)}
        membership={renew}
      />
    </>
  );
}
