import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { Exchange } from "../abstract";
import axios, { AxiosResponse } from "axios";
import { objectIsNotNullOrUndefined } from "../../utils";
import { UniswapChains, PancakeChains } from "../../config";
import { sushiRouterAbi } from "../../interfaces/sushiRouterAbi";
import { Coin, HexString, OnChainSwapCalldata, SushiApiResponse } from "../../@types";


export class Sushi implements Exchange {

    private web3: Web3;
    private chainId: string;
    private maxPriceImpact = "0.005";
    private baseUrl = "https://production.sushi.com/swap/v3.2";

    constructor(
        chainId: number
    ) {
        this.chainId = chainId.toString();
        this.web3 = new Web3(new Web3.providers.HttpProvider(
            {...UniswapChains, ...PancakeChains}[chainId].rpcUrls.default.http[0]
        ));
    }


    private getGasPrice = async (): Promise<string> => {
        return await this.web3.eth.getGasPrice();
    }


    private generateRouteCalldata = async (
        tokenIn: string, tokenOut: string, recipient: string, amountIn: string, gasPrice: string
    ): Promise<OnChainSwapCalldata> => {

        const params = new URLSearchParams({
            chainId: this.chainId,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amount: amountIn,
            maxPriceImpact: this.maxPriceImpact,
            gasPrice: gasPrice,
            to: recipient,
            preferSushi: "true"
        });

        const response: AxiosResponse<SushiApiResponse> = await axios.get(
            `${this.baseUrl}?${params}`
        );

        const routeProcessor = response.data.routeProcessorAddr;
        const routeProcessorArgs = response.data.routeProcessorArgs;
        const amountOut = response.data.routeProcessorArgs.amountOutMin;

        const router = new this.web3.eth.Contract(
            sushiRouterAbi as unknown as AbiItem,
            routeProcessor
        );

        const calldata = router.methods.processRoute(
            routeProcessorArgs.tokenIn,
            routeProcessorArgs.amountIn,
            routeProcessorArgs.tokenOut,
            routeProcessorArgs.amountOutMin,
            routeProcessorArgs.to,
            routeProcessorArgs.routeCode
        ).encodeABI() as HexString;

        return {
            amountOut: amountOut,
            calldata: calldata,
            routerAddress: routeProcessor
        }
    }


    generateCalldataForOnchainSwap = async (
        tokenTo: Coin, tokensFrom: Coin[], recipient: HexString
    ): Promise<OnChainSwapCalldata[]> => {

        const gasPrice = await this.getGasPrice();

        const bestRoutes = await Promise.all(
            tokensFrom.map((tokenFrom) => {
                if (tokenFrom.amountIn) {
                    return this.generateRouteCalldata(
                        tokenTo.address, tokenFrom.address, recipient, tokenFrom.amountIn, gasPrice
                    );
                }
            })
        );

        return bestRoutes.filter(objectIsNotNullOrUndefined<OnChainSwapCalldata>);
    }
}