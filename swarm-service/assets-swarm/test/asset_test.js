/*******************************************************************************
*                       asset_test.js
* This is a Mocha test for the Asset class.  You can run it by doing:
*         $npm test
*
*******************************************************************************/

'use strict';
var assert = require('assert');
var Asset = require('../src/asset');
const swarmhash = require('../src/swarm-hash.js');

describe("Asset class test", function(){
  const a = [1,2];
  const d = {"data1":5,"data2":6};
  const testAsset = new Asset(a,d);
  const testStr = '[[1,2],{"data1":5,"data2":6}]';
  const testAsset3 = new Asset([],d);
  const hash = swarmhash(new Buffer(testStr)).toString('hex');


  describe("toString method", function(){
    it('should return the string ' + testStr, function(){
      assert.equal(testStr,testAsset.toString());
    });
  });
  describe("hash method", function(){
    it("should return the swarmhash of the string " + testStr, function(){
      assert.equal(hash, testAsset.getHash());
    });
  });
  describe("add child hash method", function(){
    it("should add a new child asset hash to the existing test asset", function(){
      const testAsset2 = testAsset.addChildHash(3);
      assert.deepEqual(new Asset([1,2,3],d),testAsset2);
    });
  });
  describe("add data method", function(){
    it("should add a new key value pair to the existing test asset", function(){
      const key = "moreData", value = 42;
      var testData = {};
      testData[key] = value;
      const testAsset2 = testAsset.addData(key,value);
      assert.deepEqual(new Asset(a,{...d,...testData}), testAsset2);
    });
  });
  describe("create an asset which is a leaf", function(){
    var teststr3 = '[[],{"data1":5,"data2":6}]';
    it('should create an object that looks like ' + teststr3, function(){
      assert.equal(teststr3,testAsset3.toString());
    });
  });
  describe("add an asset hash to the leaf", function(){
    it("should add an asset hash, creating a new asset object", function(){
      assert.deepEqual(new Asset([hash],d), testAsset3.addChildHash(testAsset.getHash()));
    })
  })
});

//console.log(testAsset);
//console.log(testAsset.getHash());

//console.log(testAsset.toString());
//console.log(testAsset.addSubAsset(new Asset(a,d)).toString());
//console.log(testAsset.addData("addedData",7).toString());
