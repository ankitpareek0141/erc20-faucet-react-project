// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RawToken is ERC20, Ownable {

    uint256 public max_mint_limit = 5000 ether;
    uint256 public fee = 0.001 ether;

    constructor(uint256 _initialSupply) ERC20("RAW Token", "RAW") {
        _mint(msg.sender, _initialSupply * (10 ** decimals()));
    }

    function mint(address to, uint256 amount) public payable {
        require(
            msg.sender == owner()
            || amount <= max_mint_limit
            || msg.value == fee,
            "Should pay fee if exceeding the max minting limit!"
        );
        _mint(to, amount);
    }

    function setMaxMintLimit(uint256 newLimit) external onlyOwner {
        require(
            newLimit != max_mint_limit,
            "Limit already set!"
        );
        max_mint_limit = newLimit;
    }

    function setFee(uint256 newFee) external onlyOwner {
        require(
            newFee != fee,
            "Fee already set!"
        );
        fee = newFee;
    }
}