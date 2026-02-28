const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (req.user && req.user.role !== 'SuperAdmin' && req.user.pharmacyId) {
                const userPharmacy = await Pharmacy.findById(req.user.pharmacyId);
                if (userPharmacy && userPharmacy.status === 'Paused') {
                    return res.status(403).json({ message: 'Store services are temporarily paused. Please contact administrator.' });
                }
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const superAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'SuperAdmin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as Super Admin' });
    }
};

const pharmacyAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'PharmacyAdmin' || req.user.role === 'SuperAdmin')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as Pharmacy Admin' });
    }
};

module.exports = { protect, superAdmin, pharmacyAdmin };
