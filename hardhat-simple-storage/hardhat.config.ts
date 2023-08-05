import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "./tasks/block-number";
import "hardhat-gas-reporter"
import "solidity-coverage"

import "dotenv/config"

// this is a sample Hardhat task. To learn more about how to create your own go to
// https://hardhat.org/guides/create-task.html
task("balance", "Prints an account's balance").setAction(async () => {});

task("accounts", "Prints a list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log("=====> accounts: ", account.address)
  }
})

const RPC_URL_SEPOLIA: string = process.env.RPC_URL_SEPOLIA || "http://example.etherscan.io";
const PRIVATE_KEY: string = process.env.PRIVATE_KEY ||"0xkey"
const RPC_URL_GANACHE: string = process.env.RPC_URL_GANACHE ||"key"
const PRIVATE_KEY_GANACHE: string = process.env.PRIVATE_KEY_GANACHE ||"key"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY ||"key"

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
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: true,
    outputFile: "report-gas.txt",
    noColors: true,
    // currency: "USD",
    // coinmarketcap: COINMARKETCAP_API_KEY,
    token: "MATIC"
  }
};

export default config;