const asyncHandler = require('express-async-handler');
const CustomerLedger = require('../models/CustomerLedger');
const Customer = require('../models/Customer');

// @desc    Add a manual transaction for a customer
// @route   POST /api/customers/transaction
// @access  Pharmacy Admin
const addCustomerTransaction = asyncHandler(async (req, res) => {
    const { customerId, type, amount, date, description } = req.body;

    if (!customerId || !type || !amount) {
        res.status(400);
        throw new Error('Please provide customer, type and amount');
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
        res.status(404);
        throw new Error('Customer not found');
    }

    if (customer.pharmacyId.toString() !== req.user.pharmacyId.toString()) {
        res.status(401);
        throw new Error('Unauthorized');
    }

    const transaction = await CustomerLedger.create({
        pharmacyId: req.user.pharmacyId,
        customerId,
        type,
        amount,
        date: date || new Date(),
        description
    });

    res.status(201).json(transaction);
});

// @desc    Get manual transactions for a customer
// @route   GET /api/customers/:id/transactions
// @access  Pharmacy Admin
const getCustomerTransactions = asyncHandler(async (req, res) => {
    const transactions = await CustomerLedger.find({
        customerId: req.params.id,
        pharmacyId: req.user.pharmacyId
    }).sort({ date: -1 });

    res.json(transactions);
});

module.exports = { addCustomerTransaction, getCustomerTransactions };
