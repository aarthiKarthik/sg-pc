import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import QrScan from './containers/QrScan';
import QrGeneration from './containers/QrGeneration';

class App extends Component {
  
  render() {
    return (
      <Router >
        <div >
          <Route exact path="/qrScan" component={QrScan} />
          <Route exact path="/qrGeneration" component={QrGeneration} /> 
        </div>
      </Router>
    );
  }
}

export default App;