import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import { assert } from "chai";
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain";
import { Deployment } from "hardhat-deploy/types";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", () => {
        let raffle: Raffle, vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
        const chainId: number = network.config.chainId!;

        beforeEach(async () => {
            // const { deployer } = await getNamedAccounts();
            // const accounts = (await ethers.getSigners());

            // deploy modules with "all" tag
            const deploymentResult: { [name: string]: Deployment } = await deployments.fixture(["raffle", "mocks"]);

            // get addresses from deployment result
            const raffleAddress: string = deploymentResult["Raffle"].address;
            const vrfCoordinatorV2MockAddress: string = deploymentResult["VRFCoordinatorV2Mock"].address;

            // get deployed contracts
            raffle = await ethers.getContractAt("Raffle", raffleAddress);
            vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", vrfCoordinatorV2MockAddress);
            
        });

        describe("constructor", async () => {
            it("Initialites the raffle correctly", async () => {
                const raffleState = await raffle.getRaffleState();
                const interval = await raffle.getInterval();
    
                assert.equal(raffleState.toString(), "0"); // 0 = OPEN, 1 = CALCULATING
                assert.equal(interval.toString(), networkConfig[chainId].interval);
            });
        })

    });
