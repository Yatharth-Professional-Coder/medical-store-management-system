const express = require('express');
const router = express.Router();
const { createPharmacy, getPharmacies, deletePharmacy, registerPharmacy, updatePharmacyStatus } = require('../controllers/pharmacyController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.post('/register', registerPharmacy);

router.route('/')
    .post(protect, superAdmin, createPharmacy)
    .get(protect, superAdmin, getPharmacies);

router.route('/:id')
    .delete(protect, superAdmin, deletePharmacy);

router.route('/:id/status')
    .put(protect, superAdmin, updatePharmacyStatus);

module.exports = router;
