const chai = require('chai');
const { BN, constants, expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const { expect, assert } = chai

const ItemToken = artifacts.require('ItemToken.sol');

contract('ItemToken', function (accounts) {
  var adminAccount;
  var pizzaCoAccount;
  var cheeseCoAccount;

  before(async function () {
    adminAccount = accounts[0];
    pizzaCoAccount = accounts[1];
    cheeseCoAccount = accounts[2];
  });

  const tokenId = "1";

  beforeEach(async function () {
    coinbase = (await web3.eth.getAccounts())[adminAccount];
    this.token = await ItemToken.deployed();
  });

  describe('mint token', function () {
    it('owner should be admin', async function () {
      await this.token.mint(tokenId, {from: adminAccount});
      expect(await this.token.ownerOf(tokenId)).to.equal(adminAccount)
    });
  });

  describe('transfer token to supplier', function () {
    it('owner should be cheeseco', async function () {
      await this.token.transferFrom(adminAccount, cheeseCoAccount, tokenId);
      expect(await this.token.ownerOf(tokenId)).to.equal(cheeseCoAccount)
    });
  });

  describe('balanceOf', function () {
    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        (await this.token.balanceOf(adminAccount)).should.be.bignumber.equal('0');
      });
    });

    describe('when the requested account has some tokens', function () {
      it('returns the total amount of tokens', async function () {
        (await this.token.balanceOf(cheeseCoAccount)).should.be.bignumber.equal('1');
      });
    });
  });

});

