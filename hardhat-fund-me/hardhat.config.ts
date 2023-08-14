import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

import "dotenv/config";

// prettier-ignore
const RPC_URL_SEPOLIA: string = process.env.RPC_URL_SEPOLIA || "https://eth-sepolia.g.alchemy.com/v2/{APIKEY}"
const PRIVATE_KEY: string =
    process.env.PRIVATE_KEY || "01010101010101010101010101010101001";
const RPC_URL_GANACHE: string =
    process.env.RPC_URL_GANACHE || "0x01010101010101010101010101010101001";
const PRIVATE_KEY_GANACHE: string =
    process.env.PRIVATE_KEY_GANACHE || "01010101010101010101010101010101001";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY!;

const config: HardhatUserConfig = {
    // solidity: "0.8.19",
    solidity: {
        compilers: [{ version: "0.8.19" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {},
        sepolia: {
            url: RPC_URL_SEPOLIA,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
        },
        ganache: {
            url: RPC_URL_GANACHE,
            accounts: [PRIVATE_KEY_GANACHE],
            chainId: 1337,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "report-gas.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
        // token: "MATIC",
    },
    namedAccounts: {
        deployer: {
            default: 0,
            // 11155111: 1,
        },
        user: {
            default: 1,
        },
    },
};

export default config;
