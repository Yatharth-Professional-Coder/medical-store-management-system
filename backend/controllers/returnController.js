const asyncHandler = require('express-async-handler');
const Return = require('../models/Return');
const Medicine = require('../models/Medicine');

// @desc    Return medicine to seller (remove from stock and log)
// @route   POST /api/returns
// @access  Pharmacy Admin
const returnMedicine = asyncHandler(async (req, res) => {
    const { medicineId, quantity, reason } = req.body;

    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
        res.status(404);
        throw new Error('Medicine not found');
    }

    if (medicine.pharmacyId.toString() !== req.user.pharmacyId.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    if (medicine.quantity < quantity) {
        res.status(400);
        throw new Error('Return quantity exceeds available stock');
    }

    // specific field for quantity
    medicine.quantity = medicine.quantity - quantity;
    await medicine.save();

    const returnRecord = await Return.create({
        pharmacyId: req.user.pharmacyId,
        medicineId: medicine._id,
        medicineName: medicine.name,
        batchNumber: medicine.batchNumber,
        quantity,
        supplier: medicine.supplier,
        reason: reason || 'Expired'
    });

    res.status(201).json(returnRecord);
});

// @desc    Get all returns
// @route   GET /api/returns
// @access  Pharmacy Admin
const getReturns = asyncHandler(async (req, res) => {
    const returns = await Return.find({ pharmacyId: req.user.pharmacyId }).sort({ createdAt: -1 });
    res.json(returns);
});

module.exports = { returnMedicine, getReturns };
