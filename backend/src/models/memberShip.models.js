import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import User from "./user.models.js";

const MemberShip = sequelize.define(
  "MemberShip",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientName:     { type: DataTypes.STRING,  allowNull: false },
    documentType:   { type: DataTypes.ENUM("TI", "CC", "CE"), allowNull: false },
    clientDocument: { type: DataTypes.STRING,  allowNull: false, unique: true },
    clientPhone:    { type: DataTypes.STRING,  allowNull: false },
    clientEmail:    { type: DataTypes.STRING,  allowNull: false, unique: true, validate: { isEmail: true } },
    birthdate:      { type: DataTypes.DATEONLY, allowNull: false },
    gender:         { type: DataTypes.ENUM("Masculino", "Femenino"), allowNull: false, defaultValue: "Masculino" },
    status: {
      type: DataTypes.ENUM("Activa", "Pendiente", "Expirada"),
      defaultValue: "Expirada",
    },
    totalPaid: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalFeeExpected: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    nextBillingDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    familyId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Identificador del grupo familiar (hermanos comparten el mismo value)",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "id" },
    },
  },
  { tableName: "memberships", timestamps: true }
);

const Payment = sequelize.define(
  "Payment",
  {
    id:     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    amount: { type: DataTypes.FLOAT,   allowNull: false },
    date:   { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
    month:  { type: DataTypes.INTEGER },
    year:   { type: DataTypes.INTEGER },
    memberShipId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: MemberShip, key: "id" },
      onDelete: "CASCADE",
    },
  },
  { tableName: "payments", timestamps: false }
);

User.hasMany(MemberShip, { foreignKey: "userId" });
MemberShip.belongsTo(User, { foreignKey: "userId" });
MemberShip.hasMany(Payment, { foreignKey: "memberShipId", as: "payments" });
Payment.belongsTo(MemberShip, { foreignKey: "memberShipId" });

export { MemberShip, Payment };
