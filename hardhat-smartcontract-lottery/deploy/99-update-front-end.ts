import { readFileSync, writeFileSync } from "fs";
import { ethers, network } from "hardhat";
import { Raffle } from "../typechain-types";

const FRONT_END_ADDRESSES_FILE: string = "../nextjs-smartcontract-lottery/constants/contractAddresses.json"
const FRONT_END_ABI_FILE: any = "../nextjs-smartcontract-lottery/constants/abi.json";

interface ICurrentAddresses {  
}

// update contants folder in frontend
const updateFrontend = async (): Promise<void> => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("=====> updating frontend folders...")
        updateContractAddresses();
        updateABI();
    }
}

const updateABI = async (): Promise<void> => {
    const raffle: Raffle = await ethers.getContract("Raffle");
    writeFileSync(FRONT_END_ABI_FILE, JSON.stringify(raffle.interface));
}

const updateContractAddresses = async (): Promise<void> => {
    const raffle: Raffle = await ethers.getContract("Raffle");
    const chainId: string = network.config.chainId!.toString();
    const currentAddresses = JSON.parse(readFileSync(FRONT_END_ADDRESSES_FILE, "utf8"));

    if (chainId in currentAddresses) {
        if (!currentAddresses[chainId].includes(raffle.address)) {
            currentAddresses[chainId].push(raffle.address);
        }

    } {
        currentAddresses[chainId] = raffle.address;
    }
    writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses))
}

export default updateContractAddresses

updateContractAddresses.tags = ["all", "frontend"]