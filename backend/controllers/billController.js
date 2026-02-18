const asyncHandler = require('express-async-handler');
const Bill = require('../models/Bill');
const Medicine = require('../models/Medicine');

// @desc    Create a new bill and update stock
// @route   POST /api/bills
// @access  Pharmacy Admin/Staff
const createBill = asyncHandler(async (req, res) => {
    const { customerName, customerMobile, items, subTotal, discountAmount, grandTotal } = req.body;
    const pharmacyId = req.user.pharmacyId;

    // Fetch Pharmacy to get GST Number
    const pharmacy = await mongoose.model('Pharmacy').findById(pharmacyId);
    const gstNumber = pharmacy ? pharmacy.gstNumber : null;

    // Server-side validation/calculation could be added here for security
    // For now, calculating Tax based on provided values or re-calculating
    const calculatedTax = (grandTotal - (subTotal - discountAmount)).toFixed(2); // Approximate check

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
        customerName,
        customerMobile,
        items,
        subTotal,
        discountAmount,
        taxAmount: (subTotal - discountAmount) * 0.05, // Calculate 5% tax on discounted amount
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

module.exports = { createBill, getBills };
