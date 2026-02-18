const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // Check if pharmacy is approved
        if (user.role === 'PharmacyAdmin' || user.role === 'PharmacyStaff') {
            const pharmacy = await Pharmacy.findById(user.pharmacyId);
            if (pharmacy && pharmacy.status !== 'Approved') {
                res.status(401);
                throw new Error(`Your account is ${pharmacy.status}. Please contact Super Admin.`);
            }
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            pharmacyId: user.pharmacyId,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user (admin only or initial setup)
// @route   POST /api/users
// @access  Public (for initial setup) / SuperAdmin
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role // Should be validated or restricted in production
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

module.exports = { authUser, registerUser };
