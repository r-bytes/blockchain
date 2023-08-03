import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";

import "dotenv/config"

const RPC_URL_SEPOLIA: string = process.env.RPC_URL_SEPOLIA!
const PRIVATE_KEY: string = process.env.PRIVATE_KEY!
const RPC_URL_GANACHE: string = process.env.RPC_URL_GANACHE!
const PRIVATE_KEY_GANACHE: string = process.env.PRIVATE_KEY_GANACHE!
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY!

const config: HardhatUserConfig = {
  solidity: "0.8.19",
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
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
};

export default config;