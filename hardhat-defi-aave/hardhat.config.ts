import "@nomicfoundation/hardhat-toolbox"
import "hardhat-deploy"
import { HardhatUserConfig } from "hardhat/config"

import "dotenv/config"

const RPC_URL_SEPOLIA: string = process.env.RPC_URL_SEPOLIA || ""
const RPC_URL_MAINNET: string = process.env.RPC_URL_MAINNET!
const PRIVATE_KEY: string = process.env.PRIVATE_KEY || ""
const RPC_URL_GANACHE: string = process.env.RPC_URL_GANACHE || ""
const PRIVATE_KEY_GANACHE: string = process.env.PRIVATE_KEY_GANACHE || ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY!

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.19",
            },
            {
                version: "0.6.12",
            },
            {
                version: "0.4.19",
            },
        ],
    },
    mocha: {
        timeout: 200000,
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            // gasPrice: 130000000000,
            forking: {
                url: RPC_URL_MAINNET,
            },
        },
        sepolia: {
            chainId: 11155111,
            url: RPC_URL_SEPOLIA,
            accounts: [PRIVATE_KEY],
        },
        ganache: {
            chainId: 1337,
            url: RPC_URL_GANACHE,
            accounts: [PRIVATE_KEY_GANACHE],
        },
        localhost: {
            chainId: 31337,
            url: "http://127.0.0.1:8545/",
        },
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
        },
        customChains: [],
    },
    gasReporter: {
        enabled: false,
        outputFile: "report-gas.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
        // token: "MATIC",
    },
    namedAccounts: {
        deployer: {
            default: 0, // this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
}

export default config
