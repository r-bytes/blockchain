import { ethers } from "hardhat"
import { SimpleStorage, SimpleStorage__factory } from "../typechain-types"
import { expect, assert } from "chai"
import { ContractTransactionResponse } from "ethers"

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

  it("Should add a new person with a favorite number to the people array", async () => {
    const transactionResponse: ContractTransactionResponse = await simpleStorage.addPerson("satoshi", "21000000")
    await transactionResponse.wait(1)

    const expectedValue: string = "21000000"
    const nameToFavoriteNumberValue: string = (await simpleStorage.nameToFavoriteNumber("satoshi")).toString()
    const firstPersonPeopleArrFavoriteNumber: string = ((await simpleStorage.people(0)).favoriteNumber).toString()
    // const testValue = 8
    
    assert.equal(nameToFavoriteNumberValue, expectedValue)
    assert.equal(firstPersonPeopleArrFavoriteNumber, expectedValue)
    // assert.equal(testValue.toString(), "1")
  })
})
