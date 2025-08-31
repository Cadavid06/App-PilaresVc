import cron from "node-cron";
import MemberShip from "../models/memberShip.models.js"

cron.schedule("0 0 * * *", async () => { // todos los días a medianoche
  console.log("Ejecutando cron job para actualizar membresías...");

  const today = new Date();

  // Buscar membresías que ya hayan vencido
  const expiredMemberships = await MemberShip.find({
    endDate: { $lt: today },
    status: { $ne: "Expirada" }
  });

  for (const membership of expiredMemberships) {
    membership.status = "Expirada";
    await membership.save();
  }

  console.log(`Membresías expiradas actualizadas: ${expiredMemberships.length}`);
});
