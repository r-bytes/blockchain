// prettier-ignore
import { Contract, ContractFactory, ContractFunction, Wallet, ethers, } from "ethers";
import {
  Block,
  BlockTag,
  Filter,
  FilterByBlockHash,
  Listener,
  Log,
  Provider,
  TransactionReceipt,
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/abstract-provider"

import * as fs from "fs-extra"
import "dotenv/config"

async function main(): Promise<void> {
  // url
  const providerUrl: string = process.env.RPC_URL
  // provider
  // prettier-ignore
  const provider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider(providerUrl);
  // wallet
  const wallet: Wallet = new Wallet(process.env.PRIVATE_KEY!, provider)
  // const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf-8")
  // let wallet: Wallet = new Wallet.fromEncryptedJsonSync(
  //   encryptedJson,
  //   process.env.PRIVATE_KEY_PASSWORD
  // );
  const abi: string = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.abi",
    "utf8",
  )
  const binary: string = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8",
  )

  const contractFactory = new ContractFactory(abi, binary, wallet)
  console.log("====> Deploying, please wait...")

  // /* deploy options */
  const deploymentOptions = {
    gasLimit: 2000000,
  }

  /* deploy the actual contract */
  const contract: Contract = await contractFactory.deploy(deploymentOptions)
  console.log("=====> contract", contract)
  console.log("=====> contract address", contract.address)

  // prettier-ignore
  const transactionReceipt: ethers.providers.TransactionReceipt =
    await contract.deployTransaction.wait(1)

  console.log(
    "=====> This is the deployment transaction (transaction response): ",
  )
  console.log(contract.deployTransaction)

  console.log("=====> This is the transaction receipt (after first block): ")
  console.log(transactionReceipt)

  // /* DEPLOY WITH ONLY DATA */
  // console.log("=> deploy with only data (unlimited flexibility):")
  // const tx = {
  //   nonce: 0,
  //   gasPrice: 20000000000,
  //   gasLimit: 6721975,
  //   to: null,
  //   value: 0,
  //   data: "",
  //   chainId: 1337
  // }

  // /*
  // const signedTxResponse = await wallet.signTransaction(tx);
  // console.log(signedTxResponse)
  //   */
  // const sendTxResponse = await wallet.sendTransaction(tx);
  // await sendTxResponse.wait(1)

  // console.log(sendTxResponse)

  /* interact with contract functions */
  // retrieve initial favorite number
  const currentFavoriteNumber: ContractFunction = await contract.retrieve()
  console.log(
    "=====> currentFavoriteNumber is: ",
    currentFavoriteNumber.toString(),
  )

  // store a new favorite number
  const txResponse: TransactionResponse = await contract.store("7")
  const txReceipt: TransactionReceipt = await txResponse.wait(1)

  // retrieve the updated favorite number
  const updatedFavoriteNumber: ContractFunction = await contract.retrieve()
  console.log(
    "=====> updatedFavoriteNumber is: ",
    updatedFavoriteNumber.toString(),
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
