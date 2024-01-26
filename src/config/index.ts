import dotenv from "dotenv";
import { getApiKeys } from "../utils";
import { ChainConstants, HexString, Coin } from "../@types";

dotenv.config({path:__dirname.concat('/./../../.env')});


export const WHITE_LIST = ["::1"];
export const portfolioUpdateTime = 60; // 1 minute
export const port = process.env.PORT || 8080;

export const covalentKeys = getApiKeys("covalentKeys.txt", 32);
export const chainbaseKeys = getApiKeys("chainBaseKeys.txt", 27);

// opBNB, zk sync era, polygon zkEVM, Linea
export const PancakeChainId: number[] = [204, 324, 1101, 59144];

// ethereum, optimism, bsc, polygon, base, arbitrum, avalanche
export const UniswapChainId: number[] = [1, 10, 56, 137, 8453, 42161, 43114];

export const ChainbaseChainId: number[] = [43114];

export const CovalentChainId: number[] = [1, 10, 56, 137, 324, 8453, 42161]; // [204, 1101, 59144];

export const CovalentChainIdToString: Record<number, string> = {
    1: "eth-mainnet",
    10: "optimism-mainnet", 
    56: "bsc-mainnet", 
    137: "matic-mainnet",
    204: "bnb-opbnb-mainnet", 
    324: "zksync-mainnet", 
    1101: "polygon-zkevm-mainnet",
    8453: "base-mainnet",
    42161: "arbitrum-mainnet", 
    43114: "avalanche-mainnet",
    59144: "linea-mainnet"
} as const;

export const UniswapChains: Record<number, ChainConstants> = {
    1: {
        id: 1,
        name: "Ethereum",
        network: "eth",
        nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18
        },
        iconUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=029",
        rpcUrls: {
            default: {
                http: ["https://rpc.ankr.com/eth"]
            },
            public: {
                http: ["https://rpc.ankr.com/eth"]
            }
        }
    },
    10: {
        id: 10,
        name: "Optimism",
        network: "optimism",
        nativeCurrency: {
            decimals: 18,
            name: "ETH",
            symbol: "ETH"
        },
        iconUrl: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png?v=029",
        rpcUrls: {
            default: {
                http: ["https://rpc.ankr.com/optimism"]
            },
            public: {
                http: ["https://rpc.ankr.com/optimism"]
            }
        }
    },
    56: {
        id: 56,
        name: "BNB Smart Chain",
        network: "bsc",
        nativeCurrency: {
            decimals: 18,
            name: "BNB",
            symbol: "BNB"
        },
        iconUrl: "https://cryptologos.cc/logos/bnb-bnb-logo.png?v=029",
        rpcUrls: {
            default: {
                http: ["https://rpc.ankr.com/bsc"]
            },
            public: {
                http: ["https://rpc.ankr.com/bsc"]
            }
        }
    },
    137: {
        id: 137,
        name: "Polygon",
        network: "polygon",
        nativeCurrency: {
            decimals: 18,
            name: "MATIC",
            symbol: "MATIC"
        },
        iconUrl: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=029",
        rpcUrls: {
            default: {
                http: ["https://polygon-rpc.com"]
            },
            public: {
                http: ["https://polygon-rpc.com"]
            }
        }
    },
    8453: {
        id: 8453,
        name: "Base",
        network: "base",
        nativeCurrency: {
            decimals: 18,
            name: "ETH",
            symbol: "ETH"
        },
        iconUrl: "https://altcoinsbox.com/wp-content/uploads/2023/02/base-logo-in-blue.png",
        rpcUrls: {
            default: {
                http: ["https://rpc.ankr.com/base"]
            },
            public: {
                http: ["https://rpc.ankr.com/base"]
            }
        }
    },
    42161: {
        id: 42161,
        name: "Arbitrum",
        network: "arbitrum",
        nativeCurrency: {
            decimals: 18,
            name: "ETH",
            symbol: "ETH"
        },
        iconUrl: "https://cryptologos.cc/logos/arbitrum-arb-logo.png?v=029",
        rpcUrls: {
            default: {
                http: ["https://arb1.arbitrum.io/rpc"]
            },
            public: {
                http: ["https://arb1.arbitrum.io/rpc"]
            }
        }
    },
    43114: {
        id: 43114,
        name: "Avalanche",
        network: "avalanche",
        nativeCurrency: {
            decimals: 18,
            name: "AVAX",
            symbol: "AVAX"
        },
        iconUrl: "https://cryptologos.cc/logos/avalanche-avax-logo.png?v=029",
        rpcUrls: {
            default: {
                http: ["https://rpc.ankr.com/avalanche"]
            },
            public: {
                http: ["https://rpc.ankr.com/avalanche"]
            }
        }
    },
} as const;

