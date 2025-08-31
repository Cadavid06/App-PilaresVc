import mongoose, { Schema } from "mongoose";

const memberShipTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Diaria", "Semanal", "Quincenal", "Mensual"],
    required: true,
    unique: true,
  },
  durationInDays: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

export default mongoose.model("MemberShipType", memberShipTypeSchema);
