const contract = require('truffle-contract');
const Web3 = require('web3');
const path = require('path');
const jsonfile = require("jsonfile");
const config = require('../config/api-config');
const pizzaChainConstants = require('../constants/pizzaChainConstants');

const pizzaCoinJSON = require(path.join(__dirname, '../../truffle/build/contracts/PizzaCoin.json'));
const configProperties = config.getProps();

//<TODO> move to api-config

const web3Provider = new Web3.providers.HttpProvider(`${configProperties.rpc.host}:${configProperties.rpc.port}`);
const web3 = new Web3(web3Provider);

var PizzaCoinContract = contract(pizzaCoinJSON);
PizzaCoinContract.setProvider(web3Provider);

let pizzaCoinInstance;
let pizzaCoinInstanceAddress;
let coinbase;

(async () => {

    web3.eth.getAccounts().then(address => {
        coinbase = address[pizzaChainConstants.accounts.ADMIN];
        web3.eth.defaultAccount = coinbase;
    });

    pizzaCoinInstance = await PizzaCoinContract.deployed();
    pizzaCoinInstanceAddress = pizzaCoinInstance.address;

    console.log('Connected to Pizza Coin contract.');
})().catch(err => {
    console.error('Failed to connect to Pizza Coin contract.');
    console.error(err);
});

module.exports = {
    getBalance: async(accId) => {
        acc = (await web3.eth.getAccounts())[accId];
        try {
            //check balance
            let balance = Number(await pizzaCoinInstance.balanceOf(acc));
            return Promise.resolve(balance);
        }catch(e){
            return Promise.reject(e);
        }
    },

    transferAmount: async(userAccId, merchantAcctId, amount) =>{
        userAcc = (await web3.eth.getAccounts())[userAccId];
        merchantAcct = (await web3.eth.getAccounts())[merchantAcctId];

        console.log("transfer from : userAcc = "+ userAcc + " - transfer to : merchantAcct = "+merchantAcct +" - amount = "+amount); 
        let transferDetails = {
            transferStatus : false,
            receipt : null
        };
        try{
            //check pizza co balance
            let pizzaCoBalance = Number(await pizzaCoinInstance.balanceOf(userAcc));
            console.log("pizzaCoBalance = "+ pizzaCoBalance);

            //check supplier balance
            let supplierInitialAccountBalance = Number(await pizzaCoinInstance.balanceOf(merchantAcct));
            console.log("supplierInitialAccountBalance = "+ supplierInitialAccountBalance);

            //top up pizza co account
            if(pizzaCoBalance == 0){
                await pizzaCoinInstance.transfer(userAcc, amount, { from: coinbase });
            }

            //transfer pizzacoin to supplier
            let receipt = await _transferAmt(userAcc, merchantAcct, amount);
            console.log("receipt = "+JSON.stringify(receipt.transactionHash));

            //check balance
            let supplierAccountBalance = Number(await pizzaCoinInstance.balanceOf(merchantAcct));
            console.log("supplierAccountBalance = "+ supplierAccountBalance);

            if(supplierInitialAccountBalance + amount  == supplierAccountBalance){
                transferDetails.transferStatus = true;
                transferDetails.receipt = receipt.transactionHash;
            }

            return Promise.resolve(transferDetails);
        }catch(e){
            return Promise.reject(e);
        }
    }
}

/**
 * This method was taken from Lotte and modified to send transfer 
 * with raw transaction data and without the use of private key
 * 
 * @param {* buyer account} fromAcct 
 * @param {* supplier account} toAcct 
 * @param {* value to transfer} amount 
 */
async function _transferAmt(fromAcct, toAcct, amount) {
    try {
        var count = await web3.eth.getTransactionCount(fromAcct);
        var abiArray = await jsonfile.readFileSync('../truffle/build/contracts/PizzaCoin.json');
        //parsed = JSON.parse(abiArray);
        abi = abiArray.abi;
        var contractAddress = await PizzaCoinContract.deployed();
        //var inst =  await thisweb3.eth.contract(abiArray).at(contractAddress);
        var inst = new web3.eth.Contract(abi, contractAddress, {from: coinbase});

        //var data = inst.transfer.getData(toAcct, amount, {from: fromAcct});
        const txValue = web3.utils.toHex(amount);
        var data = inst.methods.transfer(toAcct, txValue).encodeABI();
        var gasPrice = 0;//web3.eth.gasPrice;
        var gasLimit = 4700000;

        var rawTransaction = {
            "from": web3.utils.toChecksumAddress(fromAcct),
            "nonce": web3.utils.toHex(count),
            "gasPrice": web3.utils.toHex(gasPrice),
            "gasLimit": web3.utils.toHex(gasLimit),
            "to": web3.utils.toChecksumAddress(pizzaCoinInstanceAddress),
            "value": 0, // num of Ether to transfer
            "data": data
            //"chainId": 0x0A // from Quorum genesis file
        };
        //var privKey = Buffer.from(web3.utils.hexToBytes(privKey));
        //var tx = new Tx(rawTransaction);
        //tx.sign(privKey);
        //var serializedTx = tx.serialize();
        //const receipt = await web3.eth.sendTransaction('0x' + tx.toString('hex'));
        const receipt = await web3.eth.sendTransaction(rawTransaction);
        console.log("Receipt info: ", receipt);

        // let pizzaCoinInst = await PizzaCoinContract.deployed();
        // const fromBal = Number(await pizzaCoinInst.balanceOf(fromAcct));
        // console.log('From balance after transfer: ', fromBal);
        // const toBal = Number(await pizzaCoinInst.balanceOf(toAcct));
        // console.log('To balance after transfer: ', toBal);
        return Promise.resolve(receipt);
    } catch (e) {
        console.log('error --- ', e);
        return Promise.reject(e);
    }
}