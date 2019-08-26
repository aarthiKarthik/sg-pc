const Response = require('./response/index');
const logger = require('../config/logger');
const config = require('../config/api-config');
const constant = require('../constants/constant');
const procurementClient = require('../asset-blockchain/procurementClient');
const itemTokenClient = require('../asset-blockchain/itemTokenClient');
const pizzaCoinClient = require('../asset-blockchain/pizzaCoinClient');
const procurementService = require('../business-logic/procurementService');
const externalAPI = require('../utils/externalAPI');
const pizzaChainConstants = require('../constants/pizzaChainConstants');
const qr = require('qr-image');
const fs = require('fs');

const configProperties = config.getProps();
let swarmServiceURl = `${configProperties.swarm.host}:${configProperties.swarm.port}/${configProperties.swarm.assetEndpoint}`;


//get list of  transactions
async function getTransactions(filter) {
    return new Promise(async (resolve, reject) => {
        try {
            //get list of po ids, invoice ids by transaction id
            let transaction = await procurementService.getProcurements();
           
            let transactionDetails = await getTransactionDetails(transaction, filter.toUpperCase());

            let response = new Response(200, "Transactions", transactionDetails, null);
            resolve(response);
        } catch (e) {
            logger.error("controller : getTransactions : e = " + e);
            reject(e);
        }
    })
}

//get list of pos issued to supplier
async function getTransactionBySupplierId(supplierId, filter) {
    return new Promise(async (resolve, reject) => {
        try {
            let transactionDetails = null;
            
            //get list of po ids, invoice ids by transaction id
            let transaction = await procurementService.getProcurementBySupplierId(supplierId);
            console.log("getTransactionBySupplierId = transaction = "+JSON.stringify(transaction));
            
            if(transaction){
                transactionDetails = await getTransactionDetails(transaction, filter.toUpperCase());
            }

            let response = new Response(200, "Procurement Transactions By Supplier Retrieved", transactionDetails, null);
            resolve(response);
        } catch (e) {
            logger.error("controller : getTransactionBySupplierId : e = " + e);
            reject(e);
        }
    })
}

//get transaction by id
async function getTransactionById(transactionId, filter) {
    return new Promise(async (resolve, reject) => {
        try {
            //get list of po ids, invoice ids by transaction id
            let transaction = await procurementService.getProcurementById(transactionId);
            let transactionDetails = await getTransactionDetails(transaction, filter.toUpperCase());

            let response = new Response(200, "Procurement Transaction Retrieved", transactionDetails, null);
            resolve(response);
        } catch (e) {
            logger.error("controller : getTransactionById : e = " + e);
            reject(e);
        }
    })
}

//get transaction by token id
async function getTransactionByTokenId(tokenId) {
    return new Promise(async (resolve, reject) => {
        try {
            //get list of po ids, invoice ids by token id
            let transaction = await procurementService.getProcurementByTokenId(tokenId);

            let response = new Response(200, "Procurement Transaction Retrieved", transaction, null);
            resolve(response);
        } catch (e) {
            logger.error("controller : getTransactionByTokenId : e = " + e);
            reject(e);
        }
    })
}

/** To get transaction details
@param transaction object
@param filter (Invoice/PO)
*/
async function getTransactionDetails(transaction, filter){
    let transactions = [];

    for (var key in transaction) {

        let transactionDetails = {
            transactionId: null,
            po: [],
            invoice: [],
            tokenId: null
        };

        if (transaction.hasOwnProperty(key)) {
            //console.log("transaction[key].transaction_id = "+transaction[key].transaction_id);

            if(transaction[key].po_id && filter !== "INVOICE"){
                let poData = await getPOById(transaction[key].po_id);
                if(poData.code == 200){
                    transactionDetails.po.push(poData);
                    transactionDetails.transactionId = transaction[key].transaction_id;
                }
            }
            if(transaction[key].invoice_id && filter !== "PO"){
                let invoiceData = await getInvoiceById(transaction[key].invoice_id);
                if(invoiceData.code == 200){
                    transactionDetails.invoice.push(invoiceData);
                    transactionDetails.transactionId = transaction[key].transaction_id;
                }
            }

            transactionDetails.tokenId = transaction[key].token_id;

            if(transactionDetails.transactionId){
                transactions.push(transactionDetails);
            }
            
        }
    }
    return transactions;
}

