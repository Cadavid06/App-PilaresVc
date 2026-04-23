import Admin from "../models/admin.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createdAccessToken } from "../libs/jwt.js";
import { TOKEN_SECRET } from "../config.js";

// ✅ FIX #11: verifyToken ahora usa TOKEN_SECRET desde config.js,
// igual que jwt.js y validateToken.js. Fuente única garantizada.

export const register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const adminFound = await Admin.findOne({ where: { email } });
    if (adminFound)
      return res.status(400).json(["The email is already in use"]);

    const passwordHash = await bcrypt.hash(password, 10);
    const adminSaved = await Admin.create({ email, password: passwordHash });
    const token = await createdAccessToken({ id: adminSaved.id });

    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ id: adminSaved.id, email: adminSaved.email, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userFound = await Admin.findOne({ where: { email } });
    if (!userFound) return res.status(400).json(["User not found"]);

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) return res.status(400).json(["Incorrect Password"]);

    const token = await createdAccessToken({ id: userFound.id });
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ id: userFound.id, email: userFound.email, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
  return res.json({ message: "Logged out" });
};

export const verifyToken = async (req, res) => {
  let token = req.cookies.token;

  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  // ✅ FIX #11: era process.env.JWT_SECRET — ahora TOKEN_SECRET desde config.js
  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    const userFound = await Admin.findByPk(user.id);
    if (!userFound) return res.status(401).json({ message: "Unauthorized" });
    return res.json({ id: userFound.id, email: userFound.email });
  });
};
