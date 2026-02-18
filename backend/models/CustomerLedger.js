const mongoose = require('mongoose');

const customerLedgerSchema = mongoose.Schema({
    pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    type: {
        type: String,
        enum: ['Credit', 'Payment'], // Credit: They owe us (positive balance), Payment: They paid us (negative balance)
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
        type: String,
        required: false
    }
}, {
    timestamps: true
});

const CustomerLedger = mongoose.model('CustomerLedger', customerLedgerSchema);

module.exports = CustomerLedger;
