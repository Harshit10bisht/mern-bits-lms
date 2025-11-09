const LoanRequest = require("../models/LoanRequest");
const Equipment = require("../models/Equipment");

const LOAN_POPULATE = [
  { path: "equipment", select: "name category condition quantity availableQuantity" },
  { path: "borrower", select: "fullName email role" },
  { path: "approvedBy", select: "fullName email role" },
];

const formatUser = (user) => {
  if (!user) return undefined;
  const id = user._id ? user._id.toString() : user.id;
  return {
    id,
    _id: id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
};

const formatEquipment = (equipment) => {
  if (!equipment) return undefined;
  const id = equipment._id ? equipment._id.toString() : equipment.id;
  return {
    id,
    _id: id,
    name: equipment.name,
    category: equipment.category,
    condition: equipment.condition,
    quantity: equipment.quantity,
    availableQuantity: equipment.availableQuantity,
  };
};

const formatLoan = (loan) => ({
  id: loan._id ? loan._id.toString() : loan.id,
  equipment: formatEquipment(loan.equipment),
  borrower: formatUser(loan.borrower),
  quantity: loan.quantity,
  status: loan.status,
  requestReason: loan.requestReason,
  requestedForDate: loan.requestedForDate,
  dueDate: loan.dueDate,
  approvedBy: formatUser(loan.approvedBy),
  issuedAt: loan.issuedAt,
  returnedAt: loan.returnedAt,
  createdAt: loan.createdAt,
  updatedAt: loan.updatedAt,
});

const listLoans = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filters = {};

    if (status) {
      filters.status = status;
    }

    if (req.user.role === "student") {
      filters.borrower = req.user._id;
    }

    const loans = await LoanRequest.find(filters)
      .populate(LOAN_POPULATE)
      .sort({ createdAt: -1 });

    res.json({ loans: loans.map(formatLoan) });
  } catch (error) {
    next(error);
  }
};

const createLoan = async (req, res, next) => {
  try {
    const {
      equipmentId,
      quantity,
      requestReason,
      requestedForDate,
      dueDate,
    } = req.body;

    if (!equipmentId || !quantity) {
      return res.status(400).json({ message: "Equipment and quantity required" });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    if (quantity > equipment.availableQuantity) {
      return res
        .status(400)
        .json({ message: "Requested quantity exceeds availability" });
    }

    let requestedStart = requestedForDate ? new Date(requestedForDate) : null;
    let requestedEnd = dueDate ? new Date(dueDate) : null;

    if (requestedStart && requestedEnd && requestedStart > requestedEnd) {
      return res
        .status(400)
        .json({ message: "Requested end date must be after start date" });
    }

    if (!requestedEnd && requestedStart) {
      requestedEnd = requestedStart;
    }

    if (!requestedStart && requestedEnd) {
      requestedStart = requestedEnd;
    }

    if (requestedStart && requestedEnd) {
      const overlapExists = await LoanRequest.exists({
        equipment: equipmentId,
        status: { $in: ["pending", "approved", "issued"] },
        requestedForDate: { $ne: null, $lte: requestedEnd },
        dueDate: { $ne: null, $gte: requestedStart },
      });

      if (overlapExists) {
        return res.status(400).json({
          message:
            "Another booking overlaps with the selected dates. Please choose a different slot.",
        });
      }
    }

    const loan = await LoanRequest.create({
      equipment: equipmentId,
      borrower: req.user._id,
      quantity,
      requestReason,
      requestedForDate: requestedStart,
      dueDate: requestedEnd,
      status: "pending",
    });

    await loan.populate(LOAN_POPULATE);

    res.status(201).json({ loan: formatLoan(loan) });
  } catch (error) {
    next(error);
  }
};

const approveLoan = async (req, res, next) => {
  try {
    const loan = await LoanRequest.findById(req.params.id).populate("equipment");

    if (!loan) {
      return res.status(404).json({ message: "Loan request not found" });
    }

    if (loan.status !== "pending") {
      return res.status(400).json({ message: "Loan already processed" });
    }

    if (loan.quantity > loan.equipment.availableQuantity) {
      return res
        .status(400)
        .json({ message: "Insufficient equipment available to approve" });
    }

    loan.status = "approved";
    loan.approvedBy = req.user._id;

    loan.equipment.availableQuantity -= loan.quantity;
    await loan.equipment.save();
    await loan.save();

    await loan.populate(LOAN_POPULATE);

    res.json({ loan: formatLoan(loan) });
  } catch (error) {
    next(error);
  }
};

const rejectLoan = async (req, res, next) => {
  try {
    const loan = await LoanRequest.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: "Loan request not found" });
    }

    if (loan.status !== "pending") {
      return res.status(400).json({ message: "Loan already processed" });
    }

    loan.status = "rejected";
    loan.approvedBy = req.user._id;
    await loan.save();

    await loan.populate(LOAN_POPULATE);

    res.json({ loan: formatLoan(loan) });
  } catch (error) {
    next(error);
  }
};

const issueLoan = async (req, res, next) => {
  try {
    const loan = await LoanRequest.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: "Loan request not found" });
    }

    if (loan.status === "issued") {
      return res.json({ loan });
    }

    if (loan.status !== "approved") {
      return res.status(400).json({ message: "Loan must be approved first" });
    }

    loan.status = "issued";
    loan.issuedAt = new Date();
    await loan.save();

    await loan.populate(LOAN_POPULATE);

    res.json({ loan: formatLoan(loan) });
  } catch (error) {
    next(error);
  }
};

const returnLoan = async (req, res, next) => {
  try {
    const loan = await LoanRequest.findById(req.params.id).populate("equipment");
    if (!loan) {
      return res.status(404).json({ message: "Loan request not found" });
    }

    if (loan.status === "returned") {
      return res.json({ loan });
    }

    if (!["issued", "approved"].includes(loan.status)) {
      return res.status(400).json({ message: "Loan is not currently borrowed" });
    }

    loan.status = "returned";
    loan.returnedAt = new Date();

    loan.equipment.availableQuantity += loan.quantity;
    await loan.equipment.save();
    await loan.save();

    await loan.populate(LOAN_POPULATE);

    res.json({ loan: formatLoan(loan) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listLoans,
  createLoan,
  approveLoan,
  rejectLoan,
  issueLoan,
  returnLoan,
};

