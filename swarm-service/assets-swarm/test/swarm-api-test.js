'use strict';
const request = require('request');
const fs = require('fs');
const assert = require('assert');

describe("Swarm REST API Tests", function(){
  //const wbwHash = "268a227b375888cf0807b8be7f9bcd89539ee51c5f11048090bcb83b9c7b3b55";
  const wbwHash = "9bfd3913ccd698f19dc352ca0136e0030f1d42151ef67e4bd520e6c6ab35bb50";
  const wbwJson = fs.readFileSync("test/wheelbarrow.json");
  const wbwAssets = JSON.parse(fs.readFileSync("test/wheelbarrowAssets.json"));

  describe("Post test", function(){
    it("Should return the hash of the wheelbarrow asset", function(done){
      request({
          url: 'http://localhost:8500/bzzr:/',
          method: "POST",
          body: new Buffer(JSON.stringify(wbwAssets)),
          encoding: null
        },
        function(err, response, body){
          assert.equal(wbwHash, body.toString());
          done();
        });
    });
  });
  describe("Get test", function(){
    it("Should return the entire wheelbarrow asset", function(done){
      request(
        'http://localhost:8500/bzzr:/'+wbwHash+'/',
        function(err, response, body){
            var jsonAssets = JSON.parse(body.toString());
            assert.deepEqual(wbwAssets, jsonAssets);
            done();
        });
    });
  });
});
