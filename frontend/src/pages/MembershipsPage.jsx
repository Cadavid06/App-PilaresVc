import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import MembershipsTable from "../components/MembershipsTable";
import { useMembership } from "../context/MembershipContext";

function MembershipPage() {
  const { membership, getMemberships } = useMembership();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

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
    const matchesGender = filterGender === "all" || m.gender === filterGender;
    const matchesCategory = filterCategory === "all" || m.category === filterCategory;
    return matchesSearch && matchesStatus && matchesGender && matchesCategory;
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
    <main className="relative z-10 w-full py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-red-400">Gestión del club</p>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Membresías
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {filteredMemberships.length} jugador{filteredMemberships.length !== 1 ? 'es' : ''} en el registro
            </p>
          </div>
          <Link
            to="/add-memberships"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all"
          >
            <Plus size={16} />
            Nuevo jugador
          </Link>
        </div>

        <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-1/3 bg-zinc-700/50 border border-zinc-600/50 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: "all", label: "Todos", color: "bg-zinc-600 text-white" },
                { key: "Activa", label: "Activos", color: "bg-emerald-600 text-white" },
                { key: "Pendiente", label: "Pendientes", color: "bg-yellow-600 text-white" },
                { key: "Expirada", label: "Expirados", color: "bg-red-600 text-white" },
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => { setFilterStatus(key === "all" ? "all" : key); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    (key === "all" && filterStatus === "all") || filterStatus === key
                      ? color
                      : "bg-zinc-700/50 text-gray-400 hover:text-white hover:bg-zinc-600/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <select
              value={filterGender}
              onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }}
              className="bg-zinc-700/50 border border-zinc-600/50 text-gray-300 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
            >
              <option value="all">Todos los géneros</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="bg-zinc-700/50 border border-zinc-600/50 text-gray-300 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
            >
              <option value="all">Todas las categorías</option>
              <option value="Mini">Mini</option>
              <option value="Sub-13">Sub-13</option>
              <option value="Sub-15">Sub-15</option>
              <option value="Sub-17">Sub-17</option>
              <option value="Sub-19">Sub-19</option>
              <option value="Sub-21">Sub-21</option>
              <option value="Libre">Libre</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {currentMemberships.length === 0 ? (
            <div className="bg-zinc-800/60 border border-zinc-700/50 p-12 rounded-xl text-center">
              <p className="text-gray-400">
                No se encontraron membresías con estos filtros
              </p>
            </div>
          ) : (
            <>
              <MembershipsTable
                membership={currentMemberships}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
              />

              {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="px-3 py-1.5 rounded-lg text-sm bg-zinc-700/50 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    ←
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        currentPage === i + 1
                          ? "bg-red-600 text-white"
                          : "bg-zinc-700/50 text-gray-400 hover:text-white"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="px-3 py-1.5 rounded-lg text-sm bg-zinc-700/50 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default MembershipPage;
