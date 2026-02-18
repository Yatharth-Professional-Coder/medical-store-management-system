const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Pharmacy = require('../models/Pharmacy');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Create a new pharmacy and its admin
// @route   POST /api/pharmacies
// @access  Super Admin
const createPharmacy = asyncHandler(async (req, res) => {
    const {
        adminName,
        adminEmail,
        adminPassword,
        pharmacyName,
        address,
        licenseNumber,
        contactNumber
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email: adminEmail });
    if (userExists) {
        res.status(400);
        throw new Error('User (Admin) already exists');
    }

    // Check if pharmacy license exists
    const pharmacyExists = await Pharmacy.findOne({ licenseNumber });
    if (pharmacyExists) {
        res.status(400);
        throw new Error('Pharmacy with this license already exists');
    }

    // Generate IDs upfront to handle circular dependency
    const userId = new mongoose.Types.ObjectId();
    const pharmacyId = new mongoose.Types.ObjectId();

    // Create User (Pharmacy Admin) with pharmacyId
    const user = await User.create({
        _id: userId,
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'PharmacyAdmin',
        pharmacyId: pharmacyId
    });

    if (user) {
        // Create Pharmacy with owner (userId)
        const pharmacy = await Pharmacy.create({
            _id: pharmacyId,
            name: pharmacyName,
            address,
            licenseNumber,
            contactNumber,
            owner: userId,
            status: req.body.status || 'Pending'
        });

        if (pharmacy) {
            res.status(201).json({
                message: 'Pharmacy and Admin created successfully',
                pharmacy,
                admin: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            // Rollback User creation if Pharmacy fails
            await User.findByIdAndDelete(userId);
            res.status(400);
            throw new Error('Invalid pharmacy data');
        }
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Register a new pharmacy (Public)
// @route   POST /api/pharmacies/register
// @access  Public
const registerPharmacy = asyncHandler(async (req, res) => {
    const {
        adminName,
        adminEmail,
        adminPassword,
        pharmacyName,
        address,
        licenseNumber,
        contactNumber
    } = req.body;

    const userExists = await User.findOne({ email: adminEmail });
    if (userExists) {
        res.status(400);
        throw new Error('User (Admin) already exists');
    }

    const pharmacyExists = await Pharmacy.findOne({ licenseNumber });
    if (pharmacyExists) {
        res.status(400);
        throw new Error('Pharmacy with this license already exists');
    }

    // Generate IDs upfront
    const userId = new mongoose.Types.ObjectId();
    const pharmacyId = new mongoose.Types.ObjectId();

    const user = await User.create({
        _id: userId,
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'PharmacyAdmin',
        pharmacyId: pharmacyId
    });

    if (user) {
        const pharmacy = await Pharmacy.create({
            _id: pharmacyId,
            name: pharmacyName,
            address,
            licenseNumber,
            contactNumber,
            owner: userId,
            status: 'Pending' // Explicitly set to Pending
        });

        if (pharmacy) {
            res.status(201).json({
                message: 'Registration successful. Please wait for Super Admin approval.',
                pharmacy
            });
        } else {
            await User.findByIdAndDelete(userId);
            res.status(400);
            throw new Error('Invalid pharmacy data');
        }
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Update pharmacy status
// @route   PUT /api/pharmacies/:id/status
// @access  Super Admin
const updatePharmacyStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (pharmacy) {
        pharmacy.status = status;
        const updatedPharmacy = await pharmacy.save();
        res.json(updatedPharmacy);
    } else {
        res.status(404);
        throw new Error('Pharmacy not found');
    }
});

// @desc    Get all pharmacies
// @route   GET /api/pharmacies
// @access  Super Admin
const getPharmacies = asyncHandler(async (req, res) => {
    const pharmacies = await Pharmacy.find({}).populate('owner', 'name email');
    res.json(pharmacies);
});

// @desc    Delete pharmacy
// @route   DELETE /api/pharmacies/:id
// @access  Super Admin
const deletePharmacy = asyncHandler(async (req, res) => {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (pharmacy) {
        // Also delete the associated admin user? Or just remove pharmacyId?
        // For now, let's keep the user but maybe disable them or delete them.
        // Let's delete the owner user for cleanup.
        await User.findByIdAndDelete(pharmacy.owner);
        await pharmacy.deleteOne();
        res.json({ message: 'Pharmacy and Admin removed' });
    } else {
        res.status(404);
        throw new Error('Pharmacy not found');
    }
});

module.exports = { createPharmacy, getPharmacies, deletePharmacy, registerPharmacy, updatePharmacyStatus };
