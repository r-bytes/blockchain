import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { TransactionResponse } from "ethers"
import { ethers, network, getNamedAccounts } from "hardhat"
import { networkConfig } from "../helper-hardhat-config"

export const AMOUNT = ethers.parseEther("0.1").toString()

const getWeth = async (): Promise<void> => {
    const accounts: HardhatEthersSigner[] = await ethers.getSigners()
    const deployer: HardhatEthersSigner = accounts[0]
    console.log(`deployer is: ${deployer.address}`)
    // call deposit function on WETH contract
    // abi, contract address
    const iWeth = await ethers.getContractAt(
        "IWeth",
        networkConfig[network.config!.chainId!].wethToken!,
        deployer
    )

    const transactionResponse: TransactionResponse = await iWeth.deposit({
        value: AMOUNT,
    })

    await transactionResponse.wait(1)
    const wethBalance: bigint = await iWeth.balanceOf(await deployer.getAddress())
    console.log(`we now have got ${wethBalance} WETH`)
}

export { getWeth }

