import { ethers } from "ethers";
import * as fs from "fs-extra";
import "dotenv/config";

async function main() {
  const providerUrl: string = "http://127.0.0.1:7545";
  const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
    providerUrl
  );
  const wallet: ethers.Wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY!,
    provider
  );
  const abi: string = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.abi",
    "utf8"
  );
  const binary: string = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8"
  );

  const contractFactory: ethers.ContractFactory<any[], ethers.BaseContract> =
    new ethers.ContractFactory(abi, binary, wallet);
  console.log("=> Deploying, please wait...");

  const deploymentOptions = {
    gasLimit: 2000000,
  };

  // deploy the actual contract
  const contract: ethers.BaseContract & {
    deploymentTransaction(): ethers.ContractTransactionResponse;
  } & Omit<ethers.BaseContract, keyof ethers.BaseContract> =
    await contractFactory.deploy(deploymentOptions);

  console.log("=> contract", contract);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
