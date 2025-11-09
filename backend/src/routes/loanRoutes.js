const express = require("express");
const {
  listLoans,
  createLoan,
  approveLoan,
  rejectLoan,
  issueLoan,
  returnLoan,
} = require("../controllers/loanController");
const { authMiddleware, requireRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, listLoans);
router.post("/", authMiddleware, requireRoles("student", "staff", "admin"), createLoan);

router.patch(
  "/:id/approve",
  authMiddleware,
  requireRoles("staff", "admin"),
  approveLoan
);

router.patch(
  "/:id/reject",
  authMiddleware,
  requireRoles("staff", "admin"),
  rejectLoan
);

router.patch(
  "/:id/issue",
  authMiddleware,
  requireRoles("staff", "admin"),
  issueLoan
);

router.patch(
  "/:id/return",
  authMiddleware,
  requireRoles("staff", "admin"),
  returnLoan
);

module.exports = router;

