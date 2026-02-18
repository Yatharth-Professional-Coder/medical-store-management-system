const express = require('express');
const router = express.Router();
const { authUser, registerUser } = require('../controllers/userController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.post('/login', authUser);
// Initial setup route, might want to protect this later or remove
router.post('/', registerUser);

module.exports = router;
