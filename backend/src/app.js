import express from "express";
import authRoutes from "./routes/auth.routes.js";
import memberShip from "./routes/memberShip.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import userRoutes from "./routes/user.routes.js";
import billingAdjustmentRoutes from "./routes/billingAdjustment.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", memberShip);
app.use("/api", settingsRoutes);
app.use("/api", billingRoutes);
app.use("/api", userRoutes);
app.use("/api", billingAdjustmentRoutes);

export default app;