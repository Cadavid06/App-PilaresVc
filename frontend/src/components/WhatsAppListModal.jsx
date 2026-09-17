import { useMemo, useState } from "react";
import { Check, Clipboard, MessageCircle, X } from "lucide-react";

const formatCurrency = (amount) =>
  `$${Math.round(amount || 0).toLocaleString("es-CO")}`;

const getCycleKey = (date = new Date()) => {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
};

const getCycleLabel = (cycle) => {
  const [year, month] = cycle.split("-");
  return new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" })
    .format(new Date(Number(year), Number(month) - 1, 1));
};

const getPaymentsForCycle = (member, cycle) =>
  (member.payments || []).filter((payment) => {
    if (payment.month && payment.year) {
      return `${payment.year}-${String(payment.month).padStart(2, "0")}` === cycle;
    }
    return getCycleKey(payment.date) === cycle;
  });

export default function WhatsAppListModal({ isOpen, onClose, memberships, monthlyFee }) {
  const currentCycle = getCycleKey();
  const [cycle, setCycle] = useState(currentCycle);
  const [paymentFilter, setPaymentFilter] = useState("paid");
  const [gender, setGender] = useState("all");
  const [category, setCategory] = useState("all");
  const [copied, setCopied] = useState(false);

  const categories = useMemo(
    () => [...new Set(memberships.map((member) => member.category).filter(Boolean))].sort(),
    [memberships]
  );

  const rows = useMemo(() => memberships
    .filter((member) => gender === "all" || member.gender === gender)
    .filter((member) => category === "all" || member.category === category)
    .map((member) => {
      const payments = getPaymentsForCycle(member, cycle);
      const paid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      const debt = Number(member.deuda || 0);
      const hasPayment = paid > 0;
      const isCurrentCycle = cycle === getCycleKey();
      
      let status = "none";
      if (isCurrentCycle) {
        status = debt <= 0 ? "paid" 
          : hasPayment ? "partial" 
          : member.status === "Expirada" ? "overdue" 
          : "pending";
      } else {
        if (hasPayment) {
          status = paid >= monthlyFee ? "paid" : "partial";
        }
      }
      return { member, paid, debt, status };
    })
    .filter(({ status }) => {
      if (paymentFilter === "paid") return status === "paid";
      if (paymentFilter === "partial") return status === "partial";
      if (paymentFilter === "overdue") return status === "overdue" || status === "pending";
      if (paymentFilter === "payments") return status === "paid" || status === "partial";
      return status !== "none";
    }), [memberships, gender, category, cycle, paymentFilter, monthlyFee]);

  const text = useMemo(() => {
    const header = getCycleLabel(cycle).replace(/^./, (letter) => letter.toUpperCase());
    const lines = rows.map(({ member, paid, debt, status }) => {
      if (status === "paid") return member.clientName;
      if (status === "partial") return `${member.clientName} - Abonó ${formatCurrency(paid)}`;
      if (status === "overdue" || status === "pending") return `${member.clientName} - Debe ${formatCurrency(debt)}`;
      return member.clientName;
    });
    return [header, ...lines].join("\n");
  }, [rows, cycle]);

  const copyList = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="whatsapp-list-title">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-zinc-700 bg-zinc-900 text-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-zinc-800 p-5 sm:p-6">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-400">
              <MessageCircle size={20} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Copiar y pegar</span>
            </div>
            <h2 id="whatsapp-list-title" className="text-2xl font-black">Lista para WhatsApp</h2>
            <p className="mt-1 text-sm text-zinc-400">Filtra el ciclo y copia un listado de texto limpio.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
          <label className="text-xs font-semibold text-zinc-400">Mes
            <input 
              type="month" 
              value={cycle} 
              onChange={(event) => setCycle(event.target.value)} 
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </label>
          <label className="text-xs font-semibold text-zinc-400">Género
            <select value={gender} onChange={(event) => setGender(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white">
              <option value="all">Todos</option><option value="Femenino">Femenino</option><option value="Masculino">Masculino</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-zinc-400">Categoría
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white">
              <option value="all">Todas</option>{categories.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2 px-5 sm:px-6">
          {[{ key: "paid", label: "Pagaron" }, { key: "partial", label: "Abonaron" }, { key: "payments", label: "Pagaron o abonaron" }, { key: "overdue", label: "Morosos" }, { key: "all", label: "Todos" }].map((filter) => (
            <button key={filter.key} type="button" onClick={() => setPaymentFilter(filter.key)} className={`rounded-full px-3 py-2 text-xs font-semibold transition ${paymentFilter === filter.key ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mx-5 mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:mx-6">
          <div className="mb-3 flex items-center justify-between text-xs text-zinc-500"><span>{rows.length} resultado{rows.length === 1 ? "" : "s"}</span><span>Mensualidad: {formatCurrency(monthlyFee)}</span></div>
          <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap font-sans text-sm leading-7 text-zinc-200">{text || "No hay jugadores para estos filtros."}</pre>
        </div>

        <div className="flex gap-3 p-5 sm:justify-end sm:p-6">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-700 sm:flex-none">Cerrar</button>
          <button type="button" onClick={copyList} disabled={!rows.length} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">
            {copied ? <Check size={17} /> : <Clipboard size={17} />}{copied ? "Copiado" : "Copiar lista"}
          </button>
        </div>
      </div>
    </div>
  );
}
