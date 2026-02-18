const asyncHandler = require('express-async-handler');
const Supplier = require('../models/Supplier');

// @desc    Add a new supplier
// @route   POST /api/suppliers
// @access  Pharmacy Admin
const addSupplier = asyncHandler(async (req, res) => {
    const { name, contactNumber, companiesSupplied } = req.body;

    const supplier = await Supplier.create({
        name,
        contactNumber,
        companiesSupplied: companiesSupplied || [],
        pharmacyId: req.user.pharmacyId
    });

    res.status(201).json(supplier);
});

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Pharmacy Admin
const getSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await Supplier.find({ pharmacyId: req.user.pharmacyId }).sort({ createdAt: -1 });
    res.json(suppliers);
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Pharmacy Admin
const deleteSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
        if (supplier.pharmacyId.toString() !== req.user.pharmacyId.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }
        await supplier.deleteOne();
        res.json({ message: 'Supplier removed' });
    } else {
        res.status(404);
        throw new Error('Supplier not found');
    }
});

module.exports = { addSupplier, getSuppliers, deleteSupplier };
