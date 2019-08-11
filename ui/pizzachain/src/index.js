import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import config from '../config/ui-config';

config.setEnv(process.env.NODE_ENV);
console.log("process.env.NODE_ENV = "+process.env.NODE_ENV);

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
