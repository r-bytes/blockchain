// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    // prettier-ignore
    function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        // ETH in terms of USD
        // 20000.00000000
        return uint256(price * 1e10); // 1**10 == 10000000000
    }

    function getVersion() internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        return priceFeed.version();
    }

    // prettier-ignore
    function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) internal view returns (uint256) {
      uint256 ethPrice = getPrice(priceFeed);

      uint256 ethAmountInUSD = (ethPrice * ethAmount) / 1e18;
      return ethAmountInUSD;
    }
}
