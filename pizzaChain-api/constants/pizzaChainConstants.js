const constant = require('./constant.json');

let supplierObj = {
    CHEESECO: constant.MODEL_TYPES.CHEESE_PO
}

let supplierPriceObj = {
    CHEESECO: constant.MODEL_TYPES.CHEESE_SUPPLIER_PRICE
}

let itemTypes = {
    CHEESE : 1,
    DOUGH : 2,
    SAUCE: 3
}

let accounts = {
    ADMIN: 0,
    PIZZACO: 1,
    CHEESECO: 2,
    DOUGHCO: 3
}

let itemPrice = {
    CHEESE : 10, //cheese
    DOUGH : 30, //dough
    SAUCE : 20 //sauce
}

// <TODO> PizzaCO constant - 1; CheeseCo - 2
module.exports = {
    supplierObj,
    supplierPriceObj,
    itemTypes,
    accounts,
    itemPrice
}