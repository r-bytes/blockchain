// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "./SimpleStorage.sol";

contract StorageFactory {
    // type, visibility, variable name
    SimpleStorage[] public simpleStorageArray;

    function createSimpleStorageContract() public {
        SimpleStorage simpleStorage = new SimpleStorage();
        simpleStorageArray.push(simpleStorage);
    }

    function sfStore(uint256 _simpleStorageIndex, uint256 _simpleStorageNumber) public {
        // to interact with other contracts we need the
        // contract address
        // ABI - Application Binary Interface
        // SimpleStorage simpleStorage = simpleStorageArray[_simpleStorageIndex];
        // simpleStorage.store(_simpleStorageNumber)
        simpleStorageArray[_simpleStorageIndex].store(_simpleStorageNumber); // refactor
    }

    function sfGet(uint256 _simpleStorageIndex) public view returns(uint256) {
        // SimpleStorage simpleStorage = simpleStorageArray[_simpleStorageIndex];
        // return simpleStorage.retrieve()
        return simpleStorageArray[_simpleStorageIndex].retrieve(); // refactor
    }
}