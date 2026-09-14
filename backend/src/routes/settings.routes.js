import { Router } from "express";
import { getSettingsController, updateSettings } from "../controllers/settings.controllers.js";
import { authRequired } from "../middlewares/validateToken.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = Router();

router.get("/settings", authRequired, getSettingsController);
router.put("/settings", authRequired, requireRole("admin"), updateSettings);

export default router;