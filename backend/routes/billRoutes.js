const express = require('express');
const router = express.Router();
const { createBill, getBills, getCustomerBills, settleBill, deleteBill } = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createBill)
    .get(protect, getBills);

router.get('/customer/:mobile', protect, getCustomerBills);
router.post('/:id/settle', protect, settleBill);

router.route('/:id').delete(protect, deleteBill);

module.exports = router;
