export const CHAINS = {
    ethereum: {
        api: "https://api.etherscan.io/api",
        apiKeyEnv: "ETHERSCAN_API_KEY",
    },
    polygon: {
        api: "https://api.polygonscan.com/api",
        apiKeyEnv: "POLYGONSCAN_API_KEY",
    },
} as const;