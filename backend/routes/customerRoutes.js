const express = require('express');
const router = express.Router();
const { addCustomer, getCustomers } = require('../controllers/customerController');
const { protect, pharmacyAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, pharmacyAdmin, addCustomer)
    .get(protect, pharmacyAdmin, getCustomers);

module.exports = router;
