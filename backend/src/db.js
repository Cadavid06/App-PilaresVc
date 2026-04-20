import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // Cambia a console.log si quieres ver las queries SQL
  dialectOptions: {
    // Descomenta estas líneas si tu PostgreSQL usa SSL (ej. Render, Supabase, Neon)
    // ssl: {
    //   require: true,
    //   rejectUnauthorized: false,
    // },
  },
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL conectado correctamente");

    // sync({ force: false }) crea las tablas si no existen, sin borrar datos
    // Usa { force: true } solo en desarrollo para recrear las tablas desde cero
    await sequelize.sync({ force: false });
    console.log("✅ Tablas sincronizadas");
  } catch (error) {
    console.error("❌ Error al conectar a PostgreSQL:", error);
    process.exit(1);
  }
};

export default sequelize;
