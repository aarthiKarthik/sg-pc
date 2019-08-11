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
 * Method used to get transaction by po id
 * @param {*integer} poid 
 * @returns {*Object} dn response
 */
let getTransactionByPOId = async (poId) => {
    try {
        let query = { "po_id": poId};
        let response = await mongoDao.getData(constant.MODEL_TYPES.PROCUREMENT, query);

        return Promise.resolve(response);
    } catch (e) {
        return Promise.reject(e)
    }
}

/**
 * Method used to update invoice id
 * @param {*String} invoiceId 
 * @param {*String} poId 
 * @returns {*Object} dn response
 */
let updateInvoiceId = async (poId, invoiceId) => {
    try {
        
        let query =  { po_id: poId};
        let condition = { $set : { invoice_id: invoiceId }} ; 
        console.log('updateInvoiceId query' ,  query, condition)
        let response = await mongoDao.updateData(constant.MODEL_TYPES.PROCUREMENT, query, condition);

        return Promise.resolve(response);
    } catch (e) {
        return Promise.reject(e)
    }
}

module.exports={
    createProcurement,
    getProcurementById,
    updateInvoiceId,
    getTransactionByPOId
}