/*******************************************************************************
*                     assetlib
* This is a library of routines to manipulate asset trees consisting of
* hashlinked assets of the class Asset.
*
* version 0.0.1
*
********************************************************************************/

'use strict';
var Asset = require("./asset.js");

/**
traverse the hash tree from 'asset' downwards.  If 'asset' is the root asset
this function will iterate over the whole tree. Each time an asset is found, it
is passed into the callback for something to be done with it.

'retriever' is a function that returns an asset when presented by its hash.
It will normally get the asset from a data store of some kind, or possibly a
pre-loaded array to speed things up.  'retriever''s signature is

retriever(hash, callback, ...args)

where the callback is called when an asset is retrieved from the store,
passing in the asset and the ...args.
@param {Object} asset - the asset object to start traversing downwards from.
Ususally this is the root asset
@param {Function} retriever - a function that can look up the asset from a hash
(see assetlib.js for more information)
@param {Function} callback - this function is called each time an asset is
reached
**/
function traverseTree(err, asset, retriever, callback) {
  callback(asset);
  var hashes = asset.getChildHashes();
  for (var i=0; i<hashes.length; i++) {
    retriever(hashes[i],traverseTree, retriever, callback);
  }
}

/**
Similar to TraverseTree but, rather than returning an Asset as soon as it's
found, getAssetTree returns a list-like object via its callback.
The keys (properties) are  each the hash of an Asset and the values are
the assets themselves.  It contains all the assets in the tree.
@param {Object} asset - the asset object to start traversing downwards from.
Ususally this is the root asset
@param {Function} retriever - a function that can look up the asset from a hash
(see assetlib.js for more information)
@param {Function} callback - this function is called when all the assets are
found. It returns an object whose properties are the Assets in the tree, indexed
by their hash.
**/
function getAssetTree(asset, retriever, callback){
  var e=1;
  var assets = {}; //this will hold an array of assets
  var swarmErr = null;
  traverse(swarmErr, asset, retriever, callback);
  function traverse(swarmErr, asset, retriever, callback) {
    console.log("traverse", swarmErr, asset)
    if (swarmErr) callback(swarmErr, assets);
    assets[asset.getHash()] = asset;
    var hashes = asset.getChildHashes();
    for (var i=0; i<hashes.length; i++) {
      e++; //increment each time we request to retrieve an asset asyncronously
      retriever(hashes[i],traverse, retriever, callback);
    }
    e--; //decrement every time we actually receive an asset
    if (e==0) callback(swarmErr,assets); //callback when all Assets are received
  }
}

/**
returns the immediate parent of a child asset. Note that it can only do this by
searching the entire tree until it finds the parent.  This is why it needs to
know the rootAsset (it must start from the treetop).  Therefore it is rather
expensive to call. Once found, the parent is passed to the callback.
@param {Object} rootAsset - the asset corresponding to the root hash of the tree
@param {Object} child - the asset that you require the parent of
@param {Function} retreiver - function to return an asset, given its hash
@param {Function} callback - callback to return the parent asset.
**/
function getParent(rootAsset, child, retriever, callback) {
  //start at the top and iterate until you find an asset that holds a hash of the child
  traverseTree(rootAsset, retriever, function(asset){
    if (asset.getChildHashes().includes(child.getHash())) callback(asset);
  });
}

/**
Returns the children of an asset, the callback is called once for each child
@param {Object} asset - the parent asset that you want the children of
@param {Function} retreiver - function to return an asset, given its hash
@param {Function} callback - callback, called once with each child asset
**/
function getChildren(asset, retriever, callback) {
  var hashes = asset.getChildHashes();
  for (var i=0;i<hashes.length;i++){
    retriever(hashes[i], callback);
  }
}

