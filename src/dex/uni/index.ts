import { ethers } from 'ethers';
import { Exchange } from "../abstract";
import { calculateAmountOut } from '../../utils';
import { TradeType, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core';
import { HexString, OnChainSwapCalldata, ChainConstants, Coin } from "../../@types";
import { AlphaRouter, SwapType, SwapOptions, SwapRoute } from '@uniswap/smart-order-router';


export class Uniswap implements Exchange {

    private chain: ChainConstants;
    private provider: ethers.providers.BaseProvider;


    constructor(
        chain: ChainConstants
    ) {
        this.chain = chain;
        this.provider = new ethers.providers.JsonRpcProvider(chain.rpcUrls.default.http[0]);
    }


    private calculateDeadline = (): number => {
        return Math.floor(Date.now() / 1000 + 1800);
    }


    private generateRoute = async (
        tokenTo: Coin, tokenFrom: Coin, recipient: HexString, amountIn: string
    ): Promise<SwapRoute | null> => {
        
        const router = new AlphaRouter({
            chainId: this.chain.id,
            provider: this.provider,
        });
    
        const options: SwapOptions = {
            recipient: recipient,
            slippageTolerance: new Percent(100, 10_000), // numerator: 100, denominator: 10.000, percent: 1%
            deadline: this.calculateDeadline(),
            type: SwapType.SWAP_ROUTER_02,
        }

        const tokenIn = new Token(tokenFrom.chainId, tokenFrom.address, tokenFrom.decimals);
        const tokenOut = new Token(tokenTo.chainId, tokenTo.address, tokenTo.decimals);
    
        const route = await router.route(
            CurrencyAmount.fromRawAmount(
                tokenIn,
                amountIn
            ),
            tokenOut,
            TradeType.EXACT_INPUT,
            options
        );
    
        return route;
    }


    generateCalldataForOnchainSwap = async (tokenTo: Coin, tokensFrom: Coin[], recipient: HexString): Promise<OnChainSwapCalldata[]> => {
        const onChainSwapCalldatas: OnChainSwapCalldata[] = [];

        const bestRoutes = await Promise.all(
            tokensFrom.map((tokenFrom) => {
                if (tokenFrom.amountIn) {
                    return this.generateRoute(tokenTo, tokenFrom, recipient, tokenFrom.amountIn);
                }
            })
        );

        bestRoutes.map((bestRoute) => {
            if (bestRoute) {
                const router = bestRoute.methodParameters?.to as HexString;
                const calldata = bestRoute.methodParameters?.calldata as HexString;
                
                const amountOut = calculateAmountOut(
                    BigInt(bestRoute.quote.numerator.toString()),
                    BigInt(bestRoute.quote.denominator.toString()),
                    BigInt(bestRoute.quote.decimalScale.toString())
                );

                if (router && calldata) {
                    const onChainSwapCalldata: OnChainSwapCalldata = {
                        calldata: calldata,
                        routerAddress: router,
                        amountOut: amountOut,
                        tokenInAmountIn: "0",
                        tokenInAddress: "0x0000000000000000000000000000000000000000"
                    }

                    onChainSwapCalldatas.push(onChainSwapCalldata);
                }
            }
        });

        return onChainSwapCalldatas;
    }
}