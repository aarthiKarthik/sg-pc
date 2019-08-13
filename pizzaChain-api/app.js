'use strict'

const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const log = require('npmlog-ts');

const config = require('./config/api-config');
config.setEnv(process.env.NODE_ENV);
console.log("process.env.NODE_ENV = "+process.env.NODE_ENV);
const configProperties = config.getProps();

const api = require('./api-gateway/apiGatewayController');
const router = express.Router();

// <TODO> Move PORT config to api-config
const PORT = configProperties.port;

app.use(bodyParser.json());

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

var mongoDBURI = "mongodb://" + `${configProperties.mongodb.host}:${configProperties.mongodb.port}/${configProperties.mongodb.database}`;
console.log('mongodb:', mongoDBURI);

if (process.env.NODE_ENV === "prod") {
    // var mongoClient = require("mongodb").MongoClient;
    // mongoClient.connect("mongodb://pc-mongodb:LzzUKl9XSdhr55jWfGh8f9iBmWZvAxYiCxz4LrZdeT53QgYDj5JRqj5237lOjMolY9wErwpRxJd6bl6573HBeg%3D%3D@pc-mongodb.documents.azure.com:10255/?ssl=true", function (err, client) {
    //     client.close();
    // });
    mongoDBURI = decodeURIComponent(mongoDBURI);
    let user = decodeURIComponent(configProperties.mongodb.mongodb_user);
    let pass = decodeURIComponent(configProperties.mongodb.mongodb_password);
    console.log("User: " + user, "Password: " + pass);
    mongoose.connect(mongoDBURI+"?ssl=true&replicaSet=globaldb", { 
        auth: {
            user: user, 
            password: pass
        }
    })
    .then(() => console.log('Connection to CosmosDB successful'))
    .catch((err) => console.error(err));
}
else {
    mongoose.connect(mongoDBURI);
}

mongoose.Promise = global.Promise;

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected', () => {
    log.info('Mongoose default connection open to ' + mongoDBURI);
});

app.use(function(req, res, next) {
    //config = config.node1RPC;

    req.db = db;

    console.log('here >>>>')
    next();
});

api.init(router);
app.use("/", router);

//handle bad calls
app.use(function(req, res) {
    res.status(404).send({ url: req.originalUrl + ' not found' })
});

//handle unhandled promise rejects
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason)
})

app.listen(PORT, () => {
    console.log(`api services running on port: ${PORT}`);
});

module.exports = app;