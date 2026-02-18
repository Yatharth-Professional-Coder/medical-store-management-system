const asyncHandler = require('express-async-handler');
const Medicine = require('../models/Medicine');
const User = require('../models/User');

// @desc    Add a new medicine
// @route   POST /api/medicines
// @access  Pharmacy Admin
const addMedicine = asyncHandler(async (req, res) => {
    const {
        name,
        batchNumber,
        expiryDate,
        mrp,
        supplierPrice,
        price, // Selling Price
        quantity,
        supplier, // Now expects Supplier ID
        minStockLevel
    } = req.body;

    const medicine = await Medicine.create({
        name,
        batchNumber,
        expiryDate,
        mrp,
        supplierPrice,
        price,
        quantity,
        pharmacyId: req.user.pharmacyId,
        supplier,
        minStockLevel
    });

    if (medicine) {
        res.status(201).json(medicine);
    } else {
        res.status(400);
        throw new Error('Invalid medicine data');
    }
});

// @desc    Get all medicines for a pharmacy
// @route   GET /api/medicines
// @access  Pharmacy Admin / Staff
const getMedicines = asyncHandler(async (req, res) => {
    const medicines = await Medicine.find({ pharmacyId: req.user.pharmacyId });
    res.json(medicines);
});

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Pharmacy Admin
const updateMedicine = asyncHandler(async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);

    if (medicine) {
        if (medicine.pharmacyId.toString() !== req.user.pharmacyId.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this medicine');
        }

        medicine.name = req.body.name || medicine.name;
        medicine.batchNumber = req.body.batchNumber || medicine.batchNumber;
        medicine.expiryDate = req.body.expiryDate || medicine.expiryDate;
        medicine.mrp = req.body.mrp || medicine.mrp;
        medicine.supplierPrice = req.body.supplierPrice || medicine.supplierPrice;
        medicine.price = req.body.price || medicine.price;
        medicine.quantity = req.body.quantity || medicine.quantity;
        medicine.supplier = req.body.supplier || medicine.supplier;
        medicine.minStockLevel = req.body.minStockLevel || medicine.minStockLevel;

        const updatedMedicine = await medicine.save();
        res.json(updatedMedicine);
    } else {
        res.status(404);
        throw new Error('Medicine not found');
    }
});

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Pharmacy Admin
const deleteMedicine = asyncHandler(async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);

    if (medicine) {
        if (medicine.pharmacyId.toString() !== req.user.pharmacyId.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this medicine');
        }

        await medicine.deleteOne();
        res.json({ message: 'Medicine removed' });
    } else {
        res.status(404);
        throw new Error('Medicine not found');
    }
});

module.exports = { addMedicine, getMedicines, updateMedicine, deleteMedicine };
