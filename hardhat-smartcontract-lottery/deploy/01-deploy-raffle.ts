import { ethers } from "hardhat";
import { DeployFunction, DeployResult } from "hardhat-deploy/dist/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { Address } from "hardhat-deploy/types";
import { verify } from "../utils/verify";
import { Addressable, ContractTransactionReceipt, ContractTransactionResponse } from "ethers";

const FUND_AMOUNT = ethers.parseEther("30");

const deployRaffle: DeployFunction = async ({ getNamedAccounts, deployments, network }) => {
    const { deploy, log } = deployments;
    const { deployer, player } = await getNamedAccounts();
    const chainId: number = network.config.chainId!;

    let vrfCoordinatorV2Adress: (string | Addressable) | (string | undefined),
        subscriptionId: number | string | undefined,
        vrfCoordinatorV2Mock;

    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", deployer);
        vrfCoordinatorV2Adress = vrfCoordinatorV2Mock.target;
        // create a subscription programmatically
        const transactionResponse: ContractTransactionResponse =
            await vrfCoordinatorV2Mock.createSubscription();
        transactionResponse.wait(1);
        const transactionReceipt: ContractTransactionReceipt = (await transactionResponse.wait(
            1,
        )) as ContractTransactionReceipt;
        // NOT WORKING => transactionReceipt.events[0].args.subId;
        subscriptionId = 1;
        // fund the subscription
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
    } else {
        vrfCoordinatorV2Adress = networkConfig[chainId].vrfCoordinatorV2;
        subscriptionId = networkConfig[chainId].subscriptionId;
    }

    // constructer arguments
    const args = [
        vrfCoordinatorV2Adress,
        networkConfig[chainId].entranceFee,
        networkConfig[chainId].gasLane,
        subscriptionId,
        networkConfig[chainId].callbackGasLimit,
        networkConfig[chainId].interval,
    ];

    const deployOptions = {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: 1,
    };
    const raffle: DeployResult = await deploy("Raffle", deployOptions);

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("[deploy script] verifying contract...");
        await verify(raffle.address, args);
    }
};

export default deployRaffle;
deployRaffle.tags = ["all", "raffle"];
