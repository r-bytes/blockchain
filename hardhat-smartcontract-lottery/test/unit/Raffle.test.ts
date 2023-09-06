import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import { assert, expect } from "chai";
import { Deployment, Receipt } from "hardhat-deploy/types";
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain-types";
import { BigNumber, ContractReceipt, ContractTransaction } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";


!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", () => {
        let raffle: Raffle,
            raffleContract: Raffle,
            vrfCoordinatorV2Mock: VRFCoordinatorV2Mock,
            raffleEntranceFee: BigNumber,
            deployer: SignerWithAddress,
            player: SignerWithAddress,
            interval: BigNumber | number | string,
            accounts: SignerWithAddress[]
        const chainId: number = network.config.chainId!;

        beforeEach(async () => {
            // grab the accounts
            accounts = await ethers.getSigners() // could also do with getNamedAccounts
            deployer = accounts[0];
            player = accounts[1];

            // deploy modules with "all" tag
            const deploymentResult: { [name: string]: Deployment } = await deployments.fixture([
                "all",
            ]);

            // get addresses from deployment result
            const raffleAddress: string = deploymentResult["Raffle"].address;
            const vrfCoordinatorV2MockAddress: string =
                deploymentResult["VRFCoordinatorV2Mock"].address;

            // get deployed contracts
            raffleContract = await ethers.getContract("Raffle");
            raffle = raffleContract.connect(player)
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

                assert.equal(playerFromContract, player.address);
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

        describe("performUpkeep", () => {
            it("should only run if checkUpkeep is true", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                await network.provider.request({ method: "evm_mine", params: [] })

                const tx = await raffle.performUpkeep("0x")
                assert(tx)
            })

            it("should revert when checkUpkeep is false", async () => {
                await expect(raffle.performUpkeep("0x")).to.be.revertedWith("Raffle__UpkeepNotNeeded")
            })

            it("should update the raffle state, emits an event and call the vrf coordinator", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                await network.provider.request({ method: "evm_mine", params: [] })

                const txResponse = await raffle.performUpkeep("0x")
                const txReceipt = await txResponse.wait(1)
                
                const raffleState = await raffle.getRaffleState();

                const requestId = txReceipt!.events![1].args!.requestId
                
                assert(Number(requestId) > 0)
                assert(Number(raffleState) === 1)

            })
        })

        describe("fulfillRandomWords", () => {
            beforeEach(async () => {
                // for each test below, someone should have entered the raffle
                await raffle.enterRaffle({ value: raffleEntranceFee })
                // some time has past and a block is mined
                await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
            })
            
            it("can only be called after performUpkeep", async () => {
                await expect(vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)).to.be.revertedWith("nonexistent request")
            })
            
            it("can only be called after performUpkeep", async () => {
                await expect(vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)).to.be.revertedWith("nonexistent request")
            })

            it("picks a winner, resets the lottery, and send money", async () => {
                const additionalEntrants = 3
                const accounts = await ethers.getSigners();
                const startingIndex = 2 // [deployer, player]

                for (let i = startingIndex; i < startingIndex + additionalEntrants; i++) {
                    // connect as user
                    raffle = raffleContract.connect(accounts[i])
                    await raffle.enterRaffle({ value: raffleEntranceFee })
                }

                const startingTimestamp = await raffle.getLatestTimestamp();

                // perform upkeep
                // fullfill random words
                // wait for the fulfill random words event
                await new Promise<void>(async (resolve, reject) => {
                    // setup listener
                    raffle.once("WinnerPicked", async () => {
                        console.log("detected winner picked event!")
                        try {
                            const recentWinner = await raffle.getRecentWinner()
                            const raffleState = await raffle.getRaffleState()
                            const winnerBalance = await accounts[2].getBalance()
                            const endingTimeStamp = await raffle.getLatestTimestamp()
                            const numPlayers = await raffle.getNumberOfPlayers()
                            
                            console.log("winner", recentWinner)
                            
                            assert.equal(Number(numPlayers), 0) 
                            assert.equal(raffleState, 0)
                            assert(endingTimeStamp > startingTimestamp)

                            assert.equal(
                                // winner ending balace = the money of all players multiplied
                                winnerBalance.toString(),
                                startingBalance
                                    .add(
                                        raffleEntranceFee
                                            .mul(additionalEntrants)
                                            .add(raffleEntranceFee)
                                    )
                                    .toString()
                            )

                            // await expect(raffle.getPlayer(0)).to.be.reverted
                            
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    })
                    // * inside of the promise but outside of the listener
                    // mock cl keepers
                    const tx: ContractTransaction = await raffle.performUpkeep("0x")
                    const txReceipt: ContractReceipt = await tx.wait(1)
                    const startingBalance = await accounts[2].getBalance()

                    // mock cl vrf
                    await vrfCoordinatorV2Mock.fulfillRandomWords(
                        txReceipt!.events![1].args!.requestId,
                        raffle.address
                    )
                })

            })
        })
    });
