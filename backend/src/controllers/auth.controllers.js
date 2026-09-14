import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createdAccessToken } from "../libs/jwt.js";
import { TOKEN_SECRET } from "../config.js";

export const register = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const userFound = await User.findOne({ where: { email } });
    if (userFound)
      return res.status(400).json(["The email is already in use"]);

    const passwordHash = await bcrypt.hash(password, 10);
    const userSaved = await User.create({
      email,
      password: passwordHash,
      role: role === "admin" ? "admin" : "entrenador",
    });

    // Si hay req.user, un admin está creando otro usuario → no crear sesión
    if (req.user) {
      return res.json({ id: userSaved.id, email: userSaved.email, role: userSaved.role });
    }

    // Auto-registro (primer admin, etc.) → crear sesión
    const token = await createdAccessToken({ id: userSaved.id });
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ id: userSaved.id, email: userSaved.email, role: userSaved.role, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userFound = await User.findOne({ where: { email } });
    if (!userFound) return res.status(400).json(["User not found"]);

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) return res.status(400).json(["Incorrect Password"]);

    const token = await createdAccessToken({ id: userFound.id });
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ id: userFound.id, email: userFound.email, role: userFound.role, token });
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

  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    const userFound = await User.findByPk(user.id);
    if (!userFound) return res.status(401).json({ message: "Unauthorized" });
    return res.json({ id: userFound.id, email: userFound.email, role: userFound.role });
  });
};
