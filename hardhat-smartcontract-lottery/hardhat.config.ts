import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// import "@nomiclabs/hardhat-etherscan";
import "hardhat-deploy";
import "hardhat-contract-sizer";

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
};

export default config;
