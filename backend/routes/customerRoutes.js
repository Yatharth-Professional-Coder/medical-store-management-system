const express = require('express');
const router = express.Router();
const { addCustomer, getCustomers } = require('../controllers/customerController');
const { addCustomerTransaction, getCustomerTransactions } = require('../controllers/customerLedgerController');
const { protect, pharmacyAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, pharmacyAdmin, addCustomer)
    .get(protect, pharmacyAdmin, getCustomers);

router.route('/transaction')
    .post(protect, pharmacyAdmin, addCustomerTransaction);

router.route('/:id/transactions')
    .get(protect, pharmacyAdmin, getCustomerTransactions);

module.exports = router;
