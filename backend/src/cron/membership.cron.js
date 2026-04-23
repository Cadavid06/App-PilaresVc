import cron from "node-cron";
import { Op } from "sequelize";
import { MemberShip } from "../models/memberShip.models.js";

const MONTHLY_FEE = 20000;

// ─── Helpers locales ──────────────────────────────────────────────────────
const calcDeudaFromPlain = (plain) => {
  return Math.max(0, (plain.totalFeeExpected || 0) - (plain.totalPaid || 0));
};

const statusFromDebt = (deuda, totalPaid) => {
  if (deuda <= 0) return "Activa";
  if (totalPaid > 0) return "Pendiente";
  return "Expirada";
};

// ─── Cron: día 1 de cada mes a las 00:00 ─────────────────────────────────
// Recorre todos los jugadores con nextBillingDate <= hoy,
// les suma la mensualidad y avanza la fecha de cobro.
// También crea el registro de asistencia del mes (attended=true por defecto).
cron.schedule("0 0 1 * *", async () => {
  console.log("▶ Cron de facturación mensual iniciado...");

  try {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const membersToBill = await MemberShip.findAll({
      where: { nextBillingDate: { [Op.lte]: today } },
    });

    if (membersToBill.length === 0) {
      console.log("✓ No hay membresías para facturar este mes.");
      return;
    }

    const billingMonth = now.getMonth() + 1; // mes actual (1-12)
    const billingYear  = now.getFullYear();
    const nextDate     = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    let updatedCount = 0;

    for (const member of membersToBill) {
      const newExpected = (member.totalFeeExpected || 0) + MONTHLY_FEE;

      // Recalcular deuda con el nuevo expected y las asistencias actuales
      const plain = member.get({ plain: true });
      plain.totalFeeExpected = newExpected; // simulamos el valor nuevo
      const deuda  = calcDeudaFromPlain(plain);
      const status = statusFromDebt(deuda, plain.totalPaid);

      await member.update({
        totalFeeExpected: newExpected,
        status,
        nextBillingDate: nextDate,
      });

      updatedCount++;
    }

    console.log(`✅ Facturación completada: ${updatedCount} jugadores procesados.`);
  } catch (error) {
    console.error("❌ Error en el cron de facturación:", error);
  }
});
