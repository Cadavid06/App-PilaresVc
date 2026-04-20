import jwt from "jsonwebtoken";
import Admin from "../models/admin.models.js";

export const authRequired = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Sequelize: findByPk() reemplaza a findById()
    const admin = await Admin.findByPk(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("authRequired error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
