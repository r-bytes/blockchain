// SPDX-License-Identifier: MIT
// Pragma
pragma solidity 0.8.19;
// Imports
import "./PriceConverter.sol";
// Interfaces, Libraries

// Error codes
error FundMe__NotOwner();

/** @title A contract for crowd funding
 *  @author r-bytes
 *  @notice This contract is to demo a funding contract
 *  @dev This implements price feeds as a library
 */
contract FundMe {
  // Type declarations
  // use PriceConverter as a library
  using PriceConverter for uint256;

  // State variables
  mapping(address => uint256) public AddressToAmountFunded;
  address[] public funders;
  address public immutable i_owner;
  uint256 public constant MINIMUN_USD = 50 * 1e18; // 1 * 10 ** 18
  AggregatorV3Interface public priceFeed;

  // Modifiers
  // only owners can withdraw
  modifier onlyOwner() {
    // check this first
    if (msg.sender == i_owner) {
      revert FundMe__NotOwner();
    }
    // continue with the rest of the function
    _;
  }

  // Functions order: constructor, receive, fallback, external, public, internal, private, view, pure

  constructor(address priceFeedAddress) {
    i_owner = msg.sender;
    priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  // senders should always use the fund function when sending eth
  receive() external payable {
    fund();
  }

  fallback() external payable {
    fund();
  }

  /**
   *  @notice This function funds this contract
   *  @dev This implements price feeds as a library
   */
  // get funds from user
  function fund() public payable {
    // set a minimum amount of funding value in USD
    require(
      // this library automatically passes the ethAmount to msg.value (first param)
      msg.value.getConversionRate(priceFeed) >= MINIMUN_USD,
      "Didn't send enough"
    );

    // add funder to funders array and AddressToAmountFunded
    funders.push(msg.sender);
    AddressToAmountFunded[msg.sender] += msg.value;
  }

  // withdraw funds
  function withdraw() public onlyOwner {
    // loop over the funders array
    for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
      // reset the ammount funded per index
      address funder = funders[funderIndex];
      AddressToAmountFunded[funder] = 0;
    }
    // reset the actual funders array
    funders = new address[](0);

    // actually withdraw the funds using call
    (bool callSuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }("");
    require(callSuccess, "call failed");
  }
}
