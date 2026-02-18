const express = require('express');
const router = express.Router();
const { createBill, getBills } = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createBill)
    .get(protect, getBills);

module.exports = router;
