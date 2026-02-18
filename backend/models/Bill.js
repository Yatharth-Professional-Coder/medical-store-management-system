const mongoose = require('mongoose');

const billSchema = mongoose.Schema({
    pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerMobile: {
        type: String,
        required: true
    },
    items: [{
        medicineId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medicine',
            required: true
        },
        name: { type: String, required: true },
        batchNumber: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        amount: { type: Number, required: true }
    }],
    totalAmount: { // This will now serve as Grand Total
        type: Number,
        required: true
    },
    subTotal: {
        type: Number,
        required: true
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    gstNumber: { // Snapshot of GST number at the time of bill
        type: String
    }
}, {
    timestamps: true
});

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;
