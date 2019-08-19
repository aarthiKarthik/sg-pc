const mongoDao = require('../dao/mongo');
const constant = require('../constants/constant.json');

/**
 * Method used to insert into procurement table
 * @param {*Object} objData 
 * @returns {*Object} dn response
 */
let createProcurement = async (objData) => {
    try {
        let response = await mongoDao.saveData(constant.MODEL_TYPES.PROCUREMENT, objData);
        return Promise.resolve(response);
    } catch (e) {
        return Promise.reject(e)
    }
}

/**
 * Method used to get procurement list
 * @returns {*Object} dn response
 */
let getProcurements = async () => {
    try {
        let response = await mongoDao.getData(constant.MODEL_TYPES.PROCUREMENT);

        return Promise.resolve(response);
    } catch (e) {
        return Promise.reject(e)
    }
}

/**
 * Method used to get procurement by id
 * @param {*integer} transactionId 
 * @returns {*Object} dn response
 */
let getProcurementById = async (transactionId) => {
    try {
        let query = { "transaction_id": transactionId};
        let response = await mongoDao.getData(constant.MODEL_TYPES.PROCUREMENT, query);

        return Promise.resolve(response);
    } catch (e) {
        return Promise.reject(e)
    }
}

/**
 * Method used to get procurement by supplier id
 * @param {*integer} supplierId 
 * @returns {*Object} dn response
 */
let getProcurementBySupplierId = async (supplierId) => {
    try {
        let query = { "supplier_id": supplierId};
        let response = await mongoDao.getData(constant.MODEL_TYPES.PROCUREMENT, query);

        return Promise.resolve(response);
    } catch (e) {
        return Promise.reject(e)
    }
}

/**
 * Method used to get procurement by token id
 * @param {*String} tokenId 
 * @returns {*Object} dn response
 */
let getProcurementByTokenId = async (tokenId) => {
    try {
        let query = { "token_id": tokenId};
        let response = await mongoDao.getData(constant.MODEL_TYPES.PROCUREMENT, query);

        return Promise.resolve(response);
    } catch (e) {
        return Promise.reject(e)
    }
}

/**
 * Method used to update invoice
 * @param {*String} invoiceId 
 * @param {*String} poId 
 * @param {*Number} itemPrice 
 * @returns {*Object} dn response
 */
let updateInvoice = async (poId, invoiceId, itemPrice) => {
    try {
        
        let query =  { po_id: poId};
        let condition = { $set : { invoice_id: invoiceId, item_price: itemPrice}} ; 
        let response = await mongoDao.updateData(constant.MODEL_TYPES.PROCUREMENT, query, condition);

        return Promise.resolve(response);
    } catch (e) {
        return Promise.reject(e)
    }
}

/**
 * Method used to update token id
 * @param {*String} invoiceId 
 * @param {*String} tokenId 
 * @returns {*Object} dn response
 */
let updateTokenId = async (invoiceId, tokenId) => {
    try {
        
        let query =  { invoice_id: invoiceId};
        let condition = { $set : { token_id: tokenId}} ; 
        let response = await mongoDao.updateData(constant.MODEL_TYPES.PROCUREMENT, query, condition);

        return Promise.resolve(response);
    } catch (e) {
        return Promise.reject(e)
    }
}

module.exports={
    createProcurement,
    getProcurementById,
    updateInvoice,
    getProcurementBySupplierId,
    getProcurements,
    updateTokenId,
    getProcurementByTokenId
}