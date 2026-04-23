import React, { useState } from "react";
import { useMembership } from "../context/MembershipContext";
import {
  ChevronDown,
  Eye,
  Edit,
  CreditCard,
  RefreshCw,
  Trash2,
  Calendar,
} from "lucide-react";
import MembershipsModal from "./MembershipsModals";
import UpdateModals from "./UpdateModals";
import PaymentsModals from "./PaymentsModals";
import ConfirmModal from "./DeleteMembershipModal";
import AttendanceModal from "./AttendanceModal";

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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [membershipToDelete, setMembershipToDelete] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [isModalOpenAttendance, setIsModalOpenAttendance] = useState(false);

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

  const markAttendance = async (membership) => {
    if (membership.status === "Activa") {
      alert("No se puede ajustar deuda a un jugador que está al día (Activo).");
      return;
    }
    setAttendance(membership);
    setIsModalOpenAttendance(true);
  };

  const confirmDelete = (id) => {
    setMembershipToDelete(id);
    setIsConfirmOpen(true);
  };

  const getShortNameParts = (fullName) => {
    const nameParts = fullName.split(' ');
    // Si el nombre tiene 3 o más partes, toma la primera y la tercera (ej: Osvaldo David Chamorro -> Osvaldo Chamorro)
    if (nameParts.length >= 3) {
      return [nameParts[0], nameParts[2]];
    }
    // Si el nombre tiene 2 partes, toma la primera y la segunda (ej: Juan Pérez -> Juan Pérez)
    if (nameParts.length === 2) {
      return [nameParts[0], nameParts[1]];
    }
    // Si el nombre tiene solo 1 palabra, la devuelve
    return [fullName];
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
                <th className="px-6 py-4 text-red-400 font-semibold text-sm uppercase tracking-wider text-right">
                  Deuda
                </th>
                <th className="px-6 py-4 text-red-400 font-semibold text-sm uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700/50">
              {membership.map((m, index) => {
                const shortNameParts = getShortNameParts(m.clientName);
                const actualId = m.id || m._id; // Soporta ambos
                return (
                  <React.Fragment key={actualId}>
                    <tr
                      onClick={() => toggleRow(actualId)}
                      className="hover:bg-zinc-700/30 transition-all duration-200 cursor-pointer"
                    >
                      {/* Numeración global */}
                      <td className="px-6 py-4 text-gray-400">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {/* Nombres en dos líneas para móviles */}
                          <div className="font-semibold text-white text-sm md:hidden">
                            {shortNameParts.length > 1 ? (
                              <>
                                <p className="leading-tight">{shortNameParts[0]}</p>
                                <p className="leading-tight">{shortNameParts[1]}</p>
                              </>
                            ) : (
                              <p className="leading-tight">{shortNameParts[0]}</p>
                            )}
                          </div>
                          {/* Nombre completo para pantallas grandes */}
                          <span className="font-semibold text-white hidden md:block">
                            {m.clientName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {m.deuda > 0 ? (
                          <span className="text-red-400 font-bold bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">
                            ${m.deuda.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold">
                            $0
                          </span>
                        )}
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
                    </tr>
                    {expandedRow === actualId && (
                      <tr key={`${actualId}-expanded`}>
                        <td colSpan="4" className="px-6 py-4 bg-zinc-700/20">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); getMembership(actualId); }}
                              className="flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 px-2 py-1 rounded-lg transition-all duration-200 font-medium text-sm"
                            >
                              <Eye size={14} />
                              <span className="hidden sm:inline">Ver</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); updateClient(m); }}
                              className="flex items-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 px-2 py-1 rounded-lg transition-all duration-200 font-medium text-sm"
                            >
                              <Edit size={14} />
                              <span className="hidden sm:inline">Actualizar</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); addPayments(m); }}
                              className="flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded-lg transition-all duration-200 font-medium text-sm"
                            >
                              <CreditCard size={14} />
                              <span className="hidden sm:inline">Pagar</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); markAttendance(m); }}
                              className="flex items-center gap-1 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-400 px-2 py-1 rounded-lg transition-all duration-200 font-medium text-sm"
                            >
                              <Calendar size={14} />
                              <span className="hidden sm:inline">Ajustar Deuda</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); confirmDelete(actualId); }}
                              className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-2 py-1 rounded-lg transition-all duration-200 font-medium text-sm"
                            >
                              <Trash2 size={14} />
                              <span className="hidden sm:inline">Eliminar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
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
        key={`update-${update?.id || update?._id}`}
        isOpen={isModalOpenUpdate}
        onClose={() => setIsModalOpenUpdate(false)}
        membership={update}
      />
      {/* Modal para pagos */}
      <PaymentsModals
        key={`payments-${payments?.id || payments?._id}`}
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
      {/* Modal de asistencia */}
      <AttendanceModal
        key={`attendance-${attendance?.id || attendance?._id}`}
        isOpen={isModalOpenAttendance}
        onClose={() => setIsModalOpenAttendance(false)}
        membership={attendance}
      />
    </>
  );
}