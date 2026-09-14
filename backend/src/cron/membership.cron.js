import cron from "node-cron";
import { runMonthlyBilling } from "../services/billing.service.js";

// Cron de facturación mensual (red de seguridad).
//
// ⚠️ IMPORTANTE: la solución principal ya no depende de este cron.
// La facturación ahora es "lazy": se recalcula automáticamente al leer cada
// membresía (applyBillingIfDue), así el sistema se pone al día aunque el
// server de Render haya estado dormido días o meses.
//
// Este cron (día 1 a las 00:00) solo sirve como refuerzo cuando el server
// está activo. Además existe el endpoint POST /api/billing/run (protegido con
// BILLING_CRON_SECRET) para conectarlo a servicios externos como cron-job.org
// o GitHub Actions, que despiertan el server justo a tiempo.
cron.schedule("0 0 1 * *", async () => {
  console.log("▶ Cron de facturación mensual iniciado...");

  try {
    const result = await runMonthlyBilling();
    if (result.totalBilled > 0) {
      console.log(
        `✅ Facturación completada: ${result.membersProcessed} jugadores procesados, ${result.totalBilled} meses facturados.`
      );
    } else {
      console.log("✓ No hay membresías pendientes de facturar.");
    }
  } catch (error) {
    console.error("❌ Error en el cron de facturación:", error);
  }
});