const Response = require('./response/index');
const logger = require('../config/logger');
const controller = require('../api-gateway/controller')

let init = (router) => {

    //To get procurement transactions
    router.route('/transaction/:filter')
        .get(async (req, res) => {
            let response;
            try {
                response = await controller.getTransactions(req.params.filter);
                res.status(response.code).json(response);
            } catch (e) {
                logger.error("API Gateway : /transaction/:filter : e = " + e);
                response = new Response(500, "Error in Get Transactions", {}, e);
                res.status(response.code).json(response);
            }
        })

    //To get procurement by transaction id
    router.route('/transaction/:id/:filter')
        .get(async (req, res) => {
            let response;
            try {
                response = await controller.getTransactionById(req.params.id, req.params.filter);
                res.status(response.code).json(response);
            } catch (e) {
                logger.error("API Gateway : transaction/:id/:filter : e = " + e);
                response = new Response(500, "Error in Get Transaction by Id", {}, e);
                res.status(response.code).json(response);
            }
        })

    //To get procurement by supplier id
    router.route('/transaction-supplier/:supplierId/:filter')
        .get(async (req, res) => {
            let response;
            try {
                console.log("/transaction-supplier/:supplierId/:filter = "+ req.params.supplierId +"  -  "+ req.params.filter);
                response = await controller.getTransactionBySupplierId(req.params.supplierId, req.params.filter);
                res.status(response.code).json(response);
            } catch (e) {
                logger.error("API Gateway : transaction-supplier/:supplierId/:filter: e = " + e);
                response = new Response(500, "Error in Get Transaction by Supplier Id", {}, e);
                res.status(response.code).json(response);
            }
        })

    //To issue PO    
    router.route('/purchase-order')
        .post(async (req, res) => {
            let response;
            try {
                response = await controller.issuePO(req);
                res.status(response.code).json(response);
            } catch (e) {
                logger.error("API Gateway : purchase-order : e = " + e);
                response = new Response(500, "Error in Issue PO", {}, e);
                res.status(response.code).json(response);
            }
        })

    //To get PO, given ID
    router.route('/purchase-order/:poId')
        .get(async (req, res) => {
            let response;
            try {
                response = await controller.getPOById(req.params.poId);
                res.status(response.code).json(response);
            } catch (e) {
                logger.error("API Gateway : purchase-order/:poId : e = " + e);
                response = new Response(500, "Error in getting PO by ID", {}, e);
                res.status(response.code).json(response);
            }
        })

    //To get all POs, returns po ids
    router.route('/purchase-order/')
        .get(async (req, res) => {
            let response;
            try {
                response = await controller.getPOList();
                res.status(response.code).json(response);
            } catch (e) {
                logger.error("API Gateway : purchase-order : e = " + e);
                response = new Response(500, "Error in retrieving list of PO Ids", {}, e);
                res.status(response.code).json(response);
            }
        })

    // To ack PO and issue Invoice, return the Invoice Id on success
    router.route('/invoice/:poId')
        .post(async (req, res) => {
            let response;
            try {

                let poDataRes = await controller.ackPO(req.params.poId);

                let response = await controller.issueInvoice(poDataRes.data, req.query.itemPrice);

                res.status(response.code).json(response);

            } catch (e) {
                logger.error("API Gateway : invoice/:poId : e = " + e);
                response = new Response(500, "Error in Issue Invoice", {}, e);
                res.status(response.code).json(response);
            }
        })

    // To get info on Invoice, given the ID
    router.route('/invoice/:invoiceId')
        .get(async (req, res) => {
            let response;
            try {
                response = await controller.getInvoiceById(req.params.invoiceId);
                res.status(response.code).json(response);

            } catch (e) {
                logger.error("API Gateway : invoice/:invoiceId : e = " + e);
                response = new Response(500, "Error in retrieving Invoice", {}, e);
                res.status(response.code).json(response);
            }
        })

    //To get all Invoice, returns invoice ids
    router.route('/invoice/')
        .get(async (req, res) => {
            let response;
            try {
                response = await controller.getInvoiceList();
                res.status(response.code).json(response);
            } catch (e) {
                logger.error("API Gateway : invoice : e = " + e);
                response = new Response(500, "Error in retrieving list of Invoice ids", {}, e);
                res.status(response.code).json(response);
            }
        })

    //To get all Invoice info details
    router.route('/invoice-details/')
        .get(async (req, res) => {
            let response;
            try {
                response = await controller.getInvoiceDetailsList();
                res.status(response.code).json(response);
            } catch (e) {
                logger.error("API Gateway : invoice-details : e = " + e);
                response = new Response(500, "Error in retrieving list of Invoice Details", {}, e);
                res.status(response.code).json(response);
            }
        })

    // To get ERC-20 balance of an entity, given the Id
    router.route('/balance/:entityId')
        .get(async (req, res) => {
            let response;
            try {
                response = await controller.getBalance(req.params.entityId);
                res.status(response.code).json(response);

            } catch (e) {
                logger.error("API Gateway : balance/:entityId : e = " + e);
                response = new Response(500, "Error in getting balance", {}, e);
                res.status(response.code).json(response);
            }
        })

    // For payment of PizzaCoins
    router.route('/paySupplier/:invoiceId/:payerId/:supplierId')
        .post(async (req, res) => {
            let response;
            try {
                response = await controller.payment(req.params.invoiceId, req.params.payerId, req.params.supplierId);
                res.status(response.code).json(response);
            } catch (e) {
                logger.error("API Gateway : paySupplier : e = " + e);
                response = new Response(500, "Error in Payment", {}, e);
                res.status(response.code).json(response);
            }
        })

    // For minting tokens
    router.route('/makeTokens/:invoiceId')
        .post(async (req, res) => {
            let response;
            try {
                let makeTokensResponse = await controller.makeTokens(req.params.invoiceId);

                response = await controller.generateQRCode(makeTokensResponse.data.supplierId, makeTokensResponse.data.tokenId);

                res.status(response.code).json(response);
            } catch (e) {
                logger.error("API Gateway : makeTokens : e = " + e);
                response = new Response(500, "Error in making tokens", {}, e);
                res.status(response.code).json(response);
            }
        })

    // For transfer of Token
    router.route('/transferToken/:tokenId/:supplierId/:payerId')
        .post(async (req, res) => {
            let response;
            try {

                let transaction = await controller.getTransactionByTokenId(req.params.tokenId);
                console.log("transaction = "+JSON.stringify(transaction));

                //transfer item token to payer
                await controller.transferToken(req.params.tokenId, req.params.supplierId, req.params.payerId, transaction);

                //get token metadata
                response = await controller.retrieveMetadata(req.params.tokenId);
                
                res.status(response.code).json(response);
            } catch (e) {
                logger.error("API Gateway : transferToken : e = " + e);
                response = new Response(500, "Error in Transfer Token", {}, e);
                res.status(response.code).json(response);
            }
        })
    
    // To get ERC-721 balance of an entity, given the Id
    router.route('/tokenBalance/:entityId')
        .get(async (req, res) => {
            let response;
            try {
                response = await controller.getOwnedTokenBalance(req.params.entityId);
                res.status(response.code).json(response);

            } catch (e) {
                logger.error("API Gateway : tokenBalance/:entityId : e = " + e);
                response = new Response(500, "Error in getting token balance", {}, e);
                res.status(response.code).json(response);
            }
        })
}

module.exports.init = init;