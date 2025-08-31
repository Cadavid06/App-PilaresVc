import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix para __dirname en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar el .env desde la carpeta backend
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("MONGO_URI desde .env:", process.env.MONGO_URI); // debug


import app from "./app.js";
import connectDB from "./db.js";
import './cron/membership.cron.js'

const PORT = process.env.PORT || 4000;

connectDB();

app.listen(PORT, () => {
  console.log(`Corriendo en el puerto ${PORT}`);
});
