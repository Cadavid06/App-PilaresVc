import { Router } from "express";
import { register, login, logout, verifyToken } from "../controllers/auth.controllers.js";
import { validateSchema } from "../middlewares/validator.schemas.js";
import { authRequired } from "../middlewares/validateToken.js";
import { requireRole } from "../middlewares/requireRole.js";
import { loginSchema, registerSchema } from "../schemas/auth.schemas.js";

const router = Router();

// Solo admin puede crear nuevos usuarios (admin o entrenador)
router.post("/register", authRequired, requireRole("admin"), validateSchema(registerSchema), register);
router.post("/login", validateSchema(loginSchema), login);
router.post("/logout", logout);
router.get("/verify", verifyToken);

export default router;
