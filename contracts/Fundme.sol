// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract FundMe {
    uint256 public minimunUsd = 50 * 1e18; // 1 * 10 ** 18
    // get funds from user
    // withdraw funds

    function fund() public payable {
        // set a minimum amount of funding value in USD
        // 1. how do we send WTH to this contract
        require(getConversionRate(msg.value) >= minimunUsd, "Didn't send enough"); // 1e18 == 1 * 10 ** 18 == 1000000000000000000 wei = 1 ether
        // what is reverting? => undo any action before, and send remaining gas back
        // 18 decimals
    }

    function getPrice() public view returns(uint256) {
        // ABI
        // Adddress
        // 0x694AA1769357215DE4FAC081bf1f309aDC325306
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        (, int256 price,,,) = priceFeed.latestRoundData();
        // ETH in terms of USD
        // 20000.00000000
        return uint256(price * 1e10); // 1**10 == 10000000000
    }

    function getConversionRate(uint256 ethAmount) public view returns (uint256) {
        uint256 ethPrice = getPrice();
        // 2000_000000000000000000 1e18 = ETH / USD price
        // 1_000000000000000000 ETH 
        uint256 ethAmountInUSD = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUSD;
    }

    // function withdraw() {

    // }
}