import { ethers, network } from "hardhat";
import { DeployFunction, DeployResult } from "hardhat-deploy/dist/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { Address } from "hardhat-deploy/types";

const main: DeployFunction = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId!

    let VRFCoordinatorV2Adress: Address;

    if(developmentChains.includes(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", deployer)
        VRFCoordinatorV2Adress = await VRFCoordinatorV2Mock.getAddress();
    } else {
        VRFCoordinatorV2Adress = networkConfig[chainId].vrfCoordinatorV2
    }

    const deployOptions = {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: 1,
    }
    const raffle: DeployResult = await deploy("Raffle", deployOptions)
};
