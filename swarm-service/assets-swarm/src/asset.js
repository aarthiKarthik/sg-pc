
/*******************************************************************************
*                   asset.js
*
* This file contains an Asset class, which is the way an asset is represented
* by OpsChain.  It consists of a list of hashes of its immediate children and
* an dictionary (object) of metadata key value pairs, both held in an
* asset property of an asset object  e.g.
*
*     myAsset.asset = [[1,2],{"data1":5,"data2":6}]
*
* The methods below are hopefully self-explanatory.
*
* version 0.0.1
*******************************************************************************/

'use strict';
const swarmhash = require('./swarm-hash.js');

/**
Class representing a single Asset (which would normally be combined with other
Assets in a hash-linked tree)
@class Asset
**/
class Asset{
  /**
  constructor for the asset class.
  @param {Array} a - array of hashes of any child assets
  @param {Object} d - list-like object, the properties of which are any data
  that is associated with the array
  The constructor adds a 16 byte nonce to the data - this ensures that each
  instance of an otherwise identical asset hashes to a difference value with
  high probability
  **/
  constructor(a,d){
    this.asset = [a,{...d}];
    //calculate the hash here and store the result - saves recalculating later
    this.hash = swarmhash(new Buffer(JSON.stringify(this.asset))).toString('hex');
  }
  /**
  returns the hash of the asset
  **/
  getHash(){
    return this.hash;
  }
  /**
  returns a string representation of the asset
  **/
  toString(){
    return JSON.stringify(this.asset);
  }
  /**
  adds a hash to the asset, representing one of its child assets
  @param {string} childHash - the hash of a child of the asset that needs adding
  **/
  addChildHash(childHash){
    var [a,d] = this.asset;
    return new Asset([...a, childHash],d);
  }
  /**
  adds a data property to the asset
  @param {string} key - the name of the data item
  @param {string} value - the value of the data item
  **/
  addData(key,value){
    var [a,d] = this.asset;
    var s = {};
    s[key] = value;
    return new Asset(a,{...d,...s});
  }
  /**
  returns and array containing child hashes read from the asset
  **/
  getChildHashes() {
    return this.asset[0];
  }
  /**
  returns a list-like object containing the data items of the asset
  **/
  getData() {
    return this.asset[1];
  }
}
module.exports = Asset;
