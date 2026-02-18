const express = require('express');
const router = express.Router();
const { addMedicine, addBulkMedicines, getMedicines, updateMedicine, deleteMedicine, getInvoicesBySupplier, getItemsByInvoice } = require('../controllers/medicineController');
const { protect, pharmacyAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, pharmacyAdmin, addMedicine)
    .get(protect, getMedicines); // Allow staff to view medicines too? Yes.

router.route('/bulk')
    .post(protect, pharmacyAdmin, addBulkMedicines);

router.route('/:id')
    .put(protect, pharmacyAdmin, updateMedicine)
    .delete(protect, pharmacyAdmin, deleteMedicine);

router.route('/supplier/:supplierId/invoices')
    .get(protect, pharmacyAdmin, getInvoicesBySupplier);

router.route('/supplier/:supplierId/invoice/:invoiceNumber')
    .get(protect, pharmacyAdmin, getItemsByInvoice);

module.exports = router;
