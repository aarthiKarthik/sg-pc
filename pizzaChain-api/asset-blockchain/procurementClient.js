const contract = require('truffle-contract');
const Web3 = require('web3');
const path = require('path');
const config = require('../config/api-config');
const procurementJSON = require(path.join(__dirname, '../../truffle/build/contracts/Procurement.json'));
if (process.env.NODE_ENV === "prod") {
    procurementJSON = require(path.join(__dirname, 'truffle/build/contracts/Procurement.json'));
}
const pizzaChainConstants = require('../constants/pizzaChainConstants');

const configProperties = config.getProps();

const web3Provider = new Web3.providers.HttpProvider(`${configProperties.rpc.host}:${configProperties.rpc.port}`);
const web3 = new Web3(web3Provider);

var ProcurementContract = contract(procurementJSON);
ProcurementContract.setProvider(web3Provider);

let procurementInstance;

(async () => {

    const account = (await web3.eth.getAccounts())[pizzaChainConstants.accounts.ADMIN];
    console.log('account = '+account);
    ProcurementContract.defaults({
        from: account,
        gas: 999999,
        gasPrice: 0,
    });

    procurementInstance = await ProcurementContract.deployed();
    console.log('Connected to Procurement contract.');
})().catch(err => {
    console.error('Failed to connect to Procurement contract.');
    console.error(err);
});

module.exports = {
    createPO: async (processId, status, req) => {

        let itemType = pizzaChainConstants.itemTypes[req.itemType];

        let response = await procurementInstance.issuePO(processId, req.supplierId, itemType, req.qty, req.uom, status);
        // Capture event from smart contract <TODO>
        if (response.err) {
            console.log('Error in createPO.' + err);
        }
        else {
            console.log('ProcurementClient : Fetched createPO Response.' + JSON.stringify(response));
        }
        return Promise.resolve(response);
    },
    createInvoice: async (processId, status, itemPrice, req) => {
        let itemType = pizzaChainConstants.itemTypes[req.itemType];

        let response = await procurementInstance.issueInvoice(processId, req.poId, req.supplierId, itemType, req.qty, req.uom, itemPrice, status);
        if (response.err) {
            console.log('ProcurementClient : Error in createInvoice.' + err);
        }
        else {
            console.log('ProcurementClient : Fetched createInvoice Response.');
        }
        return Promise.resolve(response);
    },
    updatePOStatus: async (processId, status) => {

        let response = await procurementInstance.updatePOStatus(processId, status);
        if (response.err) {
            console.log('ProcurementClient : Error in updatePOStatus.' + err);
        }
        else {
            console.log('ProcurementClient : Fetched updatePOStatus Response.');
        }
        return Promise.resolve(response);
    },
    getPOById: async (processId) => {
        //<TODO> Check if this calls with bytes32
        //<TODO> Craft response into JSON structure
        let response = await procurementInstance.getPOById(processId);

        if (response.err) {
            console.log('ProcurementClient : Error in getPO.' + err);
        }
        else {
            console.log('ProcurementClient : Fetched getPO Response.'+JSON.stringify(response));
        }
        return Promise.resolve(response);
    },
    getPOList: async () => {
        //<TODO> Craft array output into response  
        let response = await procurementInstance.getPOList();
        if (response.err) {
            console.log('ProcurementClient : Error in getPOList.' + err);
        }
        else {
            console.log('ProcurementClient : Fetched getPOList Response.');
        }
        return Promise.resolve(response);
    },

    getInvoiceById: async (processId) => {

        let response = await procurementInstance.getInvoiceById(processId);
        if (response.err) {
            console.log('ProcurementClient : Error in getInvoice.' + err);
        }
        else {
            console.log('ProcurementClient : Fetched getInvoice Response.');
        }
        return Promise.resolve(response);
    },
    getInvoiceList: async () => {
        let response = await procurementInstance.getInvoiceList();
        if (response.err) {
            console.log('ProcurementClient : Error in getInvoiceList.' + err);
        }
        else {
            console.log('ProcurementClient : Fetched getInvoiceList Response.');
        }
        return Promise.resolve(response);
    },
}