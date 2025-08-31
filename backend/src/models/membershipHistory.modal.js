import mongoose, { Schema } from "mongoose";

const historySchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MemberShip",
    required: true,
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MemberShipType",
    required: true,
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
});

export default mongoose.model("MembershipHistory", historySchema);
