import { ethers } from "hardhat"
import {
    INITIAL_SUPPLY,
    developmentChains,
    networkConfig,
} from "../helper-hardhat-config"

import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { DeployFunction, DeployResult } from "hardhat-deploy/dist/types"
import { verify } from "../utils/verify"

const deployRaffle: DeployFunction = async ({
    getNamedAccounts,
    deployments,
    network,
}) => {
    const { deploy, log } = deployments
    const deployer: HardhatEthersSigner = await ethers.provider.getSigner()
    const contractName: string = "CapyCat"


    log("=====> signers: ", deployer)

    const chainId: number = network.config.chainId!

    // setup constructor arguments
    const ARGS = [INITIAL_SUPPLY]

    // setup options
    const deployOptions = {
        from: deployer.address,
        args: ARGS,
        log: true,
        waitConfirmations: networkConfig[chainId].blockConfirmations || 1,
    }

    // deploy the contract
    const capyCatToken: DeployResult = await deploy(contractName, deployOptions)
    log(`=====> CapyCat Token is deployed at ${capyCatToken.address}`)
    log(`capyCatToken ${capyCatToken.address}`)

    // verify the contract if necessary
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("=====> verifying contract...")
        await verify(capyCatToken.address, ARGS, contractName)
    }
    log("============================================================================")
}

export default deployRaffle
deployRaffle.tags = ["all", "raffle"]
