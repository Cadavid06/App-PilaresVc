import { Router } from "express";
import {
  getAdjustmentsByMember,
  createAdjustment,
  deleteAdjustment,
  getAdjustmentsSummary,
} from "../controllers/billingAdjustment.controllers.js";
import { authRequired } from "../middlewares/validateToken.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = Router();

router.get("/adjustments/summary", authRequired, getAdjustmentsSummary);
router.get("/adjustments/:memberShipId", authRequired, getAdjustmentsByMember);
router.post("/adjustments/:memberShipId", authRequired, requireRole("admin"), createAdjustment);
router.delete("/adjustments/:id", authRequired, requireRole("admin"), deleteAdjustment);

export default router;