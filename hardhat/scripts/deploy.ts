import { ethers, run, network } from "hardhat"
import { SimpleStorage, SimpleStorage__factory } from "../typechain-types";

async function main() {
  const simpleStorageFactory: SimpleStorage__factory = await ethers.getContractFactory("SimpleStorage")
  
  console.log("=====> deploying contract ...")
  const simpleStorage = await simpleStorageFactory.deploy({gasLimit: 2000000})
  await simpleStorage.waitForDeployment()

  const contractAdress = await simpleStorage.getAddress()
  console.log("=====> deployed contract", contractAdress, "check it out on https://etherscan.io")
  
  console.log("=====> network is: ", network.config.chainId === 4 ? "rinkeby" : network.config.chainId === 11155111 ? "sepolia" : "hardhat or ganache")
  if(network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY) {
    // rinkeby
    await simpleStorage.deploymentTransaction()!.wait(6)
    await verify(await simpleStorage.getAddress(), [])
  } else if(network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    // sepolia
    await simpleStorage.deploymentTransaction()!.wait(6)
    await verify(await simpleStorage.getAddress(), [])
  }

  /* get current favorite number */
  const currentValue = await simpleStorage.retrieve()
  console.log("=====> current favorite number value is: ", currentValue.toString())
  
  /* update current favorite number */
  console.log("=====> storing a new favorite number value...")
  const txResponse = await simpleStorage.store("8")
  await txResponse.wait(1)
  
  /* get updated favorite number */
  const updatedValue = await simpleStorage.retrieve()
  console.log("=====> updated favorite number value is: ", updatedValue.toString())
}

async function verify(contractAddress: string, args: any) {
  console.log("=====> verifying contract ...")

  try {    
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args
    })
  } catch (error: any) {
    if (error.message.toLowerCase().includes("=====> already verified")) {
      console.log("=====> verification failed")
    } else {
      console.log(error)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  });
