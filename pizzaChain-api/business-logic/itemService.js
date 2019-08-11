const mongoDao = require('../dao/mongo');
const logger = require('../config/logger');
const pizzaChainConstants = require('../constants/pizzaChainConstants');

/**
 * Method used to get item price by supplier
 * @param {*Object} itemObject 
 * @returns {*Object} dn response
 */
let getItemPriceBySupplier = async (supplierId, itemObject) => {
    try {
        let collection = pizzaChainConstants.supplierPriceObj[supplierId];  console.log("collection = "+collection);
        let query = { "item_id": itemObject.item_id, "unit": itemObject.unit}; console.log("json =" + JSON.stringify(itemObject));
        let response = await mongoDao.getData(collection, query); console.log("response = "+response);
        let itemPrice = response[0].price;

        return Promise.resolve(itemPrice);
    } catch (e) {
        logger.error("Item Service : getItemPriceBySupplier : error = " + e);
        return Promise.reject(e)
    }
}

module.exports = {
    getItemPriceBySupplier
}