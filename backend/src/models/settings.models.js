import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Setting = sequelize.define(
  "Setting",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  { tableName: "settings", timestamps: true }
);

export default Setting;
