'use strict';
let env = 'dev';

let props = {
  dev: {
    port: 3003,
    mongodb:{
      host: "mongodb://localhost",
      port: 27017,
      database: "pizzachain"
    },
    rpc:{
      host: "http://127.0.0.1",
      port: 8545,
    },
    qrCode:{
      path: "images/qr-codes/"
    },
    swarm:{
      host: "http://localhost",
      port: 3002,
      assetEndpoint: "asset"
    }
  },
  prod: {
    port: process.env.PORT,
    mongodb:{
      host: /* process.env.MONGO_DB || */ "pc-mongodb.documents.azure.com",
      mongodb_user: /* process.env.MONGODB_USER || */ "pc-mongodb",
      mongodb_password: /* process.env.MONGODB_PASSWORD || */ "LzzUKl9XSdhr55jWfGh8f9iBmWZvAxYiCxz4LrZdeT53QgYDj5JRqj5237lOjMolY9wErwpRxJd6bl6573HBeg==",
      port: /* process.env.MONGODB_PORT || */10255,
      database: "pizzachain"
    },
    rpc:{
      host: /* process.env.GANACHE || */ "http://40.121.216.168",
      port: 8545
    },
    qrCode:{
      path: "images/qr-codes/"
    },
    swarm:{
      host: /* process.env.SWARM || */ "http://40.121.216.168",
      port: 3002,
      assetEndpoint: "asset"
    }
  }
};

let setEnv = environment => {
  if (props[environment]) {
    env = environment;
  }
};

let getProps = () => {
  return props[env];
};

module.exports = {
  setEnv,
  getProps,
};