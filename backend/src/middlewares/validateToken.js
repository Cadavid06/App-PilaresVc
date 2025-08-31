import jwt from "jsonwebtoken";
import Admin from "../models/admin.models.js";
import { TOKEN_SECRET } from "../config.js";

export const authRequired = async (req, res, next) => {
  try {
    // 1. Revisa si hay token en cookie
    let token = req.cookies.token;

    // 2. Si no hay en cookie, busca en Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]; // quita "Bearer "
      }
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // 3. Verifica el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Busca al admin en la DB (opcional pero recomendado)
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 5. Adjunta el admin al request
    req.admin = admin;

    next();
  } catch (error) {
    console.error("authRequired error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
