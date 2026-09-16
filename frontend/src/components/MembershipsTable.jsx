import React, { useState } from "react";
import { useMembership } from "../context/MembershipContext";
import { useAuth } from "../context/AuthContext";
import {
  ChevronDown,
  Eye,
  Edit,
  CreditCard,
  RefreshCw,
  Trash2,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";
import MembershipsModal from "./MembershipsModals";
import UpdateModals from "./UpdateModals";
import PaymentsModals from "./PaymentsModals";
import ConfirmModal from "./DeleteMembershipModal";
import AttendanceModal from "./AttendanceModal";
import AdjustmentsModal from "./AdjustmentsModal";

export default function MembershipsTable({
  membership,
  currentPage,
  itemsPerPage,
}) {
  const { getMembershipById, deleteMembership, settings } = useMembership();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
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
  const [adjustments, setAdjustments] = useState(null);
  const [isModalOpenAdjustments, setIsModalOpenAdjustments] = useState(false);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getMembership = async (id) => {
    const data = await getMembershipById(id);
    setSelectedMembership(data);
    setIsModalOpenMembership(true);
  };

  const updateClient = (member) => {
    setUpdate(member);
    setIsModalOpenUpdate(true);
  };

  const addPayments = (member) => {
    setPayments(member);
    setisModalOpenPayments(true);
  };

  const markAttendance = (member) => {
    setAttendance(member);
    setIsModalOpenAttendance(true);
  };

  const openAdjustments = (member) => {
    setAdjustments(member);
    setIsModalOpenAdjustments(true);
  };

  const confirmDelete = (id) => {
    setMembershipToDelete(id);
    setIsConfirmOpen(true);
  };

  const getShortNameParts = (fullName) => {
    const nameParts = fullName.split(' ');
    if (nameParts.length >= 3) {
      return [nameParts[0], nameParts[2]];
    }
    if (nameParts.length === 2) {
      return [nameParts[0], nameParts[1]];
    }
    return [fullName];
  };

  return (
    <>
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-white">
            <thead>
              <tr className="bg-gradient-to-r from-red-600/20 to-red-500/20 border-b border-red-500/30">
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
                <th className="px-6 py-4 text-red-400 font-semibold text-sm uppercase tracking-wider">
                  Género
                </th>
                <th className="px-6 py-4 text-red-400 font-semibold text-sm uppercase tracking-wider">
                  Categoría
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700/50">
              {membership.map((m, index) => {
                const shortNameParts = getShortNameParts(m.clientName);
                const actualId = m.id || m._id;
                return (
                  <React.Fragment key={actualId}>
                    <tr
                      onClick={() => toggleRow(actualId)}
                      className="hover:bg-zinc-700/30 transition-all duration-200 cursor-pointer"
                    >
                      <td className="px-6 py-4 text-gray-400">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="font-semibold text-white text-sm md:hidden flex items-center justify-between w-full">
                            <div>
                              {shortNameParts.length > 1 ? (
                                <>
                                  <p className="leading-tight">{shortNameParts[0]}</p>
                                  <p className="leading-tight">{shortNameParts[1]}</p>
                                </>
                              ) : (
                                <p className="leading-tight">{shortNameParts[0]}</p>
                              )}
                            </div>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform ml-2 ${expandedRow === actualId ? 'rotate-180' : ''}`} />
                          </div>
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
                      <td className="px-6 py-4">
                        <span className="text-gray-300 text-sm">
                          {m.gender || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {m.category || "—"}
                        </span>
                      </td>
                    </tr>
                    {expandedRow === actualId && (
                      <tr key={`${actualId}-expanded`}>
                        <td colSpan="7" className="px-6 py-4 bg-zinc-700/20">
                          <div className="flex flex-wrap gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); getMembership(actualId); }}
                                aria-label="Ver detalles"
                                title="Ver detalles"
                                className="flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 px-3 py-2 sm:px-2 sm:py-1 rounded-lg transition-all duration-200 font-medium text-sm"
                              >
                                <Eye size={16} className="sm:w-[14px] sm:h-[14px]" />
                                <span className="hidden sm:inline">Ver</span>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); updateClient(m); }}
                                aria-label="Actualizar jugador"
                                title="Actualizar jugador"
                                className="flex items-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 px-3 py-2 sm:px-2 sm:py-1 rounded-lg transition-all duration-200 font-medium text-sm"
                              >
                                <Edit size={16} className="sm:w-[14px] sm:h-[14px]" />
                                <span className="hidden sm:inline">Actualizar</span>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); addPayments(m); }}
                                aria-label="Registrar pago"
                                title="Registrar pago"
                                className="flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 px-3 py-2 sm:px-2 sm:py-1 rounded-lg transition-all duration-200 font-medium text-sm"
                              >
                                <CreditCard size={16} className="sm:w-[14px] sm:h-[14px]" />
                                <span className="hidden sm:inline">Pagar</span>
                              </button>
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if (m.deuda > (settings?.monthlyFee || 20000)) markAttendance(m); 
                                }}
                                aria-label="Ajustar deuda por inasistencia"
                                title="Ajustar deuda por inasistencia"
                                disabled={m.deuda <= (settings?.monthlyFee || 20000)}
                                className={`flex items-center gap-1 border px-3 py-2 sm:px-2 sm:py-1 rounded-lg transition-all duration-200 font-medium text-sm ${
                                  m.deuda > (settings?.monthlyFee || 20000)
                                    ? "bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-500/30 text-indigo-400"
                                    : "bg-zinc-700/20 border-zinc-700/30 text-gray-500 cursor-not-allowed opacity-50"
                                }`}
                              >
                                <Calendar size={16} className="sm:w-[14px] sm:h-[14px]" />
                                <span className="hidden sm:inline">Ajustar Deuda</span>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); openAdjustments(m); }}
                                aria-label="Gestión de ajustes"
                                title="Gestión de ajustes"
                                className="flex items-center gap-1 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 px-3 py-2 sm:px-2 sm:py-1 rounded-lg transition-all duration-200 font-medium text-sm"
                              >
                                <SlidersHorizontal size={16} className="sm:w-[14px] sm:h-[14px]" />
                                <span className="hidden sm:inline">Ajustes</span>
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); confirmDelete(actualId); }}
                                  aria-label="Eliminar membresía"
                                  title="Eliminar membresía"
                                  className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-3 py-2 sm:px-2 sm:py-1 rounded-lg transition-all duration-200 font-medium text-sm"
                                >
                                  <Trash2 size={16} className="sm:w-[14px] sm:h-[14px]" />
                                  <span className="hidden sm:inline">Eliminar</span>
                                </button>
                              )}
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
        membership={membership.find((m) => (m.id || m._id) === (update?.id || update?._id)) || update}
      />
      {/* Modal para pagos */}
      <PaymentsModals
        key={`payments-${payments?.id || payments?._id}`}
        isOpen={isModalOpenPayments}
        onClose={() => setisModalOpenPayments(false)}
        membership={membership.find((m) => (m.id || m._id) === (payments?.id || payments?._id)) || payments}
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
        membership={membership.find((m) => (m.id || m._id) === (attendance?.id || attendance?._id)) || attendance}
      />
      {/* Modal de ajustes de cobro */}
      <AdjustmentsModal
        key={`adjustments-${adjustments?.id || adjustments?._id}`}
        isOpen={isModalOpenAdjustments}
        onClose={() => setIsModalOpenAdjustments(false)}
        membership={membership.find((m) => (m.id || m._id) === (adjustments?.id || adjustments?._id)) || adjustments}
      />
    </>
  );
}
