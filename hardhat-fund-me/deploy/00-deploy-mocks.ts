import { DeployFunction } from "hardhat-deploy/types"
import { deployments, network } from "hardhat"
import {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} from "../helper-hardhat-config"

// prettier-ignore
const deployMocks: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  
  const chainId: number = network.config.chainId!

  if(developmentChains.includes(network.name)) {
    log("")
    log("----------------------------------------------------------------")
    log("")
    log("=====> local network detected")
    log("=====> deploying mocks...")

    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER]
    })

    log("=====> mocks deployed!")
    log("")

    log("----------------------------------------------------------------")
    log("")

  }
}

export default deployMocks

deployMocks.tags = ["all", "mocks"]
