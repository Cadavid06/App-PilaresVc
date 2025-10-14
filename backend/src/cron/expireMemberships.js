import dotenv from "dotenv";
dotenv.config();

import MemberShip from "../models/memberShip.models.js"; // Ajusta la ruta a tu modelo
import connectDB from "../db.js"; // Ajusta la ruta a tu función de conexión

async function expireMemberships() {
  console.log("Iniciando conexión a la base de datos...");
  await connectDB();
  console.log("Conexión exitosa. Ejecutando actualización...");

  try {
    // La lógica de actualización: Establecer el estado en "Expirada"
    const result = await MemberShip.updateMany({}, { status: "Expirada" });

    console.log(`✅ Membresías expiradas actualizadas: ${result.modifiedCount}`);
  } catch (error) {
    console.error("❌ Error al ejecutar la tarea Cron:", error);
  } finally {
    // Cierra la conexión a la base de datos para terminar el proceso
    await mongoose.connection.close();
    console.log("Conexión a MongoDB cerrada. Tarea finalizada.");
    process.exit(0); // Asegura que el proceso Node.js se detenga
  }
}

// Nota: También debes asegurarte de importar 'mongoose' para poder cerrarla
import mongoose from "mongoose";

expireMemberships();