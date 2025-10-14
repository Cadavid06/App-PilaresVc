import cron from "node-cron";
import MemberShip from "../models/memberShip.models.js";

// Se ejecuta a las 00:00 del día 1 de cada mes
cron.schedule("0 0 1 * *", async () => {
  console.log("Ejecutando cron job para actualizar membresías...");

  // Actualizar todas las membresías al estado "Expirada"
  const result = await MemberShip.updateMany({}, { status: "Expirada" });

  console.log(`Membresías expiradas actualizadas: ${result.modifiedCount}`);
});
