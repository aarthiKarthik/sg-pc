import React, { Component } from 'react'
import QrReader from 'react-qr-reader'
import axios from 'axios';
import config from '../../config/ui-config';
import '../App.css'; 
const pizzaChainConstants = require('../../../../pizzaChain-api/constants/pizzaChainConstants');

const configProperties = config.getProps();
let retrieveTokenURL = `${configProperties.pizzaChain.host}:${configProperties.pizzaChain.port}/${configProperties.pizzaChain.tokenEndpoint}`;
const pizzaCoAccountId = pizzaChainConstants.accounts.PIZZACO;

class QrScan extends Component {
  state = {
    error: null,
    isLoaded: false,
    token: {}
  }
  
  handleScan = data => {
    if (data) {

     data = JSON.parse(data);
     var supplierId = data.supplierId;
     var tokenId = data.tokenId;

     //get account id by supplier id
     var supplierAccountId = pizzaChainConstants.accounts[supplierId];

     let url = retrieveTokenURL + "/" + tokenId + "/" + supplierAccountId + "/" + pizzaCoAccountId;
      
      axios.post(url).then(
        result => {
          this.setState({
            isLoaded: true,
            token: result.data.data
          });
        },

        error => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      );
    }
  }
  handleError = err => {
    console.error(err)
  }
  render() {
    const token = this.state.token;

    return (
      <div className="App">
        <QrReader
          delay={300}
          onError={this.handleError}
          onScan={this.handleScan}
          style={{ width: '30%', height: '20%' }}
        />

        <p>Invoice ID: {token.invoiceId}</p>
        <p>Supplier ID: {token.supplierId}</p>
        <p>Item ID: {token.itemId}</p>
        <p>Item Type : {token.itemType}</p>
        <p>Qty: {token.qty} {token.uom}</p>
        <p>Price: {token.price}</p>
      </div>
    )

    
  }
}

export default QrScan;