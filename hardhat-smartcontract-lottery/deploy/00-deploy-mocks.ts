import { DeployFunction } from "hardhat-deploy/types";
import { ethers, network } from "hardhat";
// prettier-ignore
import { developmentChains } from "../helper-hardhat-config";

const BASE_FEE = ethers.parseEther("0.25") // 0.25 is the premium according to the docs at https://docs.chain.link/vrf/v2/subscription/supported-networks. it costs 0.25 LINK per request.
const GAS_PRICE_LINK = 1e9 // link per gas. calculated value based on the gas price of the chain.
// prettier-ignore
const deployMocks: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  
  const chainId: number = network.config.chainId!

  if(developmentChains.includes(network.name)) {
    log("")
    log("----------------------------------------------------------------")
    log("")
    log("=====> development chain detected!")
    log("")
    log("=====> deploying mocks...")

    // uint96 _baseFee (PREMIUM), uint96 _gasPriceLink

    const args = [BASE_FEE, GAS_PRICE_LINK]
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: args,
      log: true,
    })

    log("=====> mocks deployed!")
    log("")
    log("----------------------------------------------------------------")
    log("")

  }
}

export default deployMocks;

deployMocks.tags = ["all", "mocks"];