const express = require('express');
const router = express.Router();
const { createBill, getBills, deleteBill } = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createBill)
    .get(protect, getBills);

router.route('/:id').delete(protect, deleteBill);

module.exports = router;
