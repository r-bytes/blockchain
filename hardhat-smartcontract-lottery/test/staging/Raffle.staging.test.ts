import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import assert from "assert";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { Raffle } from "../../typechain-types";

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Staging Tests", () => {
        let raffle: Raffle, raffleEntranceFee: BigNumber, deployer: SignerWithAddress, accounts: SignerWithAddress[]

        beforeEach(async () => {
            // grab the accounts
            accounts = await ethers.getSigners()
            deployer = accounts[0];
            // get deployed raffle contract and entrance fee
            raffle = await ethers.getContract("Raffle");
            raffleEntranceFee = await raffle.getEntranceFee();
        });

        describe("fulfillRandomWords", () => {
            it("should get us a random winner by using Chainlink Keepers and VRF", async () => {
                // setup listener before entering the raffle
                const startingTimestamp = await raffle.getLatestTimestamp();
                
                await new Promise<void>(async (resolve, reject) => {
                    raffle.once("WinnerPicked", async () => {
                        console.log("detected event WinnerPicked")
                        
                        try {
                            const recentWinner = await raffle.getRecentWinner();
                            const raffleState = await raffle.getRaffleState();
                            const winnerEndingBalance = await deployer.getBalance();
                            const endingTimestamp = await raffle.getLatestTimestamp();
                            
                            await expect(raffle.getPlayer(0)).to.be.reverted;
                            assert.equal(recentWinner.toString(), deployer.address);
                            assert.equal(raffleState, 0)
                            assert.equal(winnerEndingBalance.toString(), winnerStartingBalance.add(raffleEntranceFee).toString());
                            assert(endingTimestamp > startingTimestamp);
                            
                            resolve();

                        } catch (error) {
                            console.log(error)
                            reject(error)
                        }
                    })

                    // enter the raffle
                    console.log('entering Raffle...')
                    const tx = await raffle.enterRaffle({ value: raffleEntranceFee })
                    await tx.wait(1)
                    console.log('time to wait...')
                    const winnerStartingBalance = await deployer.getBalance();

                    // * listener must finish listening in order to complete the code!!
                })
                
            })
        })

    })