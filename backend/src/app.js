import express from "express";
import authRoutes from "./routes/auth.routes.js";
import memberShip from "./routes/memberShip.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", memberShip);

export default app;