async function issuePO(req) {
    return new Promise(async (resolve, reject) => {
        try {
            let res = 500;
            let msg = "Failed";
            let transactionId = fnGetUniqueID();
            let poTransactions = {
                transactionId: transactionId,
                poIds: []
            };

            let po = req.body;

            for (var key in po) {
                if (po.hasOwnProperty(key)) {
                    let processId = fnGetUniqueID();

                    let supplierPO = {
                        supplierId : po[key].supplierId,
                        itemType: po[key].itemType,
                        qty: po[key].qty,
                        uom: po[key].uom
                    }
                    let poResponse = await procurementClient.createPO(processId, constant.PO_STATUS.ISSUED, supplierPO);

                    if (poResponse) {
                        //record into procurement table
                        let procurementObj = {
                            transaction_id: transactionId,
                            supplier_id: po[key].supplierId,
                            po_id: processId
                        }
                        
                        await procurementService.createProcurement(procurementObj);

                        poTransactions.poIds.push(processId);
                    }
                }
             }

            if (poTransactions.poIds) {
                res = 201;
                msg = "PO Issued";
            }

            let response = new Response(res, msg, poTransactions, null);
            resolve(response);
        } catch (e) {
            logger.error("controller : issuePO : e = " + e);
            reject(e);
        }
    })
}

async function getPOById(poId) {
    return new Promise(async (resolve, reject) => {
        try {
                logger.info("getPOById : poId = "+poId);
                let res = await procurementClient.getPOById(poId);

                //verify if empty value
                if(res[0] == null || res[0] === ""){
                    let response = new Response(404, "Error in Get PO by Id", null, "PO Not Found");
                    resolve(response);
                    return;
                }

                let poData = mapPOData(poId, res);
                let response = new Response(200, "PO Retrieved", poData, null);
                resolve(response);
            } catch (e) {
                logger.error("controller : getPOById : e = " + e);
                reject(e);
            }
    })
}

async function getPOList() {
    return new Promise(async (resolve, reject) => {
        try {
            //get list of po ids
            let poIds = await procurementClient.getPOList();
            let response = new Response(200, "PO List Retrieved", poIds, null);
            resolve(response);
        } catch (e) {
            logger.error("controller : getPOList : e = " + e);
            reject(e);
        }
    })
}

async function ackPO(poId) {
    return new Promise(async (resolve, reject) => {
        try {
            let res = 500;
            let msg = "Failed";

            let po = await procurementClient.getPOById(poId);
            let poData = mapPOData(poId, po);

            //acknowledge PO
            let updateResponse = await procurementClient.updatePOStatus(poData.poId, constant.PO_STATUS.ACKNOWLEDGED);

            if (updateResponse == true) {
                res = 200;
                msg = "Acked PO";
            }
                
            let response = new Response(res, msg, poData, null);

            resolve(response);
        } catch (e) {
            logger.error("controller : ackPO : e = " + e);
            reject(e);
        }
    })
}

async function updatedPOStatus(poId, status) {
    return new Promise(async (resolve, reject) => {
        try {
            let res = 500;
            let msg = "Failed";

            let po = await procurementClient.getPOById(poId);
            let poData = mapPOData(poId, po);

            //update PO status
            let updateResponse = await procurementClient.updatePOStatus(poData.poId, status);

            if (updateResponse == true) {
                res = 200;
                msg = status;
            }
                
            let response = new Response(res, msg, poData, null);

            resolve(response);
        } catch (e) {
            logger.error("controller : updatedPOStatus : e = " + e);
            reject(e);
        }
    })
}

