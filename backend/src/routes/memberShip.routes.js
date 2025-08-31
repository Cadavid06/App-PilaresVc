import { Router } from "express";
import {
  addPayments,
  createMembership,
  deleteMembership,
  getDaysLeft,
  getMembershipById,
  getMemberships,
  renewMembership,
  updateUserData,
} from "../controllers/membership.controllers.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

router.post("/memberShip", authRequired, createMembership);

router.get("/memberShip", authRequired, getMemberships);
router.get("/memberShip/:id", authRequired, getMembershipById);
router.get("/memberShip/:id/expired", authRequired, getDaysLeft);

router.put("/memberShip/:id", authRequired, updateUserData);
router.put("/memberShip/:id/payments", authRequired, addPayments);
router.put("/memberShip/:id/renew", authRequired, renewMembership);

router.delete("/memberShip/:id", authRequired, deleteMembership);

export default router;
