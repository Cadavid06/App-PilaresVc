import { Router } from "express";
import { runMonthlyBilling } from "../services/billing.service.js";

const router = Router();

// Trigger manual de facturación, para conectarlo a un cron externo
// (cron-job.org, GitHub Actions, UptimeRobot...). Envía el header:
//   x-cron-secret: <tu BILLING_CRON_SECRET>
// Motivo: el servidor de Render duerme en plan free y node-cron local
// no se ejecuta mientras está dormido.
router.post("/billing/run", async (req, res) => {
  const secret = process.env.BILLING_CRON_SECRET;
  if (!secret || req.headers["x-cron-secret"] !== secret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const result = await runMonthlyBilling();
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en la facturación automática" });
  }
});

export default router;