const asyncHandler = require('express-async-handler');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const SupplierLedger = require('../models/SupplierLedger');
const Purchase = require('../models/Purchase');

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
        minStockLevel,
        invoiceNumber
    } = req.body;

    const sellingPrice = (price !== undefined && price !== '' && !isNaN(price)) ? Number(price) : Number(mrp);

    const medicine = await Medicine.create({
        name,
        batchNumber,
        expiryDate,
        mrp: Number(mrp),
        supplierPrice: Number(supplierPrice),
        price: sellingPrice,
        quantity: Number(quantity),
        pharmacyId: req.user.pharmacyId,
        supplier: supplier || undefined,
        minStockLevel: minStockLevel ? Number(minStockLevel) : 10,
        invoiceNumber
    });

    if (medicine) {
        // Add to permanent Purchase records for Invoice viewing
        if (invoiceNumber && supplier) {
            await Purchase.create({
                pharmacyId: req.user.pharmacyId,
                supplier,
                invoiceNumber,
                name,
                batchNumber,
                expiryDate,
                mrp: Number(mrp),
                supplierPrice: Number(supplierPrice),
                quantity: Number(quantity)
            });
        }

        // Add to Supplier Ledger as a Purchase
        if (supplier) {
            await SupplierLedger.create({
                pharmacyId: req.user.pharmacyId,
                supplierId: supplier,
                type: 'Purchase',
                amount: Number(supplierPrice) * Number(quantity),
                description: `Purchase: ${name} (Batch: ${batchNumber}, Invoice: ${invoiceNumber || 'N/A'})`,
                date: new Date()
            });
        }
        res.status(201).json(medicine);
    } else {
        res.status(400);
        throw new Error('Invalid medicine data');
    }
});

// @desc    Add multiple medicines
// @route   POST /api/medicines/bulk
// @access  Pharmacy Admin
const addBulkMedicines = asyncHandler(async (req, res) => {
    const medicinesData = Array.isArray(req.body) 
        ? req.body 
        : (Array.isArray(req.body?.medicines) ? req.body.medicines : null);

    if (!medicinesData || medicinesData.length === 0) {
        res.status(400);
        throw new Error('No medicines data provided');
    }

    const processedMedicines = medicinesData.map(med => ({
        ...med,
        pharmacyId: req.user.pharmacyId,
        price: (med.price !== undefined && med.price !== '' && !isNaN(med.price)) ? Number(med.price) : Number(med.mrp)
    }));

    try {
        const medicines = await Medicine.insertMany(processedMedicines);

        // Add to Purchase records and Supplier Ledger
        for (const med of medicines) {
            if (med.invoiceNumber && med.supplier) {
                await Purchase.create({
                    pharmacyId: req.user.pharmacyId,
                    supplier: med.supplier,
                    invoiceNumber: med.invoiceNumber,
                    name: med.name,
                    batchNumber: med.batchNumber,
                    expiryDate: med.expiryDate,
                    mrp: med.mrp,
                    supplierPrice: med.supplierPrice,
                    quantity: med.quantity
                });
            }

            if (med.supplier) {
                await SupplierLedger.create({
                    pharmacyId: req.user.pharmacyId,
                    supplierId: med.supplier,
                    type: 'Purchase',
                    amount: med.supplierPrice * med.quantity,
                    description: `Bulk Purchase: ${med.name} (Batch: ${med.batchNumber}, Invoice: ${med.invoiceNumber || 'N/A'})`,
                    date: new Date()
                });
            }
        }

        res.status(201).json(medicines);
    } catch (error) {
        res.status(400);
        throw new Error('Error adding bulk medicines: ' + error.message);
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
        if (req.body.mrp !== undefined && req.body.mrp !== '') medicine.mrp = Number(req.body.mrp);
        if (req.body.supplierPrice !== undefined && req.body.supplierPrice !== '') medicine.supplierPrice = Number(req.body.supplierPrice);
        if (req.body.price !== undefined && req.body.price !== '') {
            medicine.price = Number(req.body.price);
        } else if (req.body.mrp !== undefined && req.body.mrp !== '') {
            medicine.price = Number(req.body.mrp);
        }
        if (req.body.quantity !== undefined && req.body.quantity !== '') medicine.quantity = Number(req.body.quantity);
        medicine.supplier = req.body.supplier || medicine.supplier;
        if (req.body.minStockLevel !== undefined && req.body.minStockLevel !== '') medicine.minStockLevel = Number(req.body.minStockLevel);
        medicine.invoiceNumber = req.body.invoiceNumber || medicine.invoiceNumber;

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

// @desc    Get Invoices by Supplier
// @route   GET /api/medicines/supplier/:supplierId/invoices
// @access  Pharmacy Admin
const getInvoicesBySupplier = asyncHandler(async (req, res) => {
    const { supplierId } = req.params;
    // Find unique invoice numbers from permanent Purchase records
    const invoices = await Purchase.find({
        pharmacyId: req.user.pharmacyId,
        supplier: supplierId
    }).distinct('invoiceNumber');

    res.json(invoices);
});

// @desc    Get Items by Invoice
// @route   GET /api/medicines/supplier/:supplierId/invoice/:invoiceNumber
// @access  Pharmacy Admin
const getItemsByInvoice = asyncHandler(async (req, res) => {
    const { supplierId, invoiceNumber } = req.params;
    const items = await Purchase.find({
        pharmacyId: req.user.pharmacyId,
        supplier: supplierId,
        invoiceNumber
    }).sort({ createdAt: -1 });
    res.json(items);
});

module.exports = { addMedicine, addBulkMedicines, getMedicines, updateMedicine, deleteMedicine, getInvoicesBySupplier, getItemsByInvoice };

