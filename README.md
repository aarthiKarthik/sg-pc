# Pizza Chain Demo
A Demo to introduce the concepts behind Blockchain.

## Dependencies
Install these prerequisites
```
    1. Node version 11.15.0 
    2. Truffle version 5.0.18
    3. Ganache-cli
    4. MongoDB
    5. Swarm - Version: 0.3.10-stable
    6. Go Version: go1.11.5
    7. Geth Version: 1.8.22-stable
```

## Installation
```
    1. Clone the project 
        git clone https://github.com/EYBlockchain/sg-pizzachain.git
    2. Install dependencies     
        cd pizzaChain-api
        npm install
        cd ../truffle
        npm install
    3. Start Ganache-cli separately
        ganache-cli
    4. Compile and deploy smart contract
        truffle migrate --reset --network development
    5. Run front end
        npm start
```

## MetaMask
```
    1. Select Custom RPC and enter 127.0.0.1 and port 8545
    2. Import the selected accounts/ Import the wallet using 12-word Mnemonic
    3. Under each account, Add Token and enter the smart contract addresses for PizzaCoin.sol and ItemToken.sol. Add these tokens to view their balance status.
