/******************************************************************************
*                          swarm.js
* Contains functions which facilitate the storing and retrieving of Assets to or
* from the Ethereum Swarm distributed storage.
*
* version 0.0.1
******************************************************************************/
'use strict';
var request = require('request');
var Asset = require('./asset.js');

/**
function that abstracts writing to the Swarm storage
@param asset {Object} - an Asset object created by the new Asset(a,d)
constructor, which is to be stored
@param callback {Function} - called when storage is complete, with the arguments
...args
@param ...args {Object} - a list of arguments that will be passed to callback.
The can be ommitted if no arguments need to be passed but are useful for
recursive work.
**/
function swarmStorer(asset, callback, ...args) {
  console.log("using Swarm");
  //console.log(asset.toString());
  request({
      url: 'http://localhost:8500/bzz-raw:/',
      method: "POST",
      body: Buffer.from(asset.toString()), //asset.toString()
      encoding: null
    },
    function(err, response, body){
      if (err) {return console.log('swarmStorer error: ', err)}
      else {
        // if (body.toString() != asset.getHash()) {
        //   throw "Calculated and actual swarmhashes are different";
        // }
        console.log(body.toString());
        console.log("swarmStorer assest = " + asset);
        callback(body.toString());}
    }
  );
}

/**
function that abstracts reading from the Swarm storage
@param asset {string} - the swarmhash of the object to be retrieved
@param callback {Function} - called when retrieving is complete. It returns a
new Asset created from the stored Json representation, followed by the arguments
...args
@param ...args {Object} - a list of arguments that will be passed to callback.
The can be ommitted if no arguments need to be passed but are useful for
recursive work.
**/
function swarmRetriever(hash, callback, ...args) {
  var swarmErr = null;
  console.log("Hash:", hash);
  request(
    'http://localhost:8500/bzz-raw:/'+hash+'/',
    function(err, response, body){
      if (err) {
        console.log('swarmRetriever error: ', err);
      } else {
        console.log('body '+body);
        // try{
        //   var jsonAsset = JSON.parse(body);
        //   var a = jsonAsset[0];
        //   var d = jsonAsset[1];
        //   console.log("jsonAsset",jsonAsset);
        // }
        // catch(e){
        //   console.log("Threw", e.message)
        //   swarmErr = new Error("Swarm error: most probably the asset you are looking for does not exist")
        // }
        // console.log("swarmErr",swarmErr)
       // callback("rootAsset",body);
        callback(swarmErr, body,...args);
      }
    }
  );
}
module.exports.storer = swarmStorer;
module.exports.retriever = swarmRetriever;
