
/*******************************************************************************
*                             controller.js
*  Backend for the restAPI.  This contains functions that the restAPI can call
* to manipulate Assets.  It makes use of assetlib.js.  This module does not
* interact with the blockchain - those functions are in TBD
*
* version 0.0.1
*******************************************************************************/

'use strict';
const jsonfile = require("jsonfile");

function createFromJson(storer, description, callback) {
  //treetools.createAssetTree(description, function(asset, isRoot){
    //console.log(isRoot,asset);
    var isRoot;
    var asset = JSON.stringify(description);
    storer(asset, function(responseHash){
      //console.log(isRoot);
      console.log("Response Hash is "+responseHash);
      // if (isRoot) {
      console.log("createFromJson = asset string =" + asset);
        callback(JSON.stringify({rootHash: responseHash}));
      // }
    },isRoot);
}

function generateSwarmHash(asset, callback) {
  console.log("Asset JSON is: "+JSON.stringify(asset));
  var hashValue = swarmhash(new Buffer(JSON.stringify(asset))).toString('hex');
  console.log("swarm hash: " + hashValue);
  callback(hashValue);
}

/**
Get an asset tree from the root hash.  This function returns an asset tree from
a root hash.  The assets are returned as property values in an object, the hashes
are the keys.
@param {string} rootHash - the root hash of the asset tree that is required
@param {Function} callback - callback funtion that returns a list-like object,
which has properties with values that are the assets in the tree and keys
which are their corresponding hashes.
**/
function getFromHash(retriever, rootHash, callback) {
  console.log("getFromHash");
  retriever(rootHash, function(err, rootAsset){//get the root Asset from the hash
    if (err) {
      console.log('getFromHash',err);
      callback(err, null);
    } else {
      //treetools.getAssetTree(rootAsset, retriever, callback);
      console.log(rootAsset);
    }
  });
}

/**
@deprecated Since Swarm versions are now available this function is deprecated.
This function retrieves an asset from a datasource, looked up by hash and
passes it to the callback, along with any other args that the callback needs
in ...args (the args are used by the recursive tree-traversing functions
herein).  It can be replaced by another retriever function by repointing the
retriever constant above. This function works with leveldb and so should only
be used in certain development situations
@param {string} hash - the hash of the asset to be retrieved
@param {Function} callback - a callback that returns the asset and also any
arguments passed in from ...args
@param {Object} ...args - a list of arguments that are passed directly to the
callback (these are needed for some recursive functions that use this function.
They are not required for a simple retrieve of a asset and can be ommitted in
that case)
**/
function defaultRetriever(hash, callback, ...args) {
  db.get(hash, function(err, assetJson) {
    if (err) {console.log(err);}
    else {
      var a = JSON.parse(assetJson).asset[0];
      var d = JSON.parse(assetJson).asset[1];
      var err=null; //TODO handle error
      callback(err, new Asset(a,d),...args);
    }
  });
}

/**
@deprecated Since Swarm versions are now available this function is deprecated.
This function stores an asset in a datasource.  When storage is complete
it fires off a callback, passing in the args ...args.  This is useful so
you know it's safe to read the data  It can be replaced by another storer
function by repointing the storer constant above.This function works with
leveldb and so should only be used in certain development situations
@param {string} asset - the asset to be stored
@param {Function} callback - a callback that returns when the asset is stored
with any arguments passed in from ...args
@param {Object} ...args - a list of arguments that are passed directly to the
callback (these are needed for some recursive functions that use this function.
They are not required for a simple storage of a asset and can be ommitted in
that case)
**/
function defaultStorer(asset, callback, ...args) {
  console.log("using levledb");
  db.put(asset.getHash(), JSON.stringify(asset), function (err, value) {
    if (err) {return console.log('Ooops!', err)} // some kind of I/O error
    else {callback(...args);}
  });
}
//export the functions so they can be used.
module.exports.createFromJson = createFromJson;
module.exports.getFromHash = getFromHash;
module.exports.getAssetsFromBlockchain = getAssetsFromBlockchain;
module.exports.defaultStorer = defaultStorer;
module.exports.defaultRetriever = defaultRetriever;
//-----examples of functions-----
//treetools.traverseTree(assets["root"],retriever, console.log);
//treetools.getParent(assets["root"], assets["wheel_assembly"], retriever, console.log);
//var newAsset = new Asset(assets["frame"].getChildHashes(), {"newspec": "new specification"})
//treetools.changeAsset(assets["root"], assets["frame"], newAsset, retriever, console.log);
//treetools.getChildren(assets["wheelbarrow"], retriever, console.log);
/*
treetools.appendAsset(assets["root"], assets["wheelbarrow"], newAsset, retriever, function(asset, isRoot){
  //console.log(asset.toString());
  storer(asset, function(a,b,c) { //store the updated branch
    if (isRoot) treetools.traverseTree(a,b,c); //print out the new tree
    }, asset,retriever, console.log
  );
});*/
