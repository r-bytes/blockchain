// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "./SimpleStorage.sol";

contract ExtraStorage is SimpleStorage {
    // store + 5
    //  overwrite
    // virtual, overwrite

    function store(uint256 _favoriteNumber) public override {
        favoriteNumber = _favoriteNumber + 5;

    }
}