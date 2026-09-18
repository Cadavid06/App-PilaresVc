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
import PlayerBottomSheet from "./PlayerBottomSheet";

const MOBILE_STATUS_COLORS = {
  Activa: { text: "text-emerald-400", dot: "bg-emerald-400" },
  Pendiente: { text: "text-yellow-400", dot: "bg-yellow-400" },
  Expirada: { text: "text-red-400", dot: "bg-red-400" },
};

export default function MembershipsTable({
  membership,
  currentPage,
  itemsPerPage,
}) {
  const { deleteMembership, settings } = useMembership();
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
  const [sheetMember, setSheetMember] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getMembership = (member) => {
    setSelectedMembership(member);
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

  const openSheet = (member) => {
    setSheetMember(member);
    setIsSheetOpen(true);
  };


  return (
    <>
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Vista Desktop (Tabla completa) */}
        <div className="hidden md:block overflow-x-auto">
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
                            <div className="truncate max-w-[160px] sm:max-w-[200px]">
                              <p className="leading-tight truncate">{m.clientName}</p>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleRow(actualId); }}
                              className="p-2 -mr-2 text-gray-400 hover:text-white"
                              aria-label="Expandir fila"
                            >
                              <ChevronDown size={20} className={`transition-transform ${expandedRow === actualId ? 'rotate-180' : ''}`} />
                            </button>
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
                                onClick={(e) => { e.stopPropagation(); getMembership(m); }}
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
                              <div className="relative group inline-block">
                                <button
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (m.deuda > (settings?.monthlyFee || 20000)) markAttendance(m); 
                                  }}
                                  aria-label="Ajustar deuda por inasistencia"
                                  className={`flex items-center gap-1 border px-3 py-2 sm:px-2 sm:py-1 rounded-lg transition-all duration-200 font-medium text-sm ${
                                    m.deuda > (settings?.monthlyFee || 20000)
                                      ? "bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-500/30 text-indigo-400"
                                      : "bg-zinc-700/20 border-zinc-700/30 text-gray-500 cursor-not-allowed opacity-50"
                                  }`}
                                >
                                  <Calendar size={16} className="sm:w-[14px] sm:h-[14px]" />
                                  <span className="hidden sm:inline">Ajustar Deuda</span>
                                </button>
                                {m.deuda <= (settings?.monthlyFee || 20000) && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-2 bg-zinc-900 border border-zinc-700/50 text-gray-300 text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none shadow-xl">
                                    No hay deuda condonable (el mes actual no se puede condonar)
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-zinc-700/50"></div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px] border-4 border-transparent border-t-zinc-900"></div>
                                  </div>
                                )}
                              </div>
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

        {/* Vista Móvil (Cards minimalistas + Bottom Sheet) */}
        <div className="md:hidden flex flex-col gap-3 p-3">
          {membership.map((m) => {
            const actualId = m.id || m._id;
            const initials = (m.clientName || "")
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0].toUpperCase())
              .join("");
            const sc = MOBILE_STATUS_COLORS[m.status] || MOBILE_STATUS_COLORS.Expirada;
            return (
              <button
                key={`mobile-${actualId}`}
                onClick={() => openSheet(m)}
                className="flex items-center gap-3 rounded-2xl border border-zinc-700/50 bg-zinc-800/80 p-4 text-left transition-all active:scale-[0.98]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-sm font-black text-white">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {m.clientName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {m.category || "—"} · {m.gender || "—"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide ${sc.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                    {m.status}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      m.deuda > 0 ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {m.deuda > 0 ? `$${m.deuda.toLocaleString()}` : "$0"}
                  </span>
                </div>
              </button>
            );
          })}
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
        onConfirm={async () => {
          await deleteMembership(membershipToDelete);
          setIsConfirmOpen(false);
        }}
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
      {/* Hoja inferior móvil */}
      <PlayerBottomSheet
        member={sheetMember}
        isOpen={isSheetOpen}
        isAdmin={isAdmin}
        canCondone={(sheetMember?.deuda || 0) > (settings?.monthlyFee || 20000)}
        onClose={() => setIsSheetOpen(false)}
        onView={getMembership}
        onEdit={updateClient}
        onPay={addPayments}
        onCondone={markAttendance}
        onAdjust={openAdjustments}
        onDelete={confirmDelete}
      />
    </>
  );
}
