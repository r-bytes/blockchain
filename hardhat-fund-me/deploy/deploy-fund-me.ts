import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { deployments, network } from "hardhat"

const deployFunc: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
}) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  // what happens if we want to change chains
  // when working with localhost or hh we want to use mocks
}

export default deployFunc
