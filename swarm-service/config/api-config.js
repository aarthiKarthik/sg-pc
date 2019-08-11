'use strict';
let env = 'dev';

let props = {
  dev: {
    port: 3002,
    swarmport: 8500
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

module.exports.setEnv = setEnv;
module.exports.getProps = getProps;