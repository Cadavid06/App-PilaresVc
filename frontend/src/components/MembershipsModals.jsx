export default function MembershipsModal({
  isOpen,
  onClose,
  membership,
}) {
  
  if (!isOpen || !membership) return null;

  // Función para pintar estado con estilos
  const renderStatus = (status) => {
    switch (status) {
      case "Activa":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            Activa
          </span>
        );
      case "Expirada":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            Expirada
          </span>
        );
      case "Pendiente":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            Pendiente
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
            Desconocido
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <div className="bg-zinc-800/90 backdrop-blur-xl border border-zinc-700/50 text-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Detalles de la Membresía
              </h2>
              <p className="text-red-400 text-sm">
                Información completa del jugador
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-zinc-700/50 rounded-full p-2 transition-all duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Info personal */}
            <div className="space-y-4">
              <div className="bg-zinc-700/30 rounded-xl p-4 border border-zinc-600/30">
                <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Información Personal
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <span className="text-white font-medium">Jugador:</span>{" "}
                    {membership.clientName}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-white font-medium">
                      Tipo de documento:
                    </span>{" "}
                    {membership.documentType}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-white font-medium">
                      N° de documento:
                    </span>{" "}
                    {membership.clientDocument}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-white font-medium">Teléfono:</span>{" "}
                    {membership.clientPhone}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-white font-medium">
                      Fecha de nacimiento:
                    </span>{" "}
                    {new Date(membership.birthdate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-white font-medium">Correo:</span>{" "}
                    {membership.clientEmail}
                  </p>
                </div>
              </div>

              {/* Membresía */}
              <div className="bg-zinc-700/30 rounded-xl p-4 border border-zinc-600/30">
                <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7h16M4 11h16M4 15h10"
                    />
                  </svg>
                  Membresía
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <span className="text-white font-medium">Estado:</span>{" "}
                    {renderStatus(membership.status)}
                  </p>
                </div>
              </div>
            </div>

            {/* Pagos */}
            <div className="space-y-4">
              <div className="bg-zinc-700/30 rounded-xl p-4 border border-zinc-600/30">
                <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  Información de Pagos
                </h3>
                
                {/* Deuda Pendiente */}
                <div className="mb-4 space-y-2">
                  <p className="text-gray-300">
                    <span className="text-white font-medium">
                      Total Pagado:
                    </span>
                    <span className="text-red-400 font-bold text-lg ml-2">
                      ${membership.totalPaid || 0}
                    </span>
                  </p>
                  <p className="text-gray-300">
                    <span className="text-white font-medium">
                      Deuda Pendiente:
                    </span>
                    <span className="text-yellow-400 font-bold text-lg ml-2">
                      ${membership.deuda || 0}
                    </span>
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">
                    Historial de Pagos:
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {membership.payments?.length > 0 ? (
                      membership.payments.map((p, i) => (
                        <div
                          key={i}
                          className="bg-zinc-600/30 rounded-lg p-3 border border-zinc-500/30"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-red-400 font-semibold">
                              ${p.amount}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {new Date(p.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm italic">
                        No hay pagos registrados
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg shadow-red-500/25"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}