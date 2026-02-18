const express = require('express');
const router = express.Router();
const { createPharmacy, getPharmacies, deletePharmacy } = require('../controllers/pharmacyController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, superAdmin, createPharmacy)
    .get(protect, superAdmin, getPharmacies);

router.route('/:id')
    .delete(protect, superAdmin, deletePharmacy);

module.exports = router;
