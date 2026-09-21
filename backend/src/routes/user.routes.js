import { Router } from "express";
import { getUsers, updateUser, deleteUser } from "../controllers/user.controllers.js";
import { authRequired } from "../middlewares/validateToken.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = Router();

router.get("/users", authRequired, requireRole("admin"), getUsers);
router.put("/users/:id", authRequired, requireRole("admin"), updateUser);
router.delete("/users/:id", authRequired, requireRole("admin"), deleteUser);

export default router;