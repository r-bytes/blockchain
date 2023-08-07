import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction, DeployResult } from "hardhat-deploy/types"
import { deployments, network } from "hardhat"
import { developmentChains, networkConfig } from "../helper-hardhat-config"

// prettier-ignore
const deployFunc: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId: number = network.config.chainId!
  console.log("=====> network is: ", chainId)

  let ethUsdPriceFeed: string;

  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator: string = (await get("MockV3Aggregator")).address
    ethUsdPriceFeed = ethUsdAggregator
  } else {
    ethUsdPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"]
  }
  log("----------------------------------------------------")

  // if chainId is X use priceFeed Y
  // if chainId is Z use priceFeed A

  // if contract doesnt exist, create minimal version for local testing



  // what happens if we want to change chains
  // when working with localhost or hh we want to use mocks
  log("=====> deploying FundMe and waiting for confirmations...")
  const fundMe: DeployResult = await deploy("FundMe", {
    from: deployer,
    args: [], // priceFeedAddress
    log: true,
  })
}

export default deployFunc
