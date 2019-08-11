'use strict';

let env = 'dev';

let props = {
  dev: {
    port: 3000,
    pizzaChain:{
      host: "http://localhost",
      port: 3003,
      tokenEndpoint: "transferToken"
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