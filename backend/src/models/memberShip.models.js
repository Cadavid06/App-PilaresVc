import mongoose, { Schema } from "mongoose";

const memberShipSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
  },
  clientDocument: {
    type: String,
    required: true,
    unique: true,
  },
  clientPhone: {
    type: String,
    required: true,
    unique: true,
  },
  memberShipType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MemberShipType",
    required: true,
  },
  startDate: {
    type: Date,
    default: () => new Date(), // se guarda la fecha exacta de creación
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Activa", "Expirada"],
  },
  payments: [
    {
      amount: Number,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  totalPaid: {
    type: Number,
    default: 0,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
});

export default mongoose.model("MemberShip", memberShipSchema);
