import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// import "@nomiclabs/hardhat-ethers";
// import "@nomiclabs/hardhat-etherscan";
import "hardhat-deploy";
// import "hardhat-contract-sizer";
// import "hardhat-gas-reporter";
// import "solidity-coverage";

import "dotenv/config";

// prettier-ignore
const RPC_URL_SEPOLIA: string = process.env.RPC_URL_SEPOLIA || "https://eth-sepolia.g.alchemy.com/v2/{APIKEY}"
const PRIVATE_KEY: string = process.env.PRIVATE_KEY || "01010101010101010101010101010101001";
// prettier-ignore
const RPC_URL_GANACHE: string = process.env.RPC_URL_GANACHE || "0x01010101010101010101010101010101001";
// prettier-ignore
const PRIVATE_KEY_GANACHE: string = process.env.PRIVATE_KEY_GANACHE || "01010101010101010101010101010101001";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY!;

const config: HardhatUserConfig = {
    solidity: "0.8.19",
    mocha: {
        timeout: 200000
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
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
};

export default config;
