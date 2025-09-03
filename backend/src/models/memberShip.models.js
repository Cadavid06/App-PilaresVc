import mongoose from "mongoose";

const memberShipSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  documentType: { type: String, enum: ["TI", "CC", "CE"], required: true },
  clientDocument: { type: String, required: true, unique: true },
  clientPhone: { type: String, required: true },
  clientEmail: { type: String, required: true, unique: true, trim: true },
  birthdate: { type: Date, required: true },

  status: {
    type: String,
    enum: ["Activa", "Pendiente", "Expirada"],
    default: "Expirada",
  },

  payments: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      month: { type: Number }, // 0-11 (enero-diciembre)
      year: { type: Number }, // para diferenciar años
    },
  ],

  totalPaid: { type: Number, default: 0 },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
},
  {
    timestamps: true,
  });

export default mongoose.model("MemberShip", memberShipSchema);
