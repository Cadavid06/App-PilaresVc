import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Setting = sequelize.define(
  "Setting",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    monthlyFee: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 20000,
    },
    inscriptionFee: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 15000,
    },
    reactivationFee: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 20000,
    },
    defaultSiblingDiscount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 5000,
      validate: { min: 0 },
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  { tableName: "settings", timestamps: true }
);

export default Setting;
