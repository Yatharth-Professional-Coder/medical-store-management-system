const asyncHandler = require('express-async-handler');
const Customer = require('../models/Customer');
const Bill = require('../models/Bill');
const CustomerLedger = require('../models/CustomerLedger');

// @desc    Add a new customer
// @route   POST /api/customers
// @access  Pharmacy Admin
const addCustomer = asyncHandler(async (req, res) => {
    const { name, mobile, force } = req.body;

    if (!name || !mobile) {
        res.status(400);
        throw new Error('Please provide name and mobile number');
    }

    // Check if customer with same name exists for this pharmacy
    const existing = await Customer.findOne({
        pharmacyId: req.user.pharmacyId,
        name: name.toUpperCase()
    });

    if (existing && !force) {
        return res.status(200).json({
            exists: true,
            message: 'A customer with this name already exists. Are you sure you want to add another?'
        });
    }

    const customer = await Customer.create({
        pharmacyId: req.user.pharmacyId,
        name: name.toUpperCase(),
        mobile
    });

    res.status(201).json(customer);
});

// @desc    Get all customers for a pharmacy
// @route   GET /api/customers
// @access  Pharmacy Admin
const getCustomers = asyncHandler(async (req, res) => {
    const customers = await Customer.find({ pharmacyId: req.user.pharmacyId });

    // For each customer, calculate total due ONLY from Manual Transactions (Manual Ledger)
    const customersWithDue = await Promise.all(customers.map(async (c) => {
        // Manual Transactions Only
        const transactions = await CustomerLedger.find({
            customerId: c._id,
            pharmacyId: req.user.pharmacyId
        });

        const manualDue = transactions.reduce((acc, t) => {
            if (t.type === 'Credit') return acc + t.amount;
            if (t.type === 'Payment') return acc - t.amount;
            return acc;
        }, 0);

        return {
            ...c._doc,
            totalDue: manualDue
        };
    }));

    res.json(customersWithDue);
});

module.exports = { addCustomer, getCustomers };
