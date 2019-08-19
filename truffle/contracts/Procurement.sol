pragma solidity ^0.5.0;

contract Procurement{

    struct PO{
        string supplierId;
        uint itemType;
        uint qty;
        string uom;
        string status;
    }

    struct Invoice{
        uint poId;
        string supplierId;
        uint itemType;
        uint qty;
        string uom;
        uint price;
        string status;
    }
    
    mapping(uint => PO) public pos;
    mapping(uint => Invoice) public invoices;

    uint[] poArray;
    uint[] invoiceArray;

    event LogIssuedPO(uint _poId, string _supplierId, uint _itemType, uint _qty, string _uom, string _status);
    event LogIssuedInvoice(uint _invoiceId, uint _poId, string _supplierId, uint _itemType, uint _qty, string _uom, uint _price, string _status);
    event LogUpdatePOStatus(uint _poId, string _status);
    event LogUpdateInvoiceStatus(uint _invoiceId, string _status);

    function issuePO(uint _poId, string memory _supplierId, uint _itemType, uint _qty, string memory _uom, string memory _status) 
    public {
         pos[_poId] = PO({
           supplierId: _supplierId,
           itemType: _itemType,
           qty: _qty,
	       uom: _uom,           
           status: _status
        });
         poArray.push(_poId);
         emit LogIssuedPO(_poId, _supplierId,  _itemType, _qty, _uom, _status);
    }

    function issueInvoice(uint _invoiceId, uint _poId, string memory _supplierId, uint _itemType, uint _qty, string memory _uom, uint _price, string memory _status) 
    public {
         invoices[_invoiceId] = Invoice({
           poId: _poId,
           supplierId: _supplierId,
           itemType: _itemType,
           qty: _qty,
	       uom: _uom,   
           price: _price,        
           status: _status
        });
        invoiceArray.push(_invoiceId);
        emit LogIssuedInvoice(_invoiceId, _poId, _supplierId,  _itemType, _qty, _uom, _price, _status);

    }

    function updatePOStatus(uint _poId, string memory _status) public {
        PO storage po = pos[_poId];
        po.status = _status;
        emit LogUpdatePOStatus(_poId, _status);
    }

    function updateInvoiceStatus(uint _invoiceId, string memory _status) public{
        Invoice storage invoice = invoices[_invoiceId];
        invoice.status = _status;
        emit LogUpdateInvoiceStatus(_invoiceId, _status);
    }

    function getPOById(uint _poId) public view returns(string memory, uint, uint, string memory, string memory) {
        return(pos[_poId].supplierId, pos[_poId].itemType, pos[_poId].qty, pos[_poId].uom, pos[_poId].status);
    }

    function getInvoiceById(uint _invoiceId) public view returns(uint, string memory, uint, uint, string memory, uint, string memory) {
        return(invoices[_invoiceId].poId, invoices[_invoiceId].supplierId, invoices[_invoiceId].itemType, invoices[_invoiceId].qty, invoices[_invoiceId].uom, invoices[_invoiceId].price, invoices[_invoiceId].status);
    }

    function getPOList() public view returns(uint[] memory) {
        return poArray;
    }

    function countPOList() view public returns (uint) {
        return poArray.length;
    }

    function getInvoiceList() public view returns(uint[] memory) {
        return invoiceArray;
    }

    function countInvoiceList() view public returns (uint) {
        return invoiceArray.length;
    }
}
