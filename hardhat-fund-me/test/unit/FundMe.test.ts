import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { FundMe, MockV3Aggregator } from "../../typechain-types";
import { assert, expect } from "chai";
import { developmentChains } from "../../helper-hardhat-config";
import { log } from "console";
import { Address, DeployFunction } from "hardhat-deploy/types";
import {
    ContractTransactionReceipt,
    ContractTransactionResponse,
} from "ethers";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe: FundMe;
          let deployer: Address;
          let mockV3Aggregator: MockV3Aggregator;

          const sendValue = ethers.parseEther("1"); // 1e18

          // first let's deploy our contract
          beforeEach(async () => {
              if (!developmentChains.includes(network.name)) {
                  throw "=====> you need to be on a development chain to run tests";
              }
              // get deployer
              deployer = (await getNamedAccounts()).deployer;
              // deploy all contracts
              const deploymentResults = await deployments.fixture(["all"]);
              /* NOT WORKING
            // get contract by name
            // fundMe = await ethers.getContractAt("FundMe", deployer); 
        */
              const fundMeAddress: Address =
                  deploymentResults["FundMe"]?.address; // 12
              const mockV3AggregatorAddress: Address =
                  deploymentResults["MockV3Aggregator"]?.address;

              fundMe = await ethers.getContractAt("FundMe", fundMeAddress);
              mockV3Aggregator = await ethers.getContractAt(
                  "MockV3Aggregator",
                  mockV3AggregatorAddress,
              );
          });

          describe("constructor", async () => {
              it("sets the aggregator addresses correctly", async () => {
                  const getPriceFeedAddress: Address =
                      await fundMe.getPriceFeed();
                  const mockV3AggregatorAddress: Address =
                      await mockV3Aggregator.getAddress();

                  assert.equal(getPriceFeedAddress, mockV3AggregatorAddress);
              });
          });

          describe("fund", async () => {
              it("fails if you don't send enough eth", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!",
                  );
              });
              it("updated the amountFunded data structure", async () => {
                  const txResponse: ContractTransactionResponse =
                      await fundMe.fund({
                          value: sendValue,
                      });
                  const response: bigint =
                      await fundMe.getAddressToAmountFunded(deployer);

                  // assert.equal(txResponse.from, deployer)
                  assert.equal(response, sendValue);
              });
              it("should add funder to array of getFunders", async () => {
                  const txResponse: ContractTransactionResponse =
                      await fundMe.fund({
                          value: sendValue,
                      });
                  const funder: Address = await fundMe.getFunders(0);

                  assert(funder, deployer);
              });
          });
          describe("withraw", async () => {
              // fund the contract before we test 'it
              beforeEach(async () => {
                  const txResponse: ContractTransactionResponse =
                      await fundMe.fund({
                          value: sendValue,
                      });
              });

              it("withraw ETH from a single funder out of the contract", async () => {
                  const [owner] = await ethers.getSigners();
                  // arrange the test
                  const startingFundMeBalance: bigint =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress(),
                      );

                  const startingOwnerBalance: bigint =
                      await ethers.provider.getBalance(owner);

                  // act
                  const txResponse: ContractTransactionResponse = await fundMe
                      .connect(owner)
                      .withdraw();
                  const txReceipt: ContractTransactionReceipt =
                      (await txResponse.wait(1)) as ContractTransactionReceipt;
                  const { gasPrice, gasUsed } = txReceipt;
                  const gasCost = gasUsed * gasPrice;

                  const fundMeBalanceEnd: bigint =
                      await ethers.provider.getBalance(fundMe.getAddress());

                  const endingOwnerBalance: bigint =
                      await ethers.provider.getBalance(owner);

                  assert.equal(fundMeBalanceEnd, 0n);
                  assert.equal(
                      startingOwnerBalance + startingFundMeBalance,
                      endingOwnerBalance + gasCost,
                  );
              });

              it("allows to withdraw funds with multiple getFunders", async () => {
                  // arrange
                  const accounts = await ethers.getSigners();

                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract: ContractTransactionResponse =
                          await fundMe.connect(accounts[i]).fund({
                              value: sendValue,
                          });
                  }

                  const startingFundMeBalance: bigint =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress(),
                      );

                  const startingOwnerBalance: bigint =
                      await ethers.provider.getBalance(deployer);

                  // act
                  const txResponse: ContractTransactionResponse =
                      await fundMe.withdraw();
                  const txReceipt: ContractTransactionReceipt =
                      (await txResponse.wait(1)) as ContractTransactionReceipt;
                  const { gasPrice, gasUsed } = txReceipt;
                  const gasCost = gasUsed * gasPrice;

                  // assert
                  const fundMeBalanceEnd: bigint =
                      await ethers.provider.getBalance(fundMe.getAddress());

                  const endingOwnerBalance: bigint =
                      await ethers.provider.getBalance(deployer);

                  assert.equal(fundMeBalanceEnd, 0n);
                  assert.equal(
                      startingOwnerBalance + startingFundMeBalance,
                      endingOwnerBalance + gasCost,
                  );

                  // make sure that the getFunders are reset properly
                  await expect(fundMe.getFunders(0)).to.be.reverted;

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address,
                          ),
                          0n,
                      );
                  }
              });

              it("allows only the owner to withdraw funds", async () => {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = fundMe.connect(attacker);

                  await expect(
                      attackerConnectedContract.withdraw(),
                  ).to.be.revertedWithCustomError(
                      attackerConnectedContract,
                      "FundMe__NotOwner",
                  );
              });

              it("cheaperWithdraw single funder", async () => {
                  const [owner] = await ethers.getSigners();
                  // arrange the test
                  const startingFundMeBalance: bigint =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress(),
                      );

                  const startingOwnerBalance: bigint =
                      await ethers.provider.getBalance(owner);

                  // act
                  const txResponse: ContractTransactionResponse = await fundMe
                      .connect(owner)
                      .cheaperWithdraw();
                  const txReceipt: ContractTransactionReceipt =
                      (await txResponse.wait(1)) as ContractTransactionReceipt;
                  const { gasPrice, gasUsed } = txReceipt;
                  const gasCost = gasUsed * gasPrice;

                  const fundMeBalanceEnd: bigint =
                      await ethers.provider.getBalance(fundMe.getAddress());

                  const endingOwnerBalance: bigint =
                      await ethers.provider.getBalance(owner);

                  assert.equal(fundMeBalanceEnd, 0n);
                  assert.equal(
                      startingOwnerBalance + startingFundMeBalance,
                      endingOwnerBalance + gasCost,
                  );
              });

              it("cheaperWithdraw multiple funders", async () => {
                  // arrange
                  const accounts = await ethers.getSigners();

                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract: ContractTransactionResponse =
                          await fundMe.connect(accounts[i]).fund({
                              value: sendValue,
                          });
                  }

                  const startingFundMeBalance: bigint =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress(),
                      );

                  const startingOwnerBalance: bigint =
                      await ethers.provider.getBalance(deployer);

                  // act
                  const txResponse: ContractTransactionResponse =
                      await fundMe.cheaperWithdraw();
                  const txReceipt: ContractTransactionReceipt =
                      (await txResponse.wait(1)) as ContractTransactionReceipt;
                  const { gasPrice, gasUsed } = txReceipt;
                  const gasCost = gasUsed * gasPrice;

                  // assert
                  const fundMeBalanceEnd: bigint =
                      await ethers.provider.getBalance(fundMe.getAddress());

                  const endingOwnerBalance: bigint =
                      await ethers.provider.getBalance(deployer);

                  assert.equal(fundMeBalanceEnd, 0n);
                  assert.equal(
                      startingOwnerBalance + startingFundMeBalance,
                      endingOwnerBalance + gasCost,
                  );

                  // make sure that the getFunders are reset properly
                  await expect(fundMe.getFunders(0)).to.be.reverted;

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address,
                          ),
                          0n,
                      );
                  }
              });
          });
      });
