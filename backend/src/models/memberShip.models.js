import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import Admin from "./admin.models.js";

// ─── Tabla principal: membresías ───────────────────────────────────────────
const MemberShip = sequelize.define(
  "MemberShip",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clientName:     { type: DataTypes.STRING,  allowNull: false },
    documentType:   { type: DataTypes.ENUM("TI", "CC", "CE"), allowNull: false },
    clientDocument: { type: DataTypes.STRING,  allowNull: false, unique: true },
    clientPhone:    { type: DataTypes.STRING,  allowNull: false },
    clientEmail:    { type: DataTypes.STRING,  allowNull: false, unique: true, validate: { isEmail: true } },
    birthdate:      { type: DataTypes.DATEONLY, allowNull: false },

    status: {
      type: DataTypes.ENUM("Activa", "Pendiente", "Expirada"),
      defaultValue: "Expirada",
    },

    // Suma acumulada de todos los pagos hechos por el jugador
    totalPaid: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    // Suma acumulada de todo lo que el sistema le ha cobrado al jugador.
    // El cron lo incrementa cada mes. La deuda = totalFeeExpected - totalPaid.
    totalFeeExpected: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    // Fecha en que el cron hará el próximo cobro a este jugador (día 1 de algún mes).
    // Jugador nuevo <=15: mes+1. Jugador nuevo >15: mes+2. Jugador antiguo: mes+1.
    nextBillingDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Admin, key: "id" },
    },
  },
  {
    tableName: "memberships",
    timestamps: true,
  }
);

// ─── Tabla de pagos ────────────────────────────────────────────────────────
const Payment = sequelize.define(
  "Payment",
  {
    id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    amount: { type: DataTypes.FLOAT,   allowNull: false },
    date:   { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
    month:  { type: DataTypes.INTEGER },   // 1-12
    year:   { type: DataTypes.INTEGER },
    memberShipId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: MemberShip, key: "id" },
      onDelete: "CASCADE",
    },
  },
  { tableName: "payments", timestamps: false }
);

// ─── Relaciones ────────────────────────────────────────────────────────────
Admin.hasMany(MemberShip, { foreignKey: "adminId" });
MemberShip.belongsTo(Admin, { foreignKey: "adminId" });

MemberShip.hasMany(Payment, { foreignKey: "memberShipId", as: "payments" });
Payment.belongsTo(MemberShip, { foreignKey: "memberShipId" });

export { MemberShip, Payment };
