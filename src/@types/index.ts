type ChainNativeCurrency = {
    name: string
    symbol: string
    decimals: number
}

type ChainRpcUrls = {
    http: readonly string[]
    webSocket?: readonly string[]
}

export type HexString = `0x${string}`;

export type Coin = {
    chainId: number
    address: HexString
    decimals: number
    symbol: string
    balance?: string
    iconUrl?: string
    usdPrice?: number
}

export type ChainConstants = {
    id: number
    name: string
    /**
     * Internal network name
     * @deprecated will be removed in v2 - use `id` instead.
     */
    network: string
    /** Currency used by chain */
    nativeCurrency: ChainNativeCurrency
    /** Collection of RPC endpoints */
    rpcUrls: {
      [key: string]: ChainRpcUrls
      default: ChainRpcUrls
      public: ChainRpcUrls
    },
    v2subgraphQlUrl?: string,
    v3subgraphQlUrl?: string
}

export type Portfolio = {
    tokens: Coin[][]
    updateTime: number
}

export type PortfolioHistory = {
    updateTime: number
    portfolioHistory: number[]
}

export type PortfolioHistoryKey = `${HexString}:${number}`;

export type PortfolioRequest = {
    address: HexString
}

export type PortfolioHistoryRequest = {
    chainId: number
    address: HexString
}

export type OnChainRequest = {
    chainId: number
    tokenTo: Coin 
    tokensFrom: Coin[] 
    recipient: HexString
}

export type CrossChainRequest = {
    tokenFromId: number 
    tokenToId: number 
    recipient: HexString
    srcChainId: number
    dstChainId: number
}

export type OnChainSwapCalldata = {
    calldatas: HexString
    routerAddress: HexString
}

export type CrossChainSwapCalldata = {
    calldata: HexString
    gasOnDstChain: HexString
}
  