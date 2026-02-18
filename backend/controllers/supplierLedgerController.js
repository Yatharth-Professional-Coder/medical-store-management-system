const asyncHandler = require('express-async-handler');
const SupplierLedger = require('../models/SupplierLedger');
const Supplier = require('../models/Supplier');

// @desc    Get ledger history for a supplier
// @route   GET /api/suppliers/:id/ledger
// @access  Pharmacy Admin
const getSupplierLedger = asyncHandler(async (req, res) => {
    const supplierId = req.params.id;

    // Verify Supplier exists and belongs to Pharmacy
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
        res.status(404);
        throw new Error('Supplier not found');
    }

    if (supplier.pharmacyId.toString() !== req.user.pharmacyId.toString()) {
        res.status(401);
        throw new Error('Unauthorized access to supplier');
    }

    const ledger = await SupplierLedger.find({
        supplierId,
        pharmacyId: req.user.pharmacyId
    }).sort({ date: -1 });

    res.json(ledger);
});

// @desc    Add a transaction to supplier ledger
// @route   POST /api/suppliers/transaction
// @access  Pharmacy Admin
const addSupplierTransaction = asyncHandler(async (req, res) => {
    const { supplierId, type, amount, date, description } = req.body;

    if (!supplierId || !type || !amount) {
        res.status(400);
        throw new Error('Please fill all required fields');
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
        res.status(404);
        throw new Error('Supplier not found');
    }

    if (supplier.pharmacyId.toString() !== req.user.pharmacyId.toString()) {
        res.status(401);
        throw new Error('Unauthorized access');
    }

    const transaction = await SupplierLedger.create({
        pharmacyId: req.user.pharmacyId,
        supplierId,
        type,
        amount,
        date: date || new Date(),
        description
    });

    res.status(201).json(transaction);
});

module.exports = { getSupplierLedger, addSupplierTransaction };
