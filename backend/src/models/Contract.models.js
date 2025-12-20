import mongoose from "mongoose";

const contractSchema = new mongoose.Schema({
  gigId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Gig",
    required: true 
  },
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Client",
    required: true 
  },
  freelancerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Freelancer",
    required: true 
  },
  
  amount: { type: Number, required: true },

  status: {
    type: String,
    enum: ["PENDING_PAYMENT", "ACTIVE", "COMPLETED"],
    default: "PENDING_PAYMENT"
  },

  paymentStatus: {
    type: String,
    enum: ["UNPAID", "HELD", "RELEASED"],
    default: "UNPAID"
  },

  dodoSessionId: { type: String },
}, { timestamps: true });

export const Contract = mongoose.model("Contract", contractSchema);
