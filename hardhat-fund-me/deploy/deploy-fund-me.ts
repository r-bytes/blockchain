import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction, DeployResult } from "hardhat-deploy/types"
import { deployments, network } from "hardhat"
import networkConfig from "../helper-hardhat-config"

const deployFunc: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
}) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId: number = network.config.chainId!

  console.log("=====>", chainId, typeof(chainId))
  const ethUsdPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"]
  console.log("=====>", networkConfig[chainId]["ethUsdPriceFeed"])
  console.log("=====> ethUsdPriceFeed", ethUsdPriceFeed)
  // if (chainId == 31337) {
  //   const ethUsdAggregator = await deployments.get("MockV3Aggregator")
  //   ethUsdPriceFeedAddress = ethUsdAggregator.address
  // } else {
    // ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeed!
  // }

  // what happens if we want to change chains
  // when working with localhost or hh we want to use mocks
  const fundMe: DeployResult = await deploy("FundMe", {
    from: deployer,
    args: [], // priceFeedAddress
    log: true,
  })
}

export default deployFunc
