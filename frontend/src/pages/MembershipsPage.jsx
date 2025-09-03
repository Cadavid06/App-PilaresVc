import { useEffect, useState } from "react";
import MembershipsTable from "../components/MembershipsTable";
import { useMembership } from "../context/MembershipContext";

function MembershipPage() {
  const { membership, getMemberships } = useMembership();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    getMemberships();
  }, []);

  const filteredMemberships = membership.filter((m) => {
    const matchesSearch = m.clientName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calcular las membresías que se muestran en esta página
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentMemberships = filteredMemberships.slice(
    indexOfFirst,
    indexOfLast
  );

  const totalPages = Math.ceil(filteredMemberships.length / itemsPerPage);

  return (
    <div className="relative z-10 my-15 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              Membresías
            </h1>
            <p className="text-red-400 text-lg">
              Gestiona las membresías de tu club
            </p>
          </div>
          <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg px-4 py-2">
            <span className="text-red-400 font-semibold">
              Total: {filteredMemberships.length} membresías
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Buscar por nombre de cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/2 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex flex-wrap w-full sm:w-1/2 gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "all"
                  ? "bg-red-500 text-white"
                  : "bg-zinc-800/50 border border-zinc-700/50 text-gray-400 hover:bg-zinc-700/50"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus("Activa")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "Activa"
                  ? "bg-green-600 text-white"
                  : "bg-zinc-800/50 border border-zinc-700/50 text-gray-400 hover:bg-zinc-700/50"
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterStatus("Pendiente")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "Pendiente"
                  ? "bg-yellow-600 text-white"
                  : "bg-zinc-800/50 border border-zinc-700/50 text-gray-400 hover:bg-zinc-700/50"
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilterStatus("Expirada")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "Expirada"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800/50 border border-zinc-700/50 text-gray-400 hover:bg-zinc-700/50"
              }`}
            >
              Expirados
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {currentMemberships.length === 0 ? (
            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 p-8 rounded-xl text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                No hay resultados
              </h3>
              <p className="text-gray-400 mb-4">
                Ajusta los filtros o la búsqueda para encontrar membresías
              </p>
            </div>
          ) : (
            <>
              <MembershipsTable
                membership={currentMemberships}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
              />

              {/* Paginación */}
              <div className="flex justify-center mt-6 gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="px-3 py-1 rounded bg-zinc-700 text-gray-300 disabled:opacity-50"
                >
                  Anterior
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1
                        ? "bg-red-500 text-white"
                        : "bg-zinc-700 text-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-3 py-1 rounded bg-zinc-700 text-gray-300 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MembershipPage;