async function issueInvoice(poData, itemPrice) {
    return new Promise(async (resolve, reject) => {
        try {
            let res = 500;
            let msg = "Failed";

            //get item price by supplier
            // let item = {
            //     item_id: poData.itemId,
            //     unit: poData.uom
            // }

            //let itemPricePerUnit = await itemService.getItemPriceBySupplier(poData.supplierId, item);
            //get min. item price by item type

            //let itemPricePerUnit = Number(pizzaChainConstants.itemPrice[poData.itemType]);
            
            //let itemPrice = itemPricePerUnit * poData.qty;

            let processId = fnGetUniqueID();
            let invoiceResponse = await procurementClient.createInvoice(processId, constant.INVOICE_STATUS.ISSUED, itemPrice, poData);
            
            if (invoiceResponse) {
                res = 201;
                msg = "Invoice Issued";

                //update invoice id in procurement table
                await procurementService.updateInvoice(poData.poId, processId, itemPrice);
            }
            
            let response = new Response(res, msg, processId, null);

            resolve(response);
        } catch (e) {
            logger.error("controller : issueInvoice : e = " + e);
            reject(e);
        }
    })
}

async function getInvoiceById(invoiceId) {
    return new Promise(async (resolve, reject) => {
        try {
                let res = await procurementClient.getInvoiceById(invoiceId);

                //check if po id returned 0
                if(res[0] == 0){
                    let response = new Response(404, "Error in Get Invoice by Id", null, "Invoice Not Found");
                    resolve(response);
                    return;
                }

                invoice = mapInvoiceData(invoiceId, res);
                let response = new Response(200, "Invoice Retrieved", invoice, null);
                
                resolve(response);
            } catch (e) {
                logger.error("controller : getInvoiceById : e = " + e);
                reject(e);
            }
    })
}

async function getInvoiceList() {
    return new Promise(async (resolve, reject) => {
        try {
            //get list of invoice ids
            let invoiceIds = await procurementClient.getInvoiceList();
            
            let response = new Response(200, "Invoice List Retrieved", invoiceIds, null);
            resolve(response);
        } catch (e) {
            logger.error("controller : getInvoiceList : e = " + e);
            reject(e);
        }
    })
}

async function getInvoiceDetailsList() {
    return new Promise(async (resolve, reject) => {
        try {
            //get list of invoice ids
            let invoiceIdsReponse = await getInvoiceList();
            let invoiceIds = invoiceIdsReponse.data;
            let invoiceList = [];            

            //get details by invoice id
            for(var ctr in invoiceIds){
                let invoiceResponse = await getInvoiceById(invoiceIds[ctr]);
                invoiceList.push(invoiceResponse.data);
            }

            let response = new Response(200, "Invoice Details List Retrieved", invoiceList, null);
            resolve(response);
        } catch (e) {
            logger.error("controller : getInvoiceDetailsList : e = " + e);
            reject(e);
        }
    })
}

async function getBalance(entityId) {
    return new Promise(async (resolve, reject) => {
        try {
                let res = await pizzaCoinClient.getBalance(entityId);
                let response = new Response(200, "Balance Retrieved", res, null);
                resolve(response);
            } catch (e) {
                logger.error("controller : getBalance : e = " + e);
                reject(e);
            }
    })
}

async function payment(invoiceId, fromId, toId) {
    return new Promise(async (resolve, reject) => {
        let status;
        try {
            logger.info("controller : payment : invoiceId = " + invoiceId + " fromId = "+fromId + " toId = "+toId);

            status = 500;
            let msg = "Failed";
            let receipt = null;
            //get invoices
            let invoice = await procurementClient.getInvoiceById(invoiceId);
            let invoiceData = mapInvoiceData(invoiceId, invoice);

            //transfer pizzacoin to cheeseco
            let transferDetails = await pizzaCoinClient.transferAmount(fromId, toId, invoiceData.price);

            if (transferDetails.transferStatus)
            {
                status = 200;
                msg = "Payment done";
                receipt = transferDetails.receipt;

                await procurementClient.updateInvoiceStatus(invoiceId, constant.INVOICE_STATUS.PAYMENT_RECEIVED);
            }
                
            let response = new Response(status, msg, receipt, null);
            resolve(response);
        } catch (e) {
            logger.error("controller : payment : e = " + e);
            reject(e);
        }
    })
}

