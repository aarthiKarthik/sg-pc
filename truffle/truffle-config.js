module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1", //use ganache service for docker
      port: 8545,
      network_id: "*" // Match any network id
    },
    pcvm: {
      host: '40.121.216.168', 
      port: 8545,
      network_id: "*" // Match any network id
    }
  }
};
