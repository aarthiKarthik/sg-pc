/******************************************************************************
*                         swarm-hash.js
* Function to calculate the swarmhash of an object.  Swarm is content-addressed
* and the swarmhash will be the Swarm address of the object.
******************************************************************************/

const Keccak = require('keccakjs')

// NOTE: it only supports 48 bit lengths
function swarmHashBlock (data, totalLength) {
  var hash = new Keccak(256)
  var tmp = Buffer.alloc(8)
  tmp.writeUIntLE(totalLength, 0, 6)
  hash.update(tmp)
  hash.update(data)
  return new Buffer(hash.digest(), 'binary')
}

/**
Function to calculate the swarmhash of an object (represented by binary data)
@param data {Buffer} - a buffer containing binary data representing the object
to be stored e.g. new Buffer('my data').
@returns {Buffer} - a binary buffer containg the calculated swarm hash. normally
one would call the toString() method of the returned Buffer to provide a more
convenient form for the hash.
**/
function swarmHash (data) {
  const length = data.length

  if (length <= 4096) {
    return swarmHashBlock(data, length)
  }

  var maxSize = 4096
  while ((maxSize * (4096 / 32)) < length) {
    maxSize *= (4096 / 32)
  }

  var innerNodes = []
  for (var i = 0; i < length; i += maxSize) {
    const size = (maxSize < (length - i)) ? maxSize : (length - i)
    innerNodes.push(swarmHash(data.slice(i, i + size)))
  }
  return swarmHashBlock(Buffer.concat(innerNodes), length)
}

module.exports = swarmHash
