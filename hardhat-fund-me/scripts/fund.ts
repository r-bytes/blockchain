import { ContractTransactionResponse } from "ethers";
import { ethers, getNamedAccounts } from "hardhat";
import { FundMe } from "../typechain-types";

const main: Function = async () => {
    const { deployer } = await getNamedAccounts();
    const fundMe: FundMe = await ethers.getContractAt("FundMe", deployer);

    console.log("====> funding contract...");

    const txResponse: ContractTransactionResponse = await fundMe.fund({
        value: ethers.parseEther("0.1"),
    });

    await txResponse.wait(1);

    console.log("=====> funded!");
};

main()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error);
        process.exit(1);
    });
