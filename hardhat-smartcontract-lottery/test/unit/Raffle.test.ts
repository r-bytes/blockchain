import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import { assert, expect } from "chai";
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain";
import { Address, Deployment } from "hardhat-deploy/types";
import { getBytes, isBytesLike, toBigInt, toNumber, zeroPadBytes } from "ethers";
import { Bytecode } from "hardhat/internal/hardhat-network/stack-traces/model";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", () => {
        let raffle: Raffle, vrfCoordinatorV2Mock: VRFCoordinatorV2Mock, raffleEntranceFee: bigint, deployer: string, player: string, interval: any;
        const chainId: number = network.config.chainId!;

        beforeEach(async () => {
            // grab the accounts
            deployer = (await getNamedAccounts()).deployer;
            player = (await getNamedAccounts()).player;

            // deploy modules with "all" tag
            const deploymentResult: { [name: string]: Deployment } = await deployments.fixture(["all"]);

            // get addresses from deployment result
            const raffleAddress: string = deploymentResult["Raffle"].address;
            const vrfCoordinatorV2MockAddress: string = deploymentResult["VRFCoordinatorV2Mock"].address;

            // get deployed contracts
            raffle = await ethers.getContractAt("Raffle", raffleAddress);
            vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", vrfCoordinatorV2MockAddress);

            raffleEntranceFee = await raffle.getEntranceFee();
            interval = await raffle.getInterval();
            
        });

        describe("constructor", async () => {
            it("should initialize the raffle correctly", async () => {
                const raffleState = await raffle.getRaffleState();
    
                assert.equal(raffleState.toString(), "0"); // 0 = OPEN, 1 = CALCULATING
                assert.equal(interval.toString(), networkConfig[chainId].interval);
            });
        })

        describe("enterRaffle", async () => {
            it("should revert when you don't pay enough", async () => {
                await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(raffle, "Raffle__NotEnoughETHEntered")
            })

            it("should record players when they enter", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })

                const playerFromContract = await raffle.getPlayer(0);

                assert.equal(playerFromContract, deployer)
            })

            it("should emit an event on enter", async () => {
                await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(raffle, "RaffleEnter");
            })

            it("should not allow entrance when the raffle state is set to calculating", async () => {
                // await raffle.enterRaffle({ value: raffleEntranceFee })
                const increasedInterval = Number(interval) + 10
  
                // manipulate time on blockchain
                await network.provider.send("evm_increaseTime", [increasedInterval])
                await network.provider.send("evm_mine", []);
                // alternative way (GANACHE): await network.provider.request({ method: "evm_min", params: [] })
                
                // pretend to be a chainlink keeper
                const zeroBytes = new Uint8Array()
                await raffle.performUpkeep(zeroBytes)

                await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWithCustomError(raffle, "Raffle__NotOpen")

            })
        })

    });
