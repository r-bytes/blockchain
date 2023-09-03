import { ethers } from "hardhat";
import { DeployFunction, DeployResult } from "hardhat-deploy/dist/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { verify } from "../utils/verify";
import { Contract, ContractReceipt, ContractTransaction } from "ethers";


const FUND_AMOUNT = ethers.utils.parseEther("30");

const deployRaffle: DeployFunction = async ({ getNamedAccounts, deployments, network }) => {
    const { deploy, log } = deployments;
    const { deployer, player } = await getNamedAccounts();
    const chainId: number = network.config.chainId!;

    let vrfCoordinatorV2Address: string | undefined,
        subscriptionId: string,
        vrfCoordinatorV2Mock: Contract | undefined;

    if (developmentChains.includes(network.name)) {
        // get the VRF contract
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        
        // create a subscription programmatically
        const transactionResponse: ContractTransaction = await vrfCoordinatorV2Mock.createSubscription();
        const transactionReceipt: ContractReceipt = await transactionResponse.wait();
        
        subscriptionId = transactionReceipt!.events![0].args!.subId;
        
        // fund the subscription
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);        
        
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
        subscriptionId = networkConfig[chainId].subscriptionId;
    }
    
    // setup constructor arguments
    const args = [
        vrfCoordinatorV2Address,
        networkConfig[chainId!].entranceFee,
        networkConfig[chainId!].gasLane,
        subscriptionId,
        networkConfig[chainId!].callbackGasLimit,
        networkConfig[chainId!].interval,
    ];
    
    // setup options
    const deployOptions = {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: 1,
    };

    // deploy the contract
    const raffle: DeployResult = await deploy("Raffle", deployOptions);

    // add the consumer
    if(developmentChains.includes(network.name)) {
        console.log("adding raffle contract as consumer");
        await vrfCoordinatorV2Mock?.addConsumer(Number(subscriptionId), raffle.address)
        console.log("consumer added!");
    }
    
    
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("[deploy script] verifying contract...");
        await verify(raffle.address, args);
    }
};

export default deployRaffle;
deployRaffle.tags = ["all", "raffle"];
