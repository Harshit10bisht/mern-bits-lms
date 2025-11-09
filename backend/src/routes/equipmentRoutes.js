const express = require("express");
const {
  listEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} = require("../controllers/equipmentController");
const { authMiddleware, requireRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, listEquipment);
router.get("/:id", authMiddleware, getEquipment);

router.post("/", authMiddleware, requireRoles("admin"), createEquipment);
router.put("/:id", authMiddleware, requireRoles("admin"), updateEquipment);
router.delete("/:id", authMiddleware, requireRoles("admin"), deleteEquipment);

module.exports = router;

