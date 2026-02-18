const mongoose = require('mongoose');

const supplierSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    companiesSupplied: [{ // e.g. ["Cipla", "Sun Pharma"]
        type: String
    }],
    pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true
    }
}, {
    timestamps: true
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