/**
This function will replace an existing asset ('oldAsset') with a new one
('newAsset').  Note that this requires the hashes of the parents to be
recalculated, which is done by the routine.  That in turn requires finding
every parent from the changed asset up to and including the root hash.  Each
call therefore requires multiple parent searches so this function is very
expensive to call.
The callback is called for each new parent and the new parent passed in.
Normally, these should be stored in the data store and a new root hash issued.
The root hash is distinguished by a Boolean, which is also passed to the
calback.
This function can also append a new asset by passing in a new version of the
parent with the new child asset hash added but this is more easily done with
'appendAsset'.
@param {Object} rootAsset - the asset corresponding to the root hash of the tree
@param {Object} oldAsset - the asset that you wish to replaced
@param {Object} newAsset - the asset that you wish to replace oldAsset with
@param {Function} retreiver - function to return an asset, given its hash
@param {Function} callback - returns each of the recalculated parents up to and
including the root asset
**/
function changeAsset(rootAsset, oldAsset, newAsset, retriever, callback){
  var isRoot = false;
  if (oldAsset.getHash() == rootAsset.getHash()) {isRoot = true} //the new asset is the new root
  callback(newAsset, isRoot); //do something with the new elements, probably store them
  getParent(rootAsset, oldAsset, retriever, function(parent){
    var a = [...parent.getChildHashes()]; //be sure to create a new array, not a pointer back to the old parent
    var i = a.indexOf(oldAsset.getHash());
    a[i] = newAsset.getHash(); //change the hash to that of the new child
    var newParent = new Asset(a,{...parent.getData()});
    changeAsset(rootAsset, parent, newParent, retriever, callback);
  });
}

/**
Convenience function to append a new asset.  It is similar to 'changeAsset' but
the callback also receives the new leaf asset as well as its parents up to the
root.
@param {Object} rootAsset - the asset corresponding to the root hash of the tree
@param {Object} attachTo - the asset that you wish to attach the new leaf or
branch to
@param {Object} newAsset - the asset that you wish to attach.  Note that this
could be the root of a whole new branch
@param {Function} retreiver - function to return an asset, given its hash
@param {Function} callback - returns each of the recalculated parents up to and
including the root (also returns the new leaf)
**/
function appendAsset(rootAsset, attachTo, newAsset, retriever, callback) {
  callback(newAsset,false); //we need to include in the callback the new asset we're appending, not just its parents
  var parent = attachTo.addChildHash(newAsset.getHash());
  changeAsset(rootAsset, attachTo, parent, retriever, callback);
}

/**
creates an asset tree from a json description
@param {Object} description - a human-readable json description of the asset
tree (that has been parsed into an object).  See wheelbarrow.json as an examples
@param {Function} callback - called to return each asset in the tree one by one
it also indicates which is the root asset.
**/

function createAssetTree(description, callback) {
  var results = traverseTreeBreadthFirst(description);
  convertToAssets(results, callback);
  function traverseTreeBreadthFirst(description) { //order child-first
    var results = [];
    var queue=["root"];
    var n;
    while(queue.length>0) {
      n = queue.shift();
      results.push(n) //put the child onto the results stack
      var children = description[n][1];
      if (!children) {
        continue;
      }
      for (var i = 0; i< children.length; i++) {
         queue.push(children[i]);
      }
    }
    return results;
  }
  function convertToAssets(results, callback) {
    var assets = {};
    while(results.length>0) {
      var n = results.pop();
      var children = description[n][1];
      var data = description[n][0];
      var childHashes = [];
      for (var j=0; j<children.length ;j++){ //set off storing all the children
        childHashes.push(assets[children[j]].getHash());
      }
      assets[n] = new Asset(childHashes,data); //now we have all the children we can create the parent
      console.log(n);
      callback(assets[n], n=="root");
    }
  }
}

module.exports.traverseTree = traverseTree;
module.exports.getParent = getParent;
module.exports.changeAsset = changeAsset;
module.exports.getChildren = getChildren;
module.exports.appendAsset = appendAsset;
module.exports.createAssetTree = createAssetTree;
module.exports.getAssetTree = getAssetTree;
