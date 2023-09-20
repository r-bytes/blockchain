interface NetworkConfig {
    [key: string]: NetworkConfigItem
}
interface NetworkConfigItem {
    name: string
    ethUsdPriceFeedAddress?: string
    blockConfirmations?: number
}

export const networkConfig: NetworkConfig = {
    "31337": {
        name: "hardhat",
        blockConfirmations: 1,
    },
    "1": {
        name: "main",
        ethUsdPriceFeedAddress: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        blockConfirmations: 6,
    },
    "11155111": {
        name: "sepolia",
        ethUsdPriceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        blockConfirmations: 6,
    },
    "5": {
        name: "goerli",
        ethUsdPriceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        blockConfirmations: 6,
    },
    "137": {
        name: "matic",
        ethUsdPriceFeedAddress: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
        blockConfirmations: 6,
    },
}
export const INITIAL_SUPPLY = "1000000000000000000000"
export const developmentChains = ["hardhat", "ganache", "localhost"]

// ! price feed contract addresses can be obtained here: https://docs.chain.link/data-feeds/price-feeds/addresses
