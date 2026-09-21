import User from "../models/user.models.js";
import bcrypt from "bcryptjs";

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "email", "role", "createdAt", "updatedAt"],
      order: [["createdAt", "ASC"]],
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los usuarios" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, email, password } = req.body;

    const target = await User.findByPk(id);
    if (!target) return res.status(404).json({ message: "Usuario no encontrado" });

    // Actualizar email si se envía uno nuevo
    if (email && email !== target.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: "El correo electrónico ya está en uso" });
      }
      target.email = email;
    }

    // Actualizar rol si se envía
    if (role && role !== target.role) {
      if (role !== "admin" && role !== "entrenador") {
        return res.status(400).json({ message: "Rol inválido" });
      }
      if (target.id === req.user.id) {
        return res.status(400).json({ message: "No puedes cambiar tu propio rol" });
      }
      if (target.role === "admin" && role === "entrenador") {
        const adminCount = await User.count({ where: { role: "admin" } });
        if (adminCount <= 1) {
          return res
            .status(400)
            .json({ message: "No puedes cambiar el rol del último administrador" });
        }
      }
      target.role = role;
    }

    // Actualizar contraseña si se envía
    if (password) {
      target.password = await bcrypt.hash(password, 10);
    }

    await target.save();
    res.json({ id: target.id, email: target.email, role: target.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const target = await User.findByPk(id);
    if (!target) return res.status(404).json({ message: "Usuario no encontrado" });

    if (target.id === req.user.id) {
      return res.status(400).json({ message: "No puedes eliminar tu propia cuenta" });
    }

    if (target.role === "admin") {
      const adminCount = await User.count({ where: { role: "admin" } });
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ message: "No puedes eliminar el último administrador" });
      }
    }

    await target.destroy();
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};