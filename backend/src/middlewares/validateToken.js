import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { TOKEN_SECRET } from "../config.js";

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

    const decoded = jwt.verify(token, TOKEN_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("authRequired error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
