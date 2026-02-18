const mongoose = require('mongoose');

const returnSchema = mongoose.Schema({
    pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true
    },
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true
    },
    medicineName: {
        type: String,
        required: true
    },
    batchNumber: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    supplier: {
        type: String
    },
    returnDate: {
        type: Date,
        default: Date.now
    },
    reason: {
        type: String,
        default: 'Expired'
    }
}, {
    timestamps: true
});

const Return = mongoose.model('Return', returnSchema);

module.exports = Return;
