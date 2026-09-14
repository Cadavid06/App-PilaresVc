import { Op } from "sequelize";
import Setting from "../models/settings.models.js";
import { MemberShip } from "../models/memberShip.models.js";

const DEFAULTS = {
  monthlyFee: 20000,
  inscriptionFee: 15000,
  reactivationFee: 20000,
};

// ─── Helpers de fecha (trabajan con strings DATEONLY de la DB) ──────────────
function parseDateOnly(v) {
  if (!v) return null;
  const s = String(v).slice(0, 10);
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d, key: y * 10000 + m * 100 + d };
}

function nextMonthFirst({ y, m }) {
  const nm = m === 12 ? 1 : m + 1;
  const ny = m === 12 ? y + 1 : y;
  return { y: ny, m: nm, d: 1, key: ny * 10000 + nm * 100 + 1 };
}

function toDate(y, m, d) {
  return new Date(y, m - 1, d);
}

// ─── Settings ──────────────────────────────────────────────────────────────
export async function getSettings() {
  const [row] = await Setting.findOrCreate({
    where: { id: 1 },
    defaults: DEFAULTS,
  });
  return {
    monthlyFee: row.monthlyFee,
    inscriptionFee: row.inscriptionFee,
    reactivationFee: row.reactivationFee,
  };
}

// ─── Cálculo de deuda ──────────────────────────────────────────────────────
export function calcDeuda(plain) {
  return Math.max(0, (plain.totalFeeExpected || 0) - (plain.totalPaid || 0));
}

// ─── Estado basado en reglas de negocio ────────────────────────────────────
// deuda <= 0        → Activa
// deuda <= fee      → Pendiente (solo debe el mes actual)
// deuda > fee       → Expirada (debe mes actual + anteriores)
export function statusFromDebt(deuda, monthlyFee) {
  if (deuda <= 0) return "Activa";
  if (deuda <= monthlyFee) return "Pendiente";
  return "Expirada";
}

// ─── Facturación lazy (se ejecuta al leer membresías) ──────────────────────
// Recorre los meses pendientes desde nextBillingDate hasta hoy, sumando
// la mensualidad y recalculando estado. Idempotente y seguro para servidores
// que se duermen (Render free).
export async function applyBillingIfDue(member, settings) {
  if (!settings) settings = await getSettings();
  const current = parseDateOnly(member.nextBillingDate);
  if (!current) return { changed: false, billed: 0 };

  const now = new Date();
  const todayKey =
    now.getFullYear() * 10000 +
    (now.getMonth() + 1) * 100 +
    now.getDate();

  let billed = 0;
  let cursor = current;
  const MAX_CATCH_UP = 60;

  while (cursor.key <= todayKey && billed < MAX_CATCH_UP) {
    member.totalFeeExpected += settings.monthlyFee;
    cursor = nextMonthFirst(cursor);
    billed++;
  }

  if (billed === 0) return { changed: false, billed: 0 };

  const newNext = toDate(cursor.y, cursor.m, cursor.d);
  const deuda = calcDeuda({
    totalFeeExpected: member.totalFeeExpected,
    totalPaid: member.totalPaid,
  });
  const status = statusFromDebt(deuda, settings.monthlyFee);

  await member.update({
    totalFeeExpected: member.totalFeeExpected,
    status,
    nextBillingDate: newNext,
  });

  return { changed: true, billed };
}

// ─── Facturación batch (cron o trigger manual) ─────────────────────────────
export async function runMonthlyBilling() {
  const settings = await getSettings();
  const all = await MemberShip.findAll();
  let totalBilled = 0;
  let membersProcessed = 0;

  for (const m of all) {
    const result = await applyBillingIfDue(m, settings);
    if (result.changed) {
      membersProcessed += 1;
      totalBilled += result.billed;
    }
  }

  return { totalBilled, membersProcessed };
}
