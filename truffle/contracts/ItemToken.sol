pragma solidity >=0.4.21 <0.6.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract ItemToken is ERC721 {

    //enum = {CHEESE, };

    struct Item{
        uint itemType;
        string uom;
        uint qty;
        uint price;
    }

    mapping(uint => Item) public itemMetadata; 

    function mint(uint _tokenId) public {
        _mint(msg.sender, _tokenId);
    }

    function mintWithItemData(uint _tokenId, uint _itemType, string memory _uom, uint _qty, uint _price) public {
        _mint(msg.sender, _tokenId);
        itemMetadata[_tokenId] = Item({
          itemType: _itemType,
          uom: _uom,
          qty: _qty,
          price: _price
         });
    }

    function getMetadata(uint _tokenId) public view returns(uint, uint , string memory, uint){
        return(itemMetadata[_tokenId].itemType, itemMetadata[_tokenId].qty, itemMetadata[_tokenId].uom, itemMetadata[_tokenId].price);
    }
}