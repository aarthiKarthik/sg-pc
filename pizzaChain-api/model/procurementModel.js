const mongoose = require('mongoose');
const Schema = mongoose.Schema;
PROCUREMENT_SCHEMA = Schema({
    transaction_id: { type: Number },
    po_id: { type: Number },
    invoice_id: { type: Number },
    token_id: { type: Number },
    created_date: { type: Date, default: new Date() },
});

const PROCUREMENT = mongoose.model('procurement', PROCUREMENT_SCHEMA);
module.exports = PROCUREMENT;