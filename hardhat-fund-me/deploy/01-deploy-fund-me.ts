import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction, DeployResult } from "hardhat-deploy/types"
import { deployments, network } from "hardhat"
import { developmentChains, networkConfig } from "../helper-hardhat-config"

// prettier-ignore
const deployFunc: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  
  let ethUsdPriceFeed: string = "";
  const chainId: number = network.config.chainId!
  log("=====> network is: ", network.name)
  log("=====> chainId is: ", chainId)


  // check if we are on a development chain
  // if so, we should use mocks
  if (developmentChains.includes(network.name)) {
    // wait for and return address from mock
    const ethUsdAggregator: string = (await get("MockV3Aggregator")).address
    ethUsdPriceFeed = ethUsdAggregator
  } else {
    ethUsdPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"]
  }
  log("")
  log("=====> ----------------------------------------------------------------")

  log("")
  log("=====> deploying FundMe and waiting for confirmations...")
  const fundMe: DeployResult = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeed], // priceFeedAddress
    log: true,
  })

  // log("=====> receipt: ", fundMe.receipt)
  log("")
  log("=====> ----------------------------------------------------------------")

}

export default deployFunc

deployFunc.tags = ["all", "mocks"]