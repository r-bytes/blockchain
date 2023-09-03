import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import { assert, expect } from "chai";
import { Deployment } from "hardhat-deploy/types";
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain-types";
import { BigNumber } from "ethers";


!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", () => {
        let raffle: Raffle,
            vrfCoordinatorV2Mock: VRFCoordinatorV2Mock,
            raffleEntranceFee: BigNumber,
            deployer: string,
            player: string,
            interval: BigNumber | number | string;
        const chainId: number = network.config.chainId!;

        beforeEach(async () => {
            // grab the accounts
            deployer = (await getNamedAccounts()).deployer;
            player = (await getNamedAccounts()).player;

            // deploy modules with "all" tag
            const deploymentResult: { [name: string]: Deployment } = await deployments.fixture([
                "all",
            ]);

            // get addresses from deployment result
            const raffleAddress: string = deploymentResult["Raffle"].address;
            const vrfCoordinatorV2MockAddress: string =
                deploymentResult["VRFCoordinatorV2Mock"].address;

            // get deployed contracts
            raffle = await ethers.getContract("Raffle");
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");

            raffleEntranceFee = await raffle.getEntranceFee();
            interval = await raffle.getInterval();
        });

        describe("constructor", () => {
            it("should initialize the raffle correctly", async () => {
                const raffleState = await raffle.getRaffleState();

                assert.equal(raffleState.toString(), "0"); // 0 = OPEN, 1 = CALCULATING
                assert.equal(interval?.toString(), networkConfig[chainId].interval.toString());
            });
        });

        describe("enterRaffle", () => {
            it("should revert when you don't pay enough", async () => {
                await expect(raffle.enterRaffle()).to.be.revertedWith(
                    "Raffle__NotEnoughETHEntered",
                );
            });

            it("should record players when they enter", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee });

                const playerFromContract = await raffle.getPlayer(0);

                assert.equal(playerFromContract, deployer);
            });

            it("should emit an event on enter", async () => {
                await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
                    raffle,
                    "RaffleEnter",
                );
            });

            it("should not allow entrance when the raffle state is set to calculating", async () => {
                console.log("1 - begin",)
                await raffle.enterRaffle({ value: raffleEntranceFee });
                console.log("entered raffle");

                const upkeepNeededBefore = await raffle.checkUpkeepNeeded();
                console.log('upkeepNeeded:', upkeepNeededBefore)

                // skip time on blockchain
                await network.provider.send("evm_increaseTime", [Number(interval) + 10]);
                console.log("skipped time on evm");
                
                await network.provider.request({ 
                    method: "evm_mine", 
                    params: [] 
                });
                console.log("mined a block on evm");

                const upkeepNeededAfter = await raffle.checkUpkeepNeeded();
                console.log('upkeepNeeded:', upkeepNeededAfter)

                // pretend to be a chainlink keeper
                await raffle.performUpkeep("0x");
                console.log("state changed to calculating");

                await expect(
                    raffle.enterRaffle({ value: raffleEntranceFee }),
                ).to.be.revertedWith("Raffle__NotOpen");
            });
        });

        describe("checkUpkeep", () => {
            it("should return false if there wasn't send enough ETH", async () => {
                await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                await network.provider.send("evm_mine", [])
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")

                assert(!upkeepNeeded)
            })

            it("should return false if raffle isn't open", async () => {
                // ether raffle
                await raffle.enterRaffle({ value: raffleEntranceFee })
                
                // skip time on evm amd mine a block
                await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                await network.provider.send("evm_mine", [])

                await raffle.performUpkeep("0x");
                const raffleState = await raffle.getRaffleState();
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x");

                assert.equal(raffleState.toString(), "1")
                assert.equal(upkeepNeeded, false)
            })

            it("should return false if enough time hasn't passed", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [Number(interval) - 10])
                await network.provider.request({ method: "evm_mine", params: [] })
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
                assert(!upkeepNeeded)
            })

            it("should return true if enough time has passed, has players, eth, and is open", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
                assert(upkeepNeeded)
            })
        })
    });
