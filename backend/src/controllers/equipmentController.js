const Equipment = require("../models/Equipment");

const listEquipment = async (req, res, next) => {
  try {
    const { category, available, search } = req.query;
    const filters = {};

    if (category) {
      filters.category = new RegExp(category, "i");
    }

    if (typeof available !== "undefined") {
      filters.availableQuantity =
        available === "true" ? { $gt: 0 } : { $eq: 0 };
    }

    if (search) {
      filters.name = new RegExp(search, "i");
    }

    const equipment = await Equipment.find(filters).sort("name");
    res.json({ equipment });
  } catch (error) {
    next(error);
  }
};

const getEquipment = async (req, res, next) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    return res.json({ equipment: item });
  } catch (error) {
    return next(error);
  }
};

const createEquipment = async (req, res, next) => {
  try {
    const { name, category, description, condition, quantity, availableQuantity } =
      req.body;

    if (!name || !category || typeof quantity === "undefined") {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const item = await Equipment.create({
      name,
      category,
      description,
      condition,
      quantity,
      availableQuantity: availableQuantity ?? quantity,
    });

    return res.status(201).json({ equipment: item });
  } catch (error) {
    return next(error);
  }
};

const updateEquipment = async (req, res, next) => {
  try {
    const updates = req.body;
    const item = await Equipment.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    const updatedQuantity =
      typeof updates.quantity !== "undefined" ? updates.quantity : item.quantity;
    const requestedAvailable =
      typeof updates.availableQuantity !== "undefined"
        ? updates.availableQuantity
        : item.availableQuantity;

    if (requestedAvailable > updatedQuantity) {
      return res
        .status(400)
        .json({ message: "Available quantity cannot exceed total quantity" });
    }

    Object.assign(item, updates, {
      quantity: updatedQuantity,
      availableQuantity: requestedAvailable,
    });

    await item.save();

    return res.json({ equipment: item });
  } catch (error) {
    return next(error);
  }
};

const deleteEquipment = async (req, res, next) => {
  try {
    const item = await Equipment.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    return res.json({ message: "Equipment deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};

