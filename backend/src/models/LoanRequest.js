const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "issued", "returned"],
      default: "pending",
    },
    requestReason: {
      type: String,
      trim: true,
    },
    requestedForDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    issuedAt: {
      type: Date,
    },
    returnedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoanRequest", loanSchema);

