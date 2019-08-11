pragma solidity >=0.4.21 <0.6.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/utils/Address.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

/** Standard ERC20 tokens used for payments.

 */

contract PizzaCoin is ERC20Detailed, ERC20{

  constructor (string memory name, string memory symbol, uint8 decimals, uint256 amount, address account)
    ERC20Detailed(name, symbol, decimals) public {
      _mint(account, amount);
    }
}