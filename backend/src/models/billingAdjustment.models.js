import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import { MemberShip } from "./memberShip.models.js";
import User from "./user.models.js";

const BillingAdjustment = sequelize.define(
  "BillingAdjustment",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    cycle: { type: DataTypes.STRING(7), allowNull: false },
    type: {
      type: DataTypes.ENUM("sibling_discount", "condonation", "penalty", "manual_adjustment"),
      allowNull: false,
    },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    reason: { type: DataTypes.STRING, allowNull: false },
    memberShipId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: MemberShip, key: "id" },
      onDelete: "CASCADE",
    },
    familyId: { type: DataTypes.STRING, allowNull: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
  },
  { tableName: "billing_adjustments", timestamps: true }
);

MemberShip.hasMany(BillingAdjustment, { foreignKey: "memberShipId", as: "billingAdjustments" });
BillingAdjustment.belongsTo(MemberShip, { foreignKey: "memberShipId" });
BillingAdjustment.belongsTo(User, { foreignKey: "userId", as: "createdBy" });

export default BillingAdjustment;
