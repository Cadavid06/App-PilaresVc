import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./db.js";
import './cron/membership.cron.js'

const PORT = process.env.PORT || 4000;

connectDB();

app.listen(PORT, () => {
  console.log(`Corriendo en el puerto ${PORT}`);
});