async function makeTokens(invoiceId) {
    
    return new Promise(async (resolve, reject) => {
        let status;
        try {
            status = 500;
            let msg = "Failed";
            let useSwarm = true;
            let makeTokensResponse = {};

            logger.info("controller : makeTokens : invoiceId = " + invoiceId);

            let invoice = await procurementClient.getInvoiceById(invoiceId);
            let invoiceData = mapInvoiceData(invoiceId, invoice);

            logger.info("controller : makeTokens : invoiceData = " + JSON.stringify(invoiceData));

            let mintResponse = await mintItemToken(invoiceData, useSwarm); 

            logger.info("controller : makeTokens : mintResponse = " + JSON.stringify(mintResponse));
            
            if (mintResponse.status == true) {
                //get account id by supplier id
                var supplierAccountId = pizzaChainConstants.accounts[invoiceData.supplierId];

                //transfer from admin to supplier
                let transferResponse = await itemTokenClient.transfer(pizzaChainConstants.accounts.ADMIN, supplierAccountId, mintResponse.tokenId);
                
                logger.info("controller : makeTokens : transferResponse = " + JSON.stringify(transferResponse));

                if (transferResponse) {
                    status = 200;
                    msg = "Tokens transferred to Supplier";

                    makeTokensResponse = {
                        supplierId: invoiceData.supplierId,
                        tokenId: mintResponse.tokenId
                    }

                    //update po status
                    await updatedPOStatus(invoiceData.poId, constant.PO_STATUS.PENDING_DELIVERY);

                    //update token id in procurement table
                    await procurementService.updateTokenId(invoiceId, mintResponse.tokenId);
                }
            }
                
            let response = new Response(status, msg, makeTokensResponse, null);
            resolve(response);
        } catch (e) {
            logger.error("controller : makeTokens : e = " + e);
            reject(e);
        }
    })
}

async function generateQRCode(supplierId, invoiceId) {
    return new Promise(async (resolve, reject) => {
        let status;
        try {
            status = 500;
            let msg = "Failed";

            let qrData = {
                supplierId : supplierId,
                tokenId : invoiceId
            }
            var filename = qrData.tokenId+'.svg';
            var code = qr.image(JSON.stringify(qrData), { type: 'svg' }); 
            var filepath = configProperties.qrCode.path + filename;
            var output = fs.createWriteStream(filepath);
            code.pipe(output);
            
            status = 200;
            msg = "QR Code generated";
            
            let response = new Response(status, msg, filepath, null);
            resolve(response);
            
        } catch (e) {
            logger.error("controller : generateQrCode : e = " + e);
            reject(e);
        }
    })
}

function getFileNameByTokenId(tokenId) {
    return configProperties.qrCode.path+ tokenId + '.svg'
}

async function transferToken(tokenId, fromId, toId, transaction) {
    return new Promise(async (resolve, reject) => {
        let status;
        try {
            status = 500;
            let msg = "Failed";

            logger.info("controller : transferToken : tokenId = " + tokenId + " fromId = "+fromId + " toId = "+toId);

            //transfer pizzacoin to cheeseco
            let transferDetails = await itemTokenClient.transferToken(fromId, toId, tokenId);

            if (transferDetails.transferStatus)
            {
                status = 200;
                msg = "Transfer done";

                //update po status
                await procurementClient.updatePOStatus(transaction.data[0].po_id, constant.PO_STATUS.DELIVERED);

                //update invoice status
                await procurementClient.updatePOStatus(transaction.data[0].invoice_id, constant.INVOICE_STATUS.COMPLETED);

            }
             
            let response = new Response(status, msg, transferDetails, null);
            resolve(response);
        } catch (e) {
            logger.error("controller : transferToken : e = " + e);
            reject(e);
        }
    })
}

async function getOwnedTokenBalance(entityId) {
    return new Promise(async (resolve, reject) => {
        try {
                let res = await itemTokenClient.getBalance(entityId);
                let response = new Response(200, "Balance Retrieved", res, null);
                resolve(response);
            } catch (e) {
                logger.error("controller : getOwnedTokenBalance : e = " + e);
                reject(e);
            }
    })
}

