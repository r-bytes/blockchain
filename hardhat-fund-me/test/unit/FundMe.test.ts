import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { FundMe, MockV3Aggregator } from "../../typechain-types";
import { assert, expect } from "chai";
import { developmentChains } from "../../helper-hardhat-config";
import { log } from "console";
import { Address, DeployFunction } from "hardhat-deploy/types";
import { ContractTransactionResponse } from "ethers";

describe("FundMe", async () => {
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

        // get deployer address from deployment results
        // log("=====> deploymentResults 1: ", deploymentResults["FundMe"])
        // log("=====> deploymentResults 2: ", deploymentResults["FundMe"]["receipt"]?.from) // 66
        // log("=====> deploymentResults 3: ", deploymentResults["FundMe"]?.address) // 12
        // log("=====> deploymentResults 4: ", deployer) // 66
        const fundMeAddress: Address = deploymentResults["FundMe"]?.address; // 12
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
            const priceFeedAddress: Address = await fundMe.priceFeed();
            const mockV3AggregatorAddress: Address =
                await mockV3Aggregator.getAddress();

            assert.equal(priceFeedAddress, mockV3AggregatorAddress);
        });
    });

    describe("fund", async () => {
        it("fails if you don't send enough eth", async () => {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!",
            );
        });
        it("updated the amountFunded data structure", async () => {
            const txResponse: ContractTransactionResponse = await fundMe.fund({
                value: sendValue,
            });
            const response: bigint = await fundMe.AddressToAmountFunded(
                deployer,
            );

            // assert.equal(txResponse.from, deployer)
            assert.equal(response, sendValue);
        });
        it("should add funder to array of funders", async () => {
            const txResponse: ContractTransactionResponse = await fundMe.fund({
                value: sendValue,
            });
            const funder: Address = await fundMe.funders(0);

            assert(funder, deployer);
        });
    });
    describe("should withraw the funds from the contract", async () => {
        // fund the contract before we test 'it
        beforeEach(async () => {
            const txResponse: ContractTransactionResponse = await fundMe.fund({
                value: sendValue,
            });
        });
        it("should add", async () => {
            ("");
        });
    });
});
