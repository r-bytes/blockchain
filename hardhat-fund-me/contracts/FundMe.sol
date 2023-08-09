// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "./PriceConverter.sol";

// error codes
error FundMe__NotOwner();

/** @title A contract for crowd funding
 *  @author r-bytes
 *  @notice This contract is to demo a funding contract
 *  @dev This implements price feeds as a library
 *  @dev functions order: constructor, receive, fallback, external, public, internal, private, view, pure
 */
contract FundMe {
    // libraries
    using PriceConverter for uint256;

    // state variables
    mapping(address => uint256) public AddressToAmountFunded;
    address[] public funders;
    address public immutable i_owner;
    uint256 public constant MINIMUN_USD = 50 * 1e18; // 1 * 10 ** 18
    AggregatorV3Interface public priceFeed;

    // modifiers
    modifier onlyOwner() {
        if (msg.sender == i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

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
        require(
            // set a minimum amount of funding value in USD
            // this library automatically passes the ethAmount to msg.value (first param)
            msg.value.getConversionRate(priceFeed) >= MINIMUN_USD,
            "You need to spend more ETH!"
        );

        // add funder to funders array and AddressToAmountFunded
        funders.push(msg.sender);
        AddressToAmountFunded[msg.sender] += msg.value;
    }

    // withdraw funds
    function withdraw() public onlyOwner {
        // loop over the funders array
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
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
