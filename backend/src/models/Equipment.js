const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Equipment name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    description: {
      type: String,
    },
    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      default: "good",
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity must be positive"],
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: [0, "Available quantity must be positive"],
    },
  },
  { timestamps: true }
);

equipmentSchema.pre("save", function syncAvailable(next) {
  if (this.isModified("quantity") && !this.isModified("availableQuantity")) {
    this.availableQuantity = this.quantity;
  }
  next();
});

module.exports = mongoose.model("Equipment", equipmentSchema);

