/****************************************************************************
*                      restapi.js
* This is the rest API for the Asset microservice, which provides storage and
* manipulation of assets
*
*****************************************************************************/

'use strict';
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var controller = require('./controller.js');
const config = require('../../config/api-config') // require the config file

const PORT = config.getProps().port // set the port

app.use(bodyParser.json()); //set up a filter to parse JSON
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if(req.method == "OPTIONS"){
    res.end();
  }else{
    next();
  }
});

/**
A post to /asset should contain a JSON description of an asset tree in a
human-readable form.  See wheelbarrow.json for an example of how to constructor
a get of /asset will (eventually) return a list of assets.  A get to /asset/hash
where 'hash' is a hex hash string will return the asset assocated with that
hash.
**/
app.route('/asset')
  //interface to input a JSON asset tree description
  //it returns the route hash of the new asset tree
  .post(function(req,res){
    //console.log(req.body);
    controller.createFromJson(storer, req.body, function(hash){
      //console.log("sending "+hash);
      res.send(hash)});
    })
  //returns a list of all assets owned by a given account (needs some thinking)
  // .get(function(req,res){
  //   controller.getAssetsFromBlockchain(function(assets){
  //     res.send(JSON.stringify(assets,null,2));
  //   });
  // });


app.route('/asset/:hash')
  //returns the asset tree given a root hash
  .get(function(req,res){
    console.log("API");
    controller.getFromHash(retriever,req.params.hash, function(err, assets){
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
      } else {
        res.send(JSON.stringify(assets,null,2));
      }
    });
  });

//handle bad calls
app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

app.listen(PORT,'0.0.0.0', function(){
  console.log("Assets-Swarm API server running on port " + PORT);
});
