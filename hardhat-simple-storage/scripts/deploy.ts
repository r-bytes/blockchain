import { ethers, run, network } from "hardhat"
import { SimpleStorage, SimpleStorage__factory } from "../typechain-types";
import { ContractTransactionResponse } from "ethers";

async function main(): Promise<void> {
  const simpleStorageFactory: SimpleStorage__factory = await ethers.getContractFactory("SimpleStorage")
  
  console.log("=====> deploying contract ...")
  const simpleStorage: SimpleStorage = await simpleStorageFactory.deploy({gasLimit: 2000000})
  await simpleStorage.waitForDeployment()

  const contractAdress: string = await simpleStorage.getAddress()
  console.log("=====> deployed contract address is: ", contractAdress, network.config.chainId === 4 ? "check it out on https://rinkeby.etherscan.io" : network.config.chainId === 11155111 ? "check it out on https://sepolia.etherscan.io" : "")
  
  console.log("=====> network is: ", network.config.chainId === 4 ? "rinkeby" : network.config.chainId === 11155111 ? "sepolia" : "hardhat or ganache")
  if(network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY) {
    // rinkeby
    console.log("=====> waiting for blocks to be confirmed...")
    await simpleStorage.deploymentTransaction()!.wait(6)
    await verify(await simpleStorage.getAddress(), [])
  } else if(network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    // sepolia
    console.log("=====> waiting for blocks to be confirmed...")
    await simpleStorage.deploymentTransaction()!.wait(6)
    await verify(await simpleStorage.getAddress(), [])
  }

  /* get current favorite number */
  const currentValue: bigint = await simpleStorage.retrieve()
  console.log("=====> current favorite number value is: ", currentValue.toString())
  
  /* update current favorite number */
  console.log("=====> storing a new favorite number value...")
  const txResponse: ContractTransactionResponse = await simpleStorage.store("8")
  await txResponse.wait(1)
  
  /* get updated favorite number */
  const updatedValue: bigint = await simpleStorage.retrieve()
  console.log("=====> updated favorite number value is: ", updatedValue.toString())
}

async function verify(contractAddress: string, args: []): Promise<void> {
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
