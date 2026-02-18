const mongoose = require('mongoose');

const medicineSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    batchNumber: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true
    },
    supplier: {
        type: String
    },
    minStockLevel: {
        type: Number,
        default: 10
    }
}, {
    timestamps: true
});

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
