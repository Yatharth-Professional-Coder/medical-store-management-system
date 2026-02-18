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
    mrp: { // Maximum Retail Price (Printed)
        type: Number,
        required: true
    },
    supplierPrice: { // Cost Price
        type: Number,
        required: true
    },
    price: { // Selling Price (can be less than or equal to MRP)
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: false // Optional for older records or quick adds
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