async function retrieveMetadata(tokenId) {
    return new Promise(async (resolve, reject) => {
        try {
                let useSwarm = true;
                let tokenMetadata = await getMetadata(tokenId, useSwarm);
                logger.info("controller : retrieveMetadata : tokenMetadata = " + JSON.stringify(tokenMetadata));
                let response = new Response(200, "Token Metadata Retrieved", tokenMetadata, null);
                resolve(response);
        } catch (e) {
                logger.error("controller : retrieveMetadata : e = " + e);
                reject(e);
        }
    })
}

async function getMetadata(tokenId, useSwarm){
    let tokenMetadata = null;

    try{
        if(useSwarm == true){
            if(tokenId.startsWith("0x")){
                tokenId = tokenId.substring(2);
            }
            let url = swarmServiceURl + "/" + tokenId; logger.info("controller : getMetadata : swarmServiceURl = " + url);
            tokenMetadata = await externalAPI.fnGET(url);
            logger.info("controller : getMetadata : tokenMetadata = " + JSON.stringify(tokenMetadata));
        }else{
            let res = await itemTokenClient.getMetadata(tokenId);
            tokenMetadata = mapTokenData(tokenId, res);
        }
        return Promise.resolve(tokenMetadata);
    }catch(e){
        logger.error("controller : getMetadata : e = " + e);
        return Promise.resolve(e);
    }
}

function fnGetUniqueID(){
    //return Date.now() + Math.random().toString(36).slice(2);

    return (Date.now() + Math.random().toString().substr(2, 5));
}

function mapInvoiceData(invoiceId, invoice){
    let itemType = getKeyByValue(pizzaChainConstants.itemTypes, Number(invoice[2]));

    let invoiceData = {
        "invoiceId": invoiceId,
        "poId": invoice[0],
        "supplierId": invoice[1],
        "itemType": itemType,
        "qty" : Number(invoice[3]),
        "uom" : invoice[4],
        "price": Number(invoice[5]),
        "status": invoice[6]
    }
    return invoiceData;
}

function mapPOData(poId, po){
    let itemType = getKeyByValue(pizzaChainConstants.itemTypes, Number(po[1]));

    let poData = {
        "poId": poId,
        "supplierId": po[0],
        "itemType": itemType,
        "qty" : Number(po[2]),
        "uom" : po[3],
        "status": po[4]
    }
    return poData;
}

function mapTokenData(invoiceId, metadata){
    let itemType = getKeyByValue(pizzaChainConstants.itemTypes, Number(metadata[0]));

    let tokenMetadata = {
        "invoiceId": invoiceId,
        "itemType": itemType,
        "qty" : Number(metadata[1]),
        "uom" : metadata[2],
        "price": Number(metadata[3])
    }
    return tokenMetadata;
}

async function mintItemToken(invoiceData, useSwarm){
    let metadata = {
        "invoiceId": invoiceData.invoiceId,
        "itemType": invoiceData.itemType,
        "uom": invoiceData.uom,
        "qty": invoiceData.qty,
        "price": invoiceData.price
    }

    let mintResponse = {};
    if (useSwarm == true) {

        //call swarm service to create token id
        let response = await externalAPI.fnPOST(swarmServiceURl, metadata);
        let tokenId = "0x" + response.rootHash;  
        
        //mint token
        response = await itemTokenClient.mint(tokenId);

        mintResponse = {
            status: true,
            tokenId: tokenId
        }

    } else {
        //mint token
        response = await itemTokenClient.mintDataToBC(metadata);

        mintResponse = {
            status: true,
            tokenId: invoiceData.invoiceId
        }
    }

    return Promise.resolve(mintResponse);
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

module.exports = {
    issuePO,
    getPOById,
    getPOList,
    ackPO,
    issueInvoice,
    getInvoiceById,
    payment,
    getBalance,
    makeTokens,
    generateQRCode,
    transferToken,
    getInvoiceList,
    getOwnedTokenBalance,
    getInvoiceDetailsList,
    retrieveMetadata,
    getTransactionBySupplierId,
    getTransactionById,
    getTransactions,
    getTransactionByTokenId,
    getFileNameByTokenId
};

