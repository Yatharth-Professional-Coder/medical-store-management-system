const mongoose = require('mongoose');

const purchaseSchema = mongoose.Schema({
    pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true
    },
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
    mrp: {
        type: Number,
        required: true
    },
    supplierPrice: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    addedDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
