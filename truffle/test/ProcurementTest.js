var Procurement = artifacts.require("./Procurement.sol");
const assert = require('assert');
const constant = require('../../pizzaChain-api/constants/constant');
const pizzaChainConstants = require('../../pizzaChain-api/constants/pizzaChainConstants');

let contractInstance;

contract('Procurement', (accounts) => {

  beforeEach(async () => {
    contractInstance = await Procurement.deployed();

  })

  it('Issue PO', async () => {
    const tx = await contractInstance.issuePO(1, "C01", pizzaChainConstants.itemTypes.CHEESE, 10, "kg", constant.PO_STATUS.ISSUED);
    const res = await contractInstance.getPOById(1);
    assert.equal(res[0], "C01");
    assert.equal(res[1], pizzaChainConstants.itemTypes.CHEESE);
    assert.equal(res[2].toNumber(), 10);
    assert.equal(res[3], "kg");
    assert.equal(res[4], constant.PO_STATUS.ISSUED);

    const { logs } = tx;
    assert.ok(Array.isArray(logs));
    assert.equal(logs.length, 1);

    const log = logs[0]; 
    assert.equal(log.event, 'LogIssuedPO');
    assert.equal(log.args._poId.toString(), '1');
    assert.equal(log.args._supplierId.toString(), 'C01');
    assert.equal(log.args._itemType.toString(), '1');
    assert.equal(log.args._qty.toString(), '10');
    assert.equal(log.args._uom.toString(), 'kg');
    assert.equal(log.args._status.toString(), constant.PO_STATUS.ISSUED);
  });

  it('Issue Invoice', async () => {
    const tx = await contractInstance.issueInvoice(1, 1, "C01", pizzaChainConstants.itemTypes.CHEESE, 10, "kg", 20.00, constant.INVOICE_STATUS.ISSUED);
    const res = await contractInstance.getInvoiceById(1);
    assert.equal(res[0], 1);
    assert.equal(res[1], "C01");
    assert.equal(res[2], pizzaChainConstants.itemTypes.CHEESE);
    assert.equal(res[3].toNumber(), 10);
    assert.equal(res[4], "kg");
    assert.equal(res[5].toNumber(), 20.00);

    const { logs } = tx;
    assert.ok(Array.isArray(logs));
    assert.equal(logs.length, 1); 

    const log = logs[0]; 
    assert.equal(log.event, 'LogIssuedInvoice');
    assert.equal(log.args._invoiceId.toString(), '1');
    assert.equal(log.args._poId.toString(), '1');
    assert.equal(log.args._supplierId.toString(), 'C01');
    assert.equal(log.args._itemType.toString(), '1');
    assert.equal(log.args._qty.toString(), '10');
    assert.equal(log.args._uom.toString(), 'kg');
    assert.equal(log.args._status.toString(), constant.INVOICE_STATUS.ISSUED);
  });

  it('Update PO status', async () => {
    let tx = await contractInstance.updatePOStatus(1, constant.PO_STATUS.ACKNOWLEDGED);
    const res = await contractInstance.getPOById(1);
    assert.equal(res[4], constant.PO_STATUS.ACKNOWLEDGED);

    const { logs } = tx;
    assert.ok(Array.isArray(logs));
    assert.equal(logs.length, 1); 

    const log = logs[0]; 
    assert.equal(log.event, 'LogUpdatePOStatus');
    assert.equal(log.args._poId.toString(), '1');
    assert.equal(log.args._status.toString(), constant.PO_STATUS.ACKNOWLEDGED);
  });

  it('Update Invoice status', async () => {
    let tx = await contractInstance.updateInvoiceStatus(1, constant.INVOICE_STATUS.COMPLETED);
    const res = await contractInstance.getInvoiceById(1);
    assert.equal(res[6], constant.INVOICE_STATUS.COMPLETED);

    const { logs } = tx;
    assert.ok(Array.isArray(logs));
    assert.equal(logs.length, 1); 

    const log = logs[0]; 
    assert.equal(log.event, 'LogUpdateInvoiceStatus');
    assert.equal(log.args._invoiceId.toString(), '1');
    assert.equal(log.args._status.toString(), constant.INVOICE_STATUS.COMPLETED);
  });

  it('Get PO List', async () => {
    var poIdList = await contractInstance.getPOList();
    assert.equal(poIdList[0], 1);
  });

  it('Get Invoice List', async () => {
    var invoiceIdList = await contractInstance.getInvoiceList();
    assert.equal(invoiceIdList[0], 1);
  });

})