import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import Admin from "./admin.models.js";

// ─── Tabla principal: membresías ───────────────────────────────────────────
// Equivalente al memberShipSchema de Mongoose, pero ahora los payments
// son una tabla separada (Payment) con FK hacia MemberShip.
const MemberShip = sequelize.define(
  "MemberShip",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    documentType: {
      type: DataTypes.ENUM("TI", "CC", "CE"),
      allowNull: false,
    },
    clientDocument: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    clientPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clientEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    birthdate: {
      type: DataTypes.DATEONLY, // solo fecha, sin hora
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Activa", "Pendiente", "Expirada"),
      defaultValue: "Expirada",
    },
    totalPaid: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    // FK hacia Admin
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Admin,
        key: "id",
      },
    },
  },
  {
    tableName: "memberships",
    timestamps: true,
  }
);

// ─── Tabla de pagos ────────────────────────────────────────────────────────
// En MongoDB esto era un array embebido (payments: []).
// En PostgreSQL se convierte en tabla separada con FK.
const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    month: {
      type: DataTypes.INTEGER, // 1-12
    },
    year: {
      type: DataTypes.INTEGER,
    },
    // FK hacia MemberShip
    memberShipId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MemberShip,
        key: "id",
      },
      onDelete: "CASCADE", // si se borra la membresía, se borran sus pagos
    },
  },
  {
    tableName: "payments",
    timestamps: false,
  }
);

// ─── Relaciones ────────────────────────────────────────────────────────────
Admin.hasMany(MemberShip, { foreignKey: "adminId" });
MemberShip.belongsTo(Admin, { foreignKey: "adminId" });

MemberShip.hasMany(Payment, { foreignKey: "memberShipId", as: "payments" });
Payment.belongsTo(MemberShip, { foreignKey: "memberShipId" });

export { MemberShip, Payment };
