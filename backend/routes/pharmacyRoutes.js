const express = require('express');
const router = express.Router();
const { createPharmacy, getPharmacies, deletePharmacy, registerPharmacy, updatePharmacyStatus, getMyPharmacy } = require('../controllers/pharmacyController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.post('/register', registerPharmacy);
router.get('/my-pharmacy', protect, getMyPharmacy);

router.route('/')
    .post(protect, superAdmin, createPharmacy)
    .get(protect, superAdmin, getPharmacies);

router.route('/:id')
    .delete(protect, superAdmin, deletePharmacy);

router.route('/:id/status')
    .put(protect, superAdmin, updatePharmacyStatus);

module.exports = router;
