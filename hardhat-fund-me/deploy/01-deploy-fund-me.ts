import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction, DeployResult } from "hardhat-deploy/types"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import { verify } from "../utils/verify"

// prettier-ignore
const deployFunc: DeployFunction = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId: number = network.config.chainId!

  let ethUsdPriceFeed: string = ""
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
  log("----------------------------------------------------------------")

  log("")
  log("=====> deploying FundMe and waiting for confirmations...")

  log("=====> debug: ", deployer, ethUsdPriceFeed)
  const fundMe: DeployResult = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeed], // priceFeedAddress goes here
    log: true,
    waitConfirmations: 1,
  })

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    // verify the contract
    await verify(fundMe.address, [ethUsdPriceFeed])
  }

  // log("=====> receipt: ", fundMe.receipt)
  log("")
  log("----------------------------------------------------------------")
}

export default deployFunc

deployFunc.tags = ["all", "mocks"]
