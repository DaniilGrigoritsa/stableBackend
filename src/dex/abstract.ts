import { Coin, HexString, OnChainSwapCalldata } from "../@types";


export abstract class Exchange {
    abstract generateCalldataForOnchainSwap: (
        tokenTo: Coin, 
        tokensFrom: Coin[], 
        recipient: HexString
    ) => Promise<OnChainSwapCalldata[]>;
}