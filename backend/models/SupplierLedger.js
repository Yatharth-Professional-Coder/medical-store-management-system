const mongoose = require('mongoose');

const supplierLedgerSchema = mongoose.Schema({
    pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    type: {
        type: String,
        enum: ['Purchase', 'Payment'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String // e.g., "Invoice #123" or "Cash Payment"
    }
}, {
    timestamps: true
});

const SupplierLedger = mongoose.model('SupplierLedger', supplierLedgerSchema);

module.exports = SupplierLedger;
