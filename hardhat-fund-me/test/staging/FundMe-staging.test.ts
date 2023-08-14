import { ethers, getNamedAccounts, network } from "hardhat";
import { FundMe } from "../../typechain-types";
import { Address } from "hardhat-deploy/types";
import { developmentChains } from "../../helper-hardhat-config";
import { assert } from "chai";

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let deployer: Address;
          let fundMe: FundMe;
          const sendValue = ethers.parseEther("0.01");

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              fundMe = await ethers.getContractAt("FundMe", deployer);
          });

          it("allows people to fund and withdraw", async () => {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw();

              const endingBalance = ethers.provider.getBalance(
                  fundMe.getAddress(),
              );
              assert.equal(await endingBalance, 0n);
          });
      });
