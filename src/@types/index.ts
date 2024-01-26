type ChainNativeCurrency = {
    name: string
    symbol: string
    decimals: number
}

type ChainRpcUrls = {
    http: readonly string[]
    webSocket?: readonly string[]
}


/* General types */

export type HexString = `0x${string}`;

export type Coin = {
    chainId: number
    address: HexString
    decimals: number
    symbol: string
    balance?: string
    iconUrl?: string
    usdPrice?: number
    amountIn?: string
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
    iconUrl: string,
    v2subgraphQlUrl?: string,
    v3subgraphQlUrl?: string
}

export type Network = {
    id: string
    name: string
    chainId: number
    iconUrl: string
    balance: number
    percent: string
    tokens: Coin[]
}


/* API request types */

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
}

export type CrossChainRequest = {
    tokenFromId: number 
    tokenToId: number 
    srcChainId: number
    dstChainId: number
}

export type ApproveRequest = {
    chainId: number
    owner: HexString
    tokens: Pick<Coin, "address" | "amountIn">[]
}

export type StableRequest = {
    chainId: number
    intermediateToken: HexString
    tokensInAmountsIn: string[]
    tokensInAddresses: HexString[]
    onChainCalldatas: Omit<OnChainSwapCalldata, "amountOut">[]
    crossChainCalldata: HexString
}


/* API return types */

export type Portfolio = {
    updateTime: number
    networks: Network[]
}

export type PortfolioHistory = {
    updateTime: number
    totalValue: string
    valueChange: string
    portfolioHistory: number[]
}

export type PortfolioHistoryKey = `${HexString}:${number}`;

export type OnChainSwapCalldata = {
    amountOut: string
    calldata: HexString
    routerAddress: HexString
}

export type CrossChainSwapCalldata = {
    calldata: HexString
    gasOnDstChain: string
    router: HexString
}

export type ApproveCalldata = {
    to: HexString, 
    calldata: HexString
};

export type StableCalldata = {
    to: HexString,
    calldata: HexString
}

export type SushiApiResponse = {
    status: string
    routeProcessorAddr: HexString
    routeProcessorArgs: {
        tokenIn: HexString
        amountIn: string
        tokenOut: HexString
        amountOutMin: string
        to: HexString
        routeCode: HexString
        value: string
    }
}