const express = require('express');
const router = express.Router();
const { returnMedicine, getReturns } = require('../controllers/returnController');
const { protect, pharmacyAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, pharmacyAdmin, returnMedicine)
    .get(protect, pharmacyAdmin, getReturns);

module.exports = router;
