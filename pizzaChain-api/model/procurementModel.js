const mongoose = require('mongoose');
const Schema = mongoose.Schema;
PROCUREMENT_SCHEMA = Schema({
    transaction_id: { type: String },
    supplier_id: {type: String},
    po_id: { type: String },
    invoice_id: { type: String },
    token_id: { type: String },
    item_price: {type: Number},
    created_date: { type: Date, default: new Date() },
});

const PROCUREMENT = mongoose.model('procurement', PROCUREMENT_SCHEMA);
module.exports = PROCUREMENT;