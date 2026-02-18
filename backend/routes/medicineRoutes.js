const express = require('express');
const router = express.Router();
const { addMedicine, getMedicines, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const { protect, pharmacyAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, pharmacyAdmin, addMedicine)
    .get(protect, getMedicines); // Allow staff to view medicines too? Yes.

router.route('/:id')
    .put(protect, pharmacyAdmin, updateMedicine)
    .delete(protect, pharmacyAdmin, deleteMedicine);

module.exports = router;
