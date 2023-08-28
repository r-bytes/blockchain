import { Address } from "hardhat-deploy/dist/types";

interface NetworkConfig {
    [key: string]: NetworkConfigItem;
}
interface NetworkConfigItem {
    name: string;
    vrfCoordinatorV2: Address;
}

export const networkConfig: NetworkConfig = {
    "1": {
        name: "main",
        vrfCoordinatorV2: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909",
    },
    "11155111": {
        name: "sepolia",
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    },
    "5": {
        name: "goerli",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    },
    "137": {
        name: "matic",
        vrfCoordinatorV2: "0xAE975071Be8F8eE67addBC1A82488F1C24858067",
    },
    "31337": {
        name: "hardhat",
        vrfCoordinatorV2: "0x",
    },
};
export const developmentChains = ["hardhat", "ganache", "localhost"];