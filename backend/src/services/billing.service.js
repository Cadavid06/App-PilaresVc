import { Op } from "sequelize";
import sequelize from "../db.js";
import Setting from "../models/settings.models.js";
import { MemberShip } from "../models/memberShip.models.js";
import BillingAdjustment from "../models/billingAdjustment.models.js";

const DEFAULTS = {
  monthlyFee: 20000,
  inscriptionFee: 15000,
  reactivationFee: 20000,
  siblingDiscount: 0,
};

// ID fijo de la fila de configuración (los UUID no son autoincrementales).
// Debe coincidir con el UUID asignado en la migración pgAdmin (bk/sql/uuids-...).
export const SETTINGS_ID = "00000000-0000-4000-8000-000000000001";

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
    where: { id: SETTINGS_ID },
    defaults: DEFAULTS,
  });
  return {
    monthlyFee: row.monthlyFee,
    inscriptionFee: row.inscriptionFee,
    reactivationFee: row.reactivationFee,
    siblingDiscount: row.siblingDiscount,
  };
}

// ─── Cálculo de deuda ──────────────────────────────────────────────────────
export function calcDeuda(plain, totalAdjustments = 0, siblingDiscount = 0) {
  // Se elimina el Math.max para permitir saldos a favor (negativos).
  // El descuento de hermanos ya no se resta aquí de forma global,
  // sino que se aplica mes a mes en applyBillingIfDue.
  return (plain.totalFeeExpected || 0) + totalAdjustments - (plain.totalPaid || 0);
}

// ─── Total de ajustes de un jugador ───────────────────────────────────────
export async function getAdjustmentsTotal(memberShipId) {
  const result = await BillingAdjustment.sum("amount", {
    where: { memberShipId },
  });
  return result || 0;
}

// ─── Mapa de ajustes para todos los jugadores (para listados) ──────────────
export async function getAllAdjustmentsTotal() {
  const results = await BillingAdjustment.findAll({
    attributes: [
      "memberShipId",
      [sequelize.fn("SUM", sequelize.col("amount")), "total"],
    ],
    group: ["memberShipId"],
    raw: true,
  });

  const map = {};
  for (const r of results) {
    map[r.memberShipId] = parseFloat(r.total) || 0;
  }
  return map;
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
  
  const discount = (member.familyId && settings.siblingDiscount > 0) ? settings.siblingDiscount : 0;
  const netMonthlyFee = Math.max(0, settings.monthlyFee - discount);

  while (cursor.key <= todayKey && billed < MAX_CATCH_UP) {
    member.totalFeeExpected += netMonthlyFee;
    cursor = nextMonthFirst(cursor);
    billed++;
  }

  if (billed === 0) return { changed: false, billed: 0 };

  const newNext = toDate(cursor.y, cursor.m, cursor.d);
  const totalAdj = await getAdjustmentsTotal(member.id);
  const deuda = calcDeuda({
    totalFeeExpected: member.totalFeeExpected,
    totalPaid: member.totalPaid,
  }, totalAdj);
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