export const PancakeChains: Record<number, ChainConstants> = {
    324: {
        id: 324,
        name: "zkSync Era Mainnet",
        network: "zkSync Era Mainnet",
        nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18
        },
        iconUrl: "",
        rpcUrls: {
            default: {
                http: ["https://mainnet.era.zksync.io"]
            },
            public: {
                http: ["https://mainnet.era.zksync.io"]
            }
        },
        v2subgraphQlUrl: "https://api.studio.thegraph.com/query/45376/exchange-v2-zksync/version/latest",
        v3subgraphQlUrl: "https://api.studio.thegraph.com/query/45376/exchange-v3-zksync/version/latest"
    },
    204: {
        id: 204,
        name: "opBNB",
        network: "opBNB",
        nativeCurrency: {
            name: "BNB",
            symbol: "BNB",
            decimals: 18
        },
        iconUrl: "",
        rpcUrls: {
            default: {
                http: ["https://opbnb-mainnet-rpc.bnbchain.org"]
            },
            public: {
                http: ["https://opbnb-mainnet-rpc.bnbchain.org"]
            }
        },
        v2subgraphQlUrl: "https://opbnb-mainnet-graph.nodereal.io/subgraphs/name/pancakeswap/exchange-v2",
        v3subgraphQlUrl: "https://opbnb-mainnet-graph.nodereal.io/subgraphs/name/pancakeswap/exchange-v3"
    },
    1101: {
        id: 1101,
        name: "Polygon zkEVM",
        network: "Polygon zkEVM",
        nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18
        },
        iconUrl: "",
        rpcUrls: {
            default: {
                http: ["https://rpc.ankr.com/polygon_zkevm"]
            },
            public: {
                http: ["https://rpc.ankr.com/polygon_zkevm"]
            }
        },
        v2subgraphQlUrl: "https://api.studio.thegraph.com/query/45376/exchange-v2-polygon-zkevm/version/latest",
        v3subgraphQlUrl: "https://api.studio.thegraph.com/query/45376/exchange-v3-polygon-zkevm/version/latest"
    },
    59144: {
        id: 59144,
        name: "Linea",
        network: "Linea",
        nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18
        },
        iconUrl: "",
        rpcUrls: {
            default: {
                http: ["https://rpc.linea.build "]
            },
            public: {
                http: ["https://rpc.linea.build "]
            }
        },
        v2subgraphQlUrl: "https://graph-query.linea.build/subgraphs/name/pancakeswap/exhange-v2",
        v3subgraphQlUrl: "https://graph-query.linea.build/subgraphs/name/pancakeswap/exchange-v3-linea/"
    }
} as const;

export const stargateConfig: Record<number, {chainId: number, router: HexString | "", stable: HexString | ""}> = {
    1: {
        chainId: 101,
        router: "0x8731d54E9D02c286767d56ac03e8037C07e01e98",
        stable: "0x0e0c05599919e188E63aCA61227C114F6Cb7C1c5"
    },
    10: {
        chainId: 111,
        router: "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b",
        stable: "0x8371896b9d2f673e94da3b3873b90b69b8bf9b99"
    },
    56: {
        chainId: 102,
        router: "0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8",
        stable: "0x2C2fbF399374c50AFe3C8be390c37fcC9AC0612A"
    },
    137: {
        chainId: 109,
        router: "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd",
        stable: "0x2f29b5b4b46266418EE98311f5D1FFa56a3954a7" //"0x815Bc64F368b70DAbD53cA433F5d1b35c238d692"
    },
    204: {
        chainId: 0, // Unknown
        router: "", // Unknown
        stable: "" // Not deployed
    },
    324: {
        chainId: 0, // Unknown
        router: "", // Unknown
        stable: "" // Not deployed
    },
    1101: {
        chainId: 0, // Unknown
        router: "", // Unknown
        stable: ""  // Not deployed
    },
    8453: {
        chainId: 184,
        router: "0x45f1a95a4d3f3836523f5c83673c797f4d4d263b",
        stable: "" // Not deployed
    },
    42161: {
        chainId: 110,
        router: "0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614",
        stable: "0x6Df6B0A128353c11DAeDD1DA2496fBf68ef7262e"
    },
    43114: {
        chainId: 106,
        router: "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd",
        stable: "" // Not deployed
    },
    59144: {
        chainId: 183,
        router: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
        stable: "" // Not deployed
    }
} as const;

export const stargateTokens: {[key: number]: {chainId: number, tokens: (Coin & {poolId: number})[]}} = {
    1: {
        chainId: 101,
        tokens: [{
            chainId: 1,
            address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            decimals: 6,
            symbol: "USDC",
            poolId: 1
        },
        {
            chainId: 1,
            address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            decimals: 6,
            symbol: "USDT",
            poolId: 2
        },
        {
            chainId: 1,
            address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            decimals: 18,
            symbol: "DAI",
            poolId: 3
        }]
    },
    10: {
        chainId: 111,
        tokens: [{
            chainId: 10,
            address: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
            decimals: 6,
            symbol: "USDC",
            poolId: 1
        },
        {
            chainId: 10,
            address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
            decimals: 18,
            symbol: "DAI",
            poolId: 3
        }]
    },
    56: {
        chainId: 102,
        tokens: [{
            chainId: 56,
            address: "0x55d398326f99059fF775485246999027B3197955",
            decimals: 18,
            symbol: "USDT",
            poolId: 2
        }]
    },
    137: {
        chainId: 109,
        tokens: [{
            chainId: 137,
            address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            decimals: 6,
            symbol: "USDC",
            poolId: 1
        },
        {
            chainId: 137,
            address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            decimals: 6,
            symbol: "USDT",
            poolId: 2
        },
        {
            chainId: 137,
            address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
            decimals: 18,
            symbol: "DAI",
            poolId: 3
        }]
    },
    8453: {
        chainId: 184,
        tokens: [{
            chainId: 8453,
            address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
            decimals: 6,
            symbol: "USDC",
            poolId: 1
        }]
    },
    42161: {
        chainId: 110,
        tokens: [{
            chainId: 42161,
            address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
            decimals: 6,
            symbol: "USDC",
            poolId: 1
        },
        {
            chainId: 42161,
            address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            decimals: 6,
            symbol: "USDT",
            poolId: 2
        }]
    },
    43114: {
        chainId: 106,
        tokens: [{
            chainId: 43114,
            address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
            decimals: 6,
            symbol: "USDC",
            poolId: 1
        },
        {
            chainId: 43114,
            address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
            decimals: 6,
            symbol: "USDT",
            poolId: 2
        }]
    }
} as const;