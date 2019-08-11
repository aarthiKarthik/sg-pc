let apiGatewayController = require('./apiGatewayController')
let init = (router) => {
    apiGatewayController.init(router);
};

module.exports.init = init;