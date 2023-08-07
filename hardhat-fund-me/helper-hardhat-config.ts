interface NetworkConfig {
  [key: string]: NetworkConfigItem
}
interface NetworkConfigItem {
  name: string
  ethUsdPriceFeed: string
}

export const networkConfig: NetworkConfig = {
  "1": {
    name: "main",
    ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  },
  "11155111": {
    name: "sepolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
  "5": {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
  "137": {
    name: "matic",
    ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
  },
  "31337": {
    name: "hardhat",
    ethUsdPriceFeed: "0x",
  },
}
export const developmentChains = ["hardhat", "ganache", "localhost"]
export const DECIMALS = 8
export const INITIAL_ANSWER = 200000000000
