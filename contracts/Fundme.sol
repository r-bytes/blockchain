// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "./PriceConverter.sol";

contract FundMe {
    using PriceConverter for uint256;

    uint256 public minimunUsd = 50 * 1e18; // 1 * 10 ** 18

    address[] public funders;
    mapping(address => uint256) public AddressToAmountFunded;

    // get funds from user
    // withdraw funds

    function fund() public payable {
        // set a minimum amount of funding value in USD
        // 1. how do we send WTH to this contract
        require(msg.value.getConversionRate() >= minimunUsd, "Didn't send enough"); // 1e18 == 1 * 10 ** 18 == 1000000000000000000 wei = 1 ether
        // what is reverting? => undo any action before, and send remaining gas back
        // 18 decimals
        address.push(msg.sender);
        AddressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() {
        for(uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
            address funder = funders[funderIndex];
            AddressToAmountFunded[funder] = 0;
        }
        // reset the array
        funders = new address[](0);
    }
}