import { Exchange } from "../abstract";
import { GraphQLClient } from 'graphql-request';
import { Coin, ChainConstants, OnChainSwapCalldata, HexString } from "../../@types";
import { createPublicClient, http, PublicClient } from 'viem';
import { CurrencyAmount, Currency, TradeType, ERC20Token, Percent } from "@pancakeswap/sdk";
import {
    Pool,
    SwapRouter,
    SmartRouter,
    TradeConfig,
    QuoterConfig,
    QuoteProvider,  
    SmartRouterTrade,  
    SMART_ROUTER_ADDRESSES
} from "@pancakeswap/smart-router/evm";


export class PancakeSwap implements Exchange {

    private chain: ChainConstants;
    private publicClient: PublicClient;
    private quoteProvider: QuoteProvider<QuoterConfig>;

    private v2SubgraphClient: GraphQLClient;
    private v3SubgraphClient: GraphQLClient;

    private maxHoopsDefault = 2 as const;
    private maxSplitsDefault = 2 as const;
    private slippageTolerance = 1 as const;


    constructor(
        chain: ChainConstants,
        v2subgraphQlUrl: string,
        v3subgraphQlUrl: string,
    ) {
        this.chain = chain;

        this.publicClient = createPublicClient({
            chain: chain,
            transport: http(chain.rpcUrls.default.http[0]),
            batch: {
              multicall: {
                batchSize: 1024 * 200,
              },
            },
        });

        this.quoteProvider = SmartRouter.createQuoteProvider({
            onChainProvider: () => this.publicClient
        });
        
        this.v2SubgraphClient = new GraphQLClient(v2subgraphQlUrl);
        this.v3SubgraphClient = new GraphQLClient(v3subgraphQlUrl);
    }


    private getAvailablePools = async (currencyA: Currency, currencyB: Currency): Promise<Pool[]> => {
        try {
            const [v2Pools] = await Promise.all([
                SmartRouter.getV2CandidatePools({
                  onChainProvider: () => this.publicClient,
                  v2SubgraphProvider: () => this.v2SubgraphClient,
                  // v3SubgraphProvider: () => this.v3SubgraphClient,
                  currencyA: currencyA,
                  currencyB: currencyB,
                }),
                /*
                SmartRouter.getV3CandidatePools({
                  onChainProvider: () => this.publicClient,
                  subgraphProvider: () => this.v3SubgraphClient,
                  currencyA: currencyA,
                  currencyB: currencyB,
                  subgraphFallback: false,
                }),
                */
            ]);
    
            return [...v2Pools];
        }
        catch (err) { 
            return [];
        }
    }


    private generateBestTrade = async (tokenFrom: Coin, tokenTo: Coin, amountIn: string): Promise<SmartRouterTrade<TradeType> | null> => {
        
        const tokenSwapFrom = new ERC20Token(tokenFrom.chainId, tokenFrom.address, tokenFrom.decimals, tokenFrom.symbol);
        const tokenSwapTo = new ERC20Token(tokenTo.chainId, tokenTo.address, tokenTo.decimals, tokenTo.symbol);

        const quoteProvider = this.quoteProvider;

        const pools = await this.getAvailablePools(tokenSwapFrom, tokenSwapTo);

        const amount = CurrencyAmount.fromRawAmount(tokenSwapFrom, amountIn);

        const config: TradeConfig = {
            gasPriceWei: () => this.publicClient.getGasPrice(),
            maxHops: this.maxHoopsDefault,
            maxSplits: this.maxSplitsDefault,
            poolProvider: SmartRouter.createStaticPoolProvider(pools),
            quoteProvider,
            quoterOptimization: true
        };

        try {
            return await SmartRouter.getBestTrade(amount, tokenSwapTo, TradeType.EXACT_INPUT, config);
        }
        catch (err) {
            return null
        }
    }


    generateCalldataForOnchainSwap = async (tokenTo: Coin, tokensFrom: Coin[], recipient: HexString): Promise<OnChainSwapCalldata[]> => {
        const onChainSwapCalldatas: OnChainSwapCalldata[] = [];
        const chainId = this.chain.id as keyof typeof SMART_ROUTER_ADDRESSES;
        const router = SMART_ROUTER_ADDRESSES[chainId];

        const bestTrades = await Promise.all(
            tokensFrom.map((tokenFrom) => {
                if (tokenFrom.balance) {
                    return this.generateBestTrade(tokenFrom, tokenTo, tokenFrom.balance);
                }
            })
        );
        
        bestTrades.map((bestTrade) => {
            if (bestTrade) {
                const { calldata } = SwapRouter.swapCallParameters(bestTrade, {
                    recipient: recipient,
                    slippageTolerance: new Percent(this.slippageTolerance)
                });

                const onChainSwapCalldata: OnChainSwapCalldata = {
                    calldatas: calldata,
                    routerAddress: router
                }
        
                onChainSwapCalldatas.push(onChainSwapCalldata);
            }
        });

        return onChainSwapCalldatas;
    }
}