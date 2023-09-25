import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers, network } from "hardhat"
import { networkConfig } from "../helper-hardhat-config"
import { ILendingPool } from "../typechain-types"
import { getWeth, AMOUNT } from "./getWeth"

const main: Function = async (): Promise<void> => {
    // get signers
    const accounts: HardhatEthersSigner[] = await ethers.getSigners()
    const deployer: HardhatEthersSigner = accounts[0]
    
    // the protocol treats everything as an ERC20 token
    await getWeth()

    // lendingpool
    const lendingPool = await getLendingPool(deployer)
    const lendingPoolAddress: string = await lendingPool.getAddress()
    console.log(`lending pool address is: ${await lendingPool.getAddress()}`)

    // deposit
    const wethTokenaddress: string = networkConfig[network.config!.chainId!].wethToken!

    // approve
    await approveERC20(wethTokenaddress, lendingPoolAddress, AMOUNT, deployer)
    console.log("depositing...")
    await lendingPool.deposit(wethTokenaddress, AMOUNT, deployer, 0)
    console.log("depsited!")
}

const getLendingPool = async (
    account: HardhatEthersSigner
): Promise<ILendingPool> => {
    // provider
    console.log("getting provider")
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        networkConfig[network.config!.chainId!].lendingPoolAddressesProvider!,
        account
    )
        
    // lending pool
    console.log("getting lending pool")
    const lendingPoolAddress = (await lendingPoolAddressProvider.getLendingPool()).toString()
    
    console.log("getting contract")
    const lendingPoolContract = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    )

    console.log("done")
    return lendingPoolContract
}

const approveERC20 = async (erc20Address: string, spenderAddress: string, amountToSpend: string, account: HardhatEthersSigner) => {
    const ERC20Token = await ethers.getContractAt("IERC20", erc20Address, account)
    const tx = await ERC20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("approved!")
}

main()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error)
        process.exit(1)
    })
