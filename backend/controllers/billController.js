const asyncHandler = require('express-async-handler');
const Bill = require('../models/Bill');
const Medicine = require('../models/Medicine');
const mongoose = require('mongoose');

// @desc    Create a new bill and update stock
// @route   POST /api/bills
// @access  Pharmacy Admin/Staff
const createBill = asyncHandler(async (req, res) => {
    const { customerName, customerMobile, items, subTotal, discountAmount, grandTotal, paidAmount = grandTotal } = req.body;
    const pharmacyId = req.user.pharmacyId;

    // Payment Status Logic
    let paymentStatus = 'Paid';
    let balanceAmount = 0;
    const paid = Number(paidAmount);
    const total = Number(grandTotal);

    if (paid < total) {
        balanceAmount = total - paid;
        paymentStatus = paid === 0 ? 'Unpaid' : 'Partial';
    }

    // Fetch Pharmacy to get GST Number and Name
    const pharmacy = await mongoose.model('Pharmacy').findById(pharmacyId);
    const gstNumber = pharmacy ? pharmacy.gstNumber : null;
    const pharmacyName = pharmacy ? pharmacy.name : 'Unknown Pharmacy';

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No items in bill');
    }

    // 1. Validate Stock & Prepare Bulk Updates
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

        if (medicine.quantity < item.quantity) {
            res.status(400);
            throw new Error(`Insufficient stock for ${item.name}. Available: ${medicine.quantity}`);
        }

        // Check for Expiry
        const today = new Date();
        const expiryDate = new Date(medicine.expiryDate);
        if (expiryDate < today) {
            res.status(400);
            throw new Error(`Cannot bill expired medicine: ${item.name} (Expired on ${expiryDate.toLocaleDateString()})`);
        }

        // Decrement Quantity
        medicine.quantity = medicine.quantity - item.quantity;
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
        taxAmount: total - (total / 1.05), // Calculated from inclusive
        totalAmount: total,
        gstNumber,
        paymentStatus,
        paidAmount: paid,
        balanceAmount
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

// @desc    Get bills by customer mobile
// @route   GET /api/bills/customer/:mobile
const getCustomerBills = asyncHandler(async (req, res) => {
    const bills = await Bill.find({
        pharmacyId: req.user.pharmacyId,
        customerMobile: req.params.mobile
    }).sort({ createdAt: -1 });
    res.json(bills);
});

// @desc    Settle a bill amount
// @route   POST /api/bills/:id/settle
const settleBill = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
        res.status(404);
        throw new Error('Bill not found');
    }

    if (bill.pharmacyId.toString() !== req.user.pharmacyId.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const payAmount = Number(amount);
    if (payAmount <= 0) {
        res.status(400);
        throw new Error('Invalid amount');
    }

    if (bill.balanceAmount <= 0) {
        res.status(400);
        throw new Error('Bill is already paid');
    }

    bill.paidAmount += payAmount;
    bill.balanceAmount -= payAmount;

    if (bill.balanceAmount <= 0) {
        bill.balanceAmount = 0;
        bill.paymentStatus = 'Paid';
    } else {
        bill.paymentStatus = 'Partial';
    }

    await bill.save();
    res.json(bill);
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
                medicine.quantity = medicine.quantity + item.quantity;
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

module.exports = { createBill, getBills, getCustomerBills, settleBill, deleteBill };
