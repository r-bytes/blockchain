import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { Address } from "hardhat-deploy/dist/types";

interface NetworkConfig {
    [key: string]: NetworkConfigItem;
}
interface NetworkConfigItem {
    name: string;
    vrfCoordinatorV2?: Address;
    entranceFee: BigNumber;
    gasLane: string;
    subscriptionId: string;
    callbackGasLimit?: string;
    interval: number;
}

export const networkConfig: NetworkConfig = {
    "31337": {
        name: "hardhat",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // doesn't matter on hh
        callbackGasLimit: "500000",
        subscriptionId: "0",
        interval: 30
    },
    "1": {
        name: "main",
        vrfCoordinatorV2: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909",
        entranceFee: ethers.utils.parseEther("0.001"),
        gasLane: "0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef", // 200 gwei Key Hash
        subscriptionId: "0",
        interval: 30
    },
    "11155111": {
        name: "sepolia",
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei Key Hash
        callbackGasLimit: "500000",
        subscriptionId: "0",
        interval: 30,

    },
    "5": {
        name: "goerli",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // 50 gwei Key Hash
        subscriptionId: "0",
        interval: 30
    },
    "137": {
        name: "matic",
        vrfCoordinatorV2: "0xAE975071Be8F8eE67addBC1A82488F1C24858067",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x6e099d640cde6de9d40ac749b4b594126b0169747122711109c9985d47751f93", // 200 gwei Key Hash
        subscriptionId: "0",
        interval: 30
    },
};
export const developmentChains = ["hardhat", "ganache", "localhost"];