import { DataTypes } from "sequelize";
import sequelize from "../db.js";

// Equivalente al adminSchema de Mongoose
const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "admins",
    timestamps: true, // crea createdAt y updatedAt automáticamente
  }
);

export default Admin;
