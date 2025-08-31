// MembershipPage.jsx

import { useEffect, useState } from "react";
import MembershipsTable from "../components/MembershipsTable";
import { useMembership } from "../context/MembershipContext";

function MembershipPage() {
  const { membership, getMemberships } = useMembership();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    getMemberships();
  }, []);

  const filteredMemberships = membership.filter((m) => {
    const matchesSearch = m.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-red-900/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="flex w-full sm:w-1/2 gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "all"
                  ? "bg-red-500 text-white"
                  : "bg-zinc-800/50 border border-zinc-700/50 text-gray-400 hover:bg-zinc-700/50"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus("Activa")}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "Activa"
                  ? "bg-green-600 text-white"
                  : "bg-zinc-800/50 border border-zinc-700/50 text-gray-400 hover:bg-zinc-700/50"
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterStatus("Expirada")}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
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
          {filteredMemberships.length === 0 ? (
            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 p-8 rounded-xl text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No hay resultados
              </h3>
              <p className="text-gray-400 mb-4">
                Ajusta los filtros o la búsqueda para encontrar membresías
              </p>
            </div>
          ) : (
            <MembershipsTable membership={filteredMemberships} />
          )}
        </div>
      </div>
    </div>
  );
}

export default MembershipPage;
