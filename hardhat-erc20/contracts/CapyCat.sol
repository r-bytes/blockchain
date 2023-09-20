// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// constructor (string memory name_, string memory symbol_)
contract CapyCat is ERC20 {
    constructor(uint256 initialSupply) ERC20("CapyCat", "CAPYCAT") {
        _mint(msg.sender, initialSupply);
    }
}
