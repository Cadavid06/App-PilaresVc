import { Router } from "express";
import {
  createMembership,
  getMemberships,
  getMembershipById,
  updateUserData,
  addPayments,
  renewMembership,
  forgiveDebt,
  deleteMembership,
  adjustDebt,
} from "../controllers/membership.controllers.js";
import { authRequired } from "../middlewares/validateToken.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = Router();

// ─── CRUD principal ───────────────────────────────────────────
router.post  ("/memberShip",     authRequired, createMembership);
router.get   ("/memberShip",     authRequired, getMemberships);
router.get   ("/memberShip/:id", authRequired, getMembershipById);
router.put   ("/memberShip/:id", authRequired, updateUserData);
router.delete("/memberShip/:id", authRequired, requireRole("admin"), deleteMembership);

// ─── Operaciones financieras ──────────────────────────────────
router.put("/memberShip/:id/payments", authRequired, addPayments);
router.put("/memberShip/:id/renew",    authRequired, renewMembership);
router.put("/memberShip/:id/forgive",  authRequired, forgiveDebt);

// ─── Ajuste de Deuda (Condonación) ────────────────────────────
router.put("/memberShip/:id/adjust-debt", authRequired, adjustDebt);

export default router;
