const contract = require('truffle-contract');
const Web3 = require('web3');
const path = require('path');
const config = require('../config/api-config');
const pizzaChainConstants = require('../constants/pizzaChainConstants');

const itemTokenJSON = require(path.join(__dirname, '../../truffle/build/contracts/ItemToken.json'));

const configProperties = config.getProps();

//<TODO> move to api-config
const web3Provider = new Web3.providers.HttpProvider(`${configProperties.rpc.host}:${configProperties.rpc.port}`);
const web3 = new Web3(web3Provider);

var ItemTokenContract = contract(itemTokenJSON);
ItemTokenContract.setProvider(web3Provider);

let itemTokenInstance;
let coinbase;

(async () => {
    coinbase = (await web3.eth.getAccounts())[pizzaChainConstants.accounts.ADMIN];

    ItemTokenContract.defaults({
        from: coinbase,
        gas: 999999,
        gasPrice: 0,
    });

    itemTokenInstance = await ItemTokenContract.deployed();
    console.log('Connected to Item Token contract.');

    //set approval
    await setApprovalForAll();
    console.log('Item Token contract Approval for all set.');

})().catch(err => {
    console.error('Failed to connect to Item Token contract.');
    console.error(err);
});

module.exports = {
    mintDataToBC: async (req) => {

        console.log('Mint Item Token.', req.invoiceId);
        var isSuccess = false;

        let itemType = pizzaChainConstants.itemTypes[req.itemType];

        let response = await itemTokenInstance.mintWithItemData(req.invoiceId, itemType, req.uom, req.qty, req.price);
        if (response.err) {
            console.log('Error in Mint Item Token to BC.' + err);
        }
        else {
            console.log('Fetched Mint Item Token to BC Response.');
            isSuccess = true;
        }
        return Promise.resolve(isSuccess);
    },
    mint: async (tokenId) => {

        console.log('Mint Item Token.', tokenId);
        var isSuccess = false;

        let response = await itemTokenInstance.mint(tokenId);
        if (response.err) {
            console.log('Error in Mint Item Token.' + err);
        }
        else {
            console.log('Fetched Mint Item Token Response.');
            isSuccess = true;
        }
        return Promise.resolve(isSuccess);
    },
    transferToken: async(merchantAcctId, userAccId, tokenId) =>{
        userAcc = (await web3.eth.getAccounts())[userAccId];
        merchantAcct = (await web3.eth.getAccounts())[merchantAcctId];

        console.log("coinbase = "+ coinbase);

        console.log("transfer from : merchantAcct = "+ merchantAcct + " - transfer to : userAcc = "+userAcc +" - tokenId = "+web3.utils.toHex(tokenId)); 
        let transferDetails = {
            transferStatus : false,
            receipt : null
        };
        try{
            //check owner of token id
            let tokenOwner = await itemTokenInstance.ownerOf(tokenId);
            console.log("tokenOwner = "+ tokenOwner);

            if(userAcc != tokenOwner){
                let response = await itemTokenInstance.transferFrom(merchantAcct, userAcc, tokenId, {from: merchantAcct});

                //check owner of token
                tokenOwner = await itemTokenInstance.ownerOf(tokenId);
                console.log("tokenOwner = "+ tokenOwner);

                if(userAcc == tokenOwner){
                    transferDetails.transferStatus = true;
                    transferDetails.receipt = response.receipt.transactionHash;
                }
            }

            return Promise.resolve(transferDetails);
        }catch(e){
            return Promise.reject(e);
        }
    },
    transfer: async (fromAccId, toAccId, tokenId) => {
        fromAddress = (await web3.eth.getAccounts())[fromAccId];
        toAddress = (await web3.eth.getAccounts())[toAccId];

        try{
            let response = await itemTokenInstance.transferFrom(fromAddress, toAddress, tokenId);
            return Promise.resolve(response);
        }catch(e){
            return Promise.reject(e);
        }
    },
    getBalance: async (accId) => {
        acc = (await web3.eth.getAccounts())[accId];
        try {
            //check balance
            let balance = Number(await itemTokenInstance.balanceOf(acc));
            return Promise.resolve(balance);
        }catch(e){
            return Promise.reject(e);
        }
    },
    getMetadata: async (tokenId) => {
        try{
            let response = await itemTokenInstance.getMetadata(tokenId);
            return Promise.resolve(response);
        }catch(e){
            return Promise.reject(e);
        }
    }
}

async function setApprovalForAll(){
    try{
        //set into a separate init file
        let approvedAccount = (await web3.eth.getAccounts())[pizzaChainConstants.accounts.CHEESECO];
        let response = itemTokenInstance.setApprovalForAll(approvedAccount, true);
        return Promise.resolve(response);
    }
    catch(e){
        return Promise.reject(e);
    }
}
