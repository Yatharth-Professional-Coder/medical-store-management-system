const asyncHandler = require('express-async-handler');
const Bill = require('../models/Bill');
const Medicine = require('../models/Medicine');
const mongoose = require('mongoose');

// @desc    Create a new bill and update stock
// @route   POST /api/bills
// @access  Pharmacy Admin/Staff
const createBill = asyncHandler(async (req, res) => {
    const { customerName, customerMobile, items, subTotal, discountAmount, grandTotal } = req.body;
    const pharmacyId = req.user.pharmacyId;

    // Fetch Pharmacy to get GST Number and Name
    const pharmacy = await mongoose.model('Pharmacy').findById(pharmacyId);
    const gstNumber = pharmacy ? pharmacy.gstNumber : null;
    const pharmacyName = pharmacy ? pharmacy.name : 'Unknown Pharmacy';

    // Server-side validation/calculation could be added here for security
    // For now, calculating Tax based on provided values or re-calculating
    // Inclusive GST Logic: Tax = Total - (Total / 1.05)
    const calculatedTax = (grandTotal - (grandTotal / 1.05)).toFixed(2);

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No items in bill');
    }

    // 1. Validate Stock & Prepare Bulk Updates
    const bulkEnv = [];
    for (const item of items) {
        const medicine = await Medicine.findById(item.medicineId);

        if (!medicine) {
            res.status(404);
            throw new Error(`Medicine not found: ${item.name}`);
        }

        if (medicine.pharmacyId.toString() !== pharmacyId.toString()) {
            res.status(401);
            throw new Error(`Unauthorized access to medicine: ${item.name}`);
        }

        if (medicine.stock < item.quantity) {
            res.status(400);
            throw new Error(`Insufficient stock for ${item.name}. Available: ${medicine.stock}`);
        }

        // Add to bulk update operations
        // We decrement the stock for this specific medicine
        medicine.stock = medicine.stock - item.quantity;
        await medicine.save();
    }

    // 2. Create Bill
    const bill = await Bill.create({
        pharmacyId,
        pharmacyName,
        customerName,
        customerMobile,
        items,
        subTotal,
        discountAmount,
        taxAmount: grandTotal - (grandTotal / 1.05), // Back-calculate 5% tax from inclusive total
        totalAmount: grandTotal,
        gstNumber
    });

    res.status(201).json(bill);
});

// @desc    Get all bills for a pharmacy
// @route   GET /api/bills
// @access  Pharmacy Admin/Staff
const getBills = asyncHandler(async (req, res) => {
    const bills = await Bill.find({ pharmacyId: req.user.pharmacyId }).sort({ createdAt: -1 });
    res.json(bills);
});

const deleteBill = asyncHandler(async (req, res) => {
    const bill = await Bill.findById(req.params.id);

    if (bill) {
        if (bill.pharmacyId.toString() !== req.user.pharmacyId.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this bill');
        }

        // Restore Stock for each item
        for (const item of bill.items) {
            const medicine = await Medicine.findById(item.medicineId);
            if (medicine) {
                medicine.stock = medicine.stock + item.quantity;
                await medicine.save();
            }
        }

        await bill.deleteOne();
        res.json({ message: 'Bill removed and stock restored' });
    } else {
        res.status(404);
        throw new Error('Bill not found');
    }
});

module.exports = { createBill, getBills, deleteBill };
