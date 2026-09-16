import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import User from "./user.models.js";
import { MemberShip } from "./memberShip.models.js";

const BillingAdjustment = sequelize.define(
  "BillingAdjustment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    memberShipId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: MemberShip, key: "id" },
      onDelete: "CASCADE",
    },
    cycle: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Mes/Año del cobro, ej. '2026-10'",
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: "Negativo = descuento (reduce deuda), positivo = penalidad (aumenta deuda)",
    },
    type: {
      type: DataTypes.ENUM("descuento_hermano", "penalidad", "colaboracion", "manual"),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "id" },
    },
  },
  { tableName: "billing_adjustments", timestamps: true }
);

MemberShip.hasMany(BillingAdjustment, { foreignKey: "memberShipId", as: "adjustments" });
BillingAdjustment.belongsTo(MemberShip, { foreignKey: "memberShipId", as: "membership" });

export default BillingAdjustment;