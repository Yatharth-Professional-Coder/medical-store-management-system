const express = require('express');
const router = express.Router();
const { addSupplier, getSuppliers, deleteSupplier } = require('../controllers/supplierController');
const { protect, pharmacyAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, pharmacyAdmin, addSupplier)
    .get(protect, pharmacyAdmin, getSuppliers);

router.route('/:id').delete(protect, pharmacyAdmin, deleteSupplier);

module.exports = router;
