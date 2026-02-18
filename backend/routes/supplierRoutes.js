const express = require('express');
const router = express.Router();
const { addSupplier, getSuppliers, deleteSupplier } = require('../controllers/supplierController');
const { getSupplierLedger, addSupplierTransaction } = require('../controllers/supplierLedgerController');
const { protect, pharmacyAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, pharmacyAdmin, addSupplier)
    .get(protect, pharmacyAdmin, getSuppliers);

router.route('/:id').delete(protect, pharmacyAdmin, deleteSupplier);

// Ledger Routes
router.get('/:id/ledger', protect, pharmacyAdmin, getSupplierLedger);
router.post('/transaction', protect, pharmacyAdmin, addSupplierTransaction);

module.exports = router;
