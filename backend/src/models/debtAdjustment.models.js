import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import { MemberShip } from "./memberShip.models.js";
import User from "./user.models.js";

const DebtAdjustment = sequelize.define(
  "DebtAdjustment",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    reason: { type: DataTypes.STRING, allowNull: false },
    memberShipId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: MemberShip, key: "id" },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
  },
  { tableName: "debt_adjustments", timestamps: true }
);

MemberShip.hasMany(DebtAdjustment, { foreignKey: "memberShipId", as: "debtAdjustments" });
DebtAdjustment.belongsTo(MemberShip, { foreignKey: "memberShipId" });
DebtAdjustment.belongsTo(User, { foreignKey: "userId", as: "createdBy" });

export default DebtAdjustment;
