import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers, network } from "hardhat"
import { networkConfig } from "../helper-hardhat-config"
import { ILendingPool } from "../typechain-types"
import { AMOUNT, getWeth } from "./getWeth"
import { ContractTransactionResponse } from "ethers"

const main: Function = async (): Promise<void> => {
    // get signers
    const accounts: HardhatEthersSigner[] = await ethers.getSigners()
    const deployer: HardhatEthersSigner = accounts[0]

    // the protocol treats everything as an ERC20 token
    await getWeth()

    // lendingpool interface
    const lendingPool: ILendingPool = await getLendingPool(deployer)
    const lendingPoolAddress: string = await lendingPool.getAddress()
    console.log(`lending pool address is: ${await lendingPool.getAddress()}`)

    // deposit
    const wethTokenaddress: string =
        networkConfig[network.config!.chainId!].wethToken!

    // approve token
    await approveERC20(wethTokenaddress, lendingPoolAddress, AMOUNT, deployer)
    console.log("depositing...")

    // deposit token
    await lendingPool.deposit(wethTokenaddress, AMOUNT, deployer, 0)
    console.log("depsited!")

    // how much have we borrowed, do we have available to borrow and do we have in collateral
    // user data
    let { totalDebtETH, availableBorrowsETH } = await getBorrowUserData(
        lendingPool,
        deployer
    )

    // get latest price
    const daiPrice: bigint = await getDaiPrice()

    // amount to borrow
    const amountDaiToBorrow: number =
        +availableBorrowsETH.toString() * 0.95 * (1 / Number(daiPrice))
    const amountDaiToBorrowWei: bigint = ethers.parseEther(
        amountDaiToBorrow.toString()
    )
    console.log(`you can borrow ${amountDaiToBorrow} DAI`)

    // borrow
    await borrowDai(
        networkConfig[network.config!.chainId!].daiToken!,
        lendingPool,
        amountDaiToBorrowWei.toString(),
        deployer
    )

    // print user data again
    await getBorrowUserData(lendingPool, deployer)
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
    const lendingPoolAddress = (
        await lendingPoolAddressProvider.getLendingPool()
    ).toString()

    console.log("getting contract")
    const lendingPoolContract: ILendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    )

    console.log("done")
    return lendingPoolContract
}

const approveERC20 = async (
    erc20Address: string,
    spenderAddress: string,
    amountToSpend: string,
    account: HardhatEthersSigner
): Promise<void> => {
    const ERC20Token = await ethers.getContractAt(
        "IERC20",
        erc20Address,
        account
    )
    const tx = await ERC20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("approved!")
}

const getBorrowUserData = async (
    lendingPool: ILendingPool,
    account: HardhatEthersSigner
): Promise<{ totalDebtETH: bigint; availableBorrowsETH: bigint }> => {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)
    console.log(`you have ${totalCollateralETH} worth of ETH deposited`)
    console.log(`you have ${totalDebtETH} worth of ETH borrowed`)
    console.log(`you can borrow ${availableBorrowsETH} worth of ETH`)

    return { totalDebtETH, availableBorrowsETH }
}

const getDaiPrice = async (): Promise<bigint> => {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        networkConfig[network.config!.chainId!].daiEthPriceFeed!
    )
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`DAI/ETH latest price is ${price}`)

    return price
}

const borrowDai = async (
    daiAddress: string,
    lendingPool: ILendingPool,
    ammountDaiToBorrowDai: string,
    account: HardhatEthersSigner
): Promise<void> => {
    console.log("borowing...", daiAddress, ammountDaiToBorrowDai,account.address)
    const borrowTx: ContractTransactionResponse = await lendingPool.borrow(
        daiAddress,
        ammountDaiToBorrowDai,
        1, // interest rate: 1 stable, 2 variable
        0, // referal: 0 none
        account.address
    )
    await borrowTx.wait(1)
    console.log(`successfully borrowed DAI!`)
}

main()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error)
        process.exit(1)
    })
