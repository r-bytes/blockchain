import { readFileSync, writeFileSync } from "fs";
import { ethers, network } from "hardhat";
import { Raffle } from "../typechain-types";
import { DeployFunction } from "hardhat-deploy/types";

const FRONT_END_ADDRESSES_FILE: string = "../nextjs-smartcontract-lottery/constants/contractAddresses.json"
const FRONT_END_ABI_FILE: any = "../nextjs-smartcontract-lottery/constants/abi.json";

interface ICurrentAddresses {  
}

// update contants folder in frontend
const updateFrontend: DeployFunction = async (): Promise<void> => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("=====> updating frontend folders...")
        updateContractAddresses();
        updateABI();
    }
}

const updateABI = async (): Promise<void> => {
    const raffle: Raffle = await ethers.getContract("Raffle");
    console.log("=====> updating ABI in frontend folders...");
    // @ts-ignore
    writeFileSync(FRONT_END_ABI_FILE, raffle.interface.format(ethers.utils.FormatTypes.json));
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
    console.log("=====> updating Contract Addresses in frontend folders...")
    writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses))
}

export default updateFrontend;

updateContractAddresses.tags = ["all", "frontend"]