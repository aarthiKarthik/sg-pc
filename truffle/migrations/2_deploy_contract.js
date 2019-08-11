var Procurement = artifacts.require("Procurement");
var PizzaCoin = artifacts.require("PizzaCoin");
var ItemToken = artifacts.require("ItemToken");

const Web3 = require("web3")
web3 = new Web3(web3.currentProvider);

module.exports = (deployer, network, accounts) => {

  deployer.then(async () => {

    const adminAccount = (await web3.eth.getAccounts())[0];

    console.log('Deploying Procurement');
    deployer.deploy(Procurement, adminAccount);

    console.log('Deploying PizzaCoin');
    console.log(web3.eth.coinbase);
    
    await deployer.deploy(PizzaCoin, "PizzaCoin", "PCT", 0, /*new web3.utils.BN(web3.utils.toWei("1000000000", 'ether'))*/10000000, adminAccount);

    console.log('Deploying ItemToken');
    await deployer.deploy(ItemToken, adminAccount);

    console.log('Print addresses:');
    console.log("PizzaCoin address: " + PizzaCoin.address);
    console.log("ItemToken address: " + ItemToken.address);
    console.log(accounts[0] + " " + accounts[1] + " " + accounts[2]);
  })
}