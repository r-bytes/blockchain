import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"

const deployFunc: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  // code here
  console.log("=====> hi there")
}

export default deployFunc