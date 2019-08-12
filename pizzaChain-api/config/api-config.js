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
    port: 3003,
    mongodb:{
      host: process.env.MONGO_DB,
      mongodb_user: process.env.MONGODB_USER,
      mongodb_password: process.env.MONGODB_PASSWORD,
      port: process.env.MONGODB_PORT,
      database: "pizzachain"
    },
    rpc:{
      host: process.env.GANACHE,
      port: 8545,
    },
    qrCode:{
      path: "images/qr-codes/"
    },
    swarm:{
      host: process.env.SWARM,
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