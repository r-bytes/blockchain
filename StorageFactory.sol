// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "./SimpleStorage.sol";

contract StorageFactory {
    // type, visibility, variable name
    SimpleStorage[] public simpleStorageAray;

    function createSimpleStorageContract() public {
        SimpleStorage simpleStorage = new SimpleStorage();
        simpleStorageAray.push(simpleStorage);
    }

    function sfStore(uint256 _simpleStorageIndex, uint256 _simpleStorageNumber) public {
        // to interact with other contracts we need the
        // contract address
        // ABI - application binary interface
        simpleStorageAray[_simpleStorageIndex].store(_simpleStorageNumber);
    }

    function sfGet(uint256 _simpleStorageIndex) public view returns(uint256) {
        return simpleStorageAray[_simpleStorageIndex].retrieve();
    }
}