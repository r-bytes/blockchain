import { ethers, run, network } from "hardhat"
import { SimpleStorage, SimpleStorage__factory } from "../typechain-types"
import { expect, assert } from "chai"
import { ContractTransactionReceipt, ContractTransactionResponse } from "ethers"

describe("SimpleStorage", function () {
  let simpleStorageFactory: SimpleStorage__factory, simpleStorage: SimpleStorage

  beforeEach(async () => {
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
    simpleStorage = await simpleStorageFactory.deploy()
  })

  // assert
  it("should start with a favorite number of 0", async () => {
    const currentValue = await simpleStorage.retrieve()
    const expectedValue = "0"

    assert.equal(currentValue.toString(), expectedValue)
  })

  // expect
  it("Should update when calling store", async () => {
    const expectedValue: bigint | string = "8"
    const transactionResponse: ContractTransactionResponse =
      await simpleStorage.store(expectedValue)

    await transactionResponse.wait(1)
    const currentValue: bigint = await simpleStorage.retrieve()
    expect(currentValue).to.equal(expectedValue)
  })
})
