import cron from "node-cron";
import { MemberShip } from "../models/memberShip.models.js";

// Se ejecuta a las 00:00 del día 1 de cada mes
cron.schedule("0 0 1 * *", async () => {
  console.log("Ejecutando cron job para actualizar membresías...");

  // Sequelize: update() con where:{} reemplaza a updateMany({}, ...)
  const [affectedRows] = await MemberShip.update(
    { status: "Expirada" },
    { where: {} } // sin where filtra todos los registros
  );

  console.log(`Membresías expiradas actualizadas: ${affectedRows}`);
});

