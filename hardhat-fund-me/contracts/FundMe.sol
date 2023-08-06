// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./PriceConverter.sol";

error NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUN_USD = 50 * 1e18; // 1 * 10 ** 18

    address[] public funders;
    mapping(address => uint256) public AddressToAmountFunded;

    address public immutable i_owner;

    constructor() {
        i_owner = msg.sender;
    }

    // get funds from user
    // withdraw funds

    function fund() public payable {
        // set a minimum amount of funding value in USD
        // 1. how do we send WTH to this contract
        require(msg.value.getConversionRate() >= MINIMUN_USD, "Didn't send enough"); // 1e18 == 1 * 10 ** 18 == 1000000000000000000 wei = 1 ether
        // what is reverting? => undo any action before, and send remaining gas back
        // 18 decimals
        funders.push(msg.sender);
        AddressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        for(uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
            address funder = funders[funderIndex];
            AddressToAmountFunded[funder] = 0;
        }
        // reset the array
        funders = new address[](0);

        // actually withdraw the funds (there are three options)

        // option 1 = transfer 
        // gas limit is capped to 2300, throws an error
        // payable(msg.sender).transfer(address(this).balance);

        // option 2. send
        // gas limit is capped to 2300, return an bool
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "send failed");
        
        // option 3 - call (recommended way)
        // forward all gas or set gas, returns bool
        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "call failed");
    }

    modifier onlyOwner {
        // require(msg.sender == i_owner, "Sender is not owner");
        if (msg.sender == i_owner) { revert NotOwner(); }
        _;
    }

    receive() external payable{
       fund();
    }

    fallback() external payable{
        fund();
    }
}