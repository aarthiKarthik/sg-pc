const { BN, constants, expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const PC = artifacts.require('PizzaCoin.sol');

contract('PC', function (accounts) {
  var adminAccount;
  var pizzaCoAccount;
  var cheeseCoAccount;

  const initialSupply = new BN(100);

  before(async function () {
    adminAccount = accounts[0];
    pizzaCoAccount = accounts[1];
    cheeseCoAccount = accounts[2];
  });

  beforeEach(async function () {
    this.token = await PC.new("PizzaCoin", "PCT", 0, initialSupply, adminAccount);
  });

  describe('total supply', function () {
    it('returns the total amount of tokens', async function () {
      (await this.token.totalSupply()).should.be.bignumber.equal(initialSupply);
    });
  });

  describe('balanceOf', function () {
    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        (await this.token.balanceOf(pizzaCoAccount)).should.be.bignumber.equal('0');
      });
    });

    describe('when the requested account has some tokens', function () {
      it('returns the total amount of tokens', async function () {
        (await this.token.balanceOf(adminAccount)).should.be.bignumber.equal(initialSupply);
      });
    });
  });

  describe('when the sender has enough balance', function () {
    const amount = initialSupply;

    it('transfers the requested amount', async function () {
      const { logs } = await this.token.transfer(pizzaCoAccount, amount, { from: adminAccount });
        expectEvent.inLogs(logs, 'Transfer', {
          from: adminAccount,
          to: pizzaCoAccount,
          value: amount,
        });
      (await this.token.balanceOf(adminAccount)).should.be.bignumber.equal('0');

      (await this.token.balanceOf(pizzaCoAccount)).should.be.bignumber.equal(amount);

    });
  });


});

