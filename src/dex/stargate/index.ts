import Web3 from "web3";
import { AbiItem } from 'web3-utils';
import { stargateConfig } from "../../config";
import { HexString, CrossChainSwapCalldata } from "../../@types";
import StargateRouterAbi from "../../interfaces/stargateRouter";


export class Stargate {

    private web3: Web3;
    private functionType: number = 1; 

    constructor(
        httpProvider: string
    ) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(httpProvider));
    }


    private getGasOnDstChainValue = async (srcChain: number, dstChain: number, recipient: HexString): Promise<HexString> => {
        const router = stargateConfig[srcChain as keyof typeof stargateConfig].router;
        const dstChainId = stargateConfig[dstChain as keyof typeof stargateConfig].chainId;
        
        const stargateRouter = new this.web3.eth.Contract(
            StargateRouterAbi as unknown as AbiItem,
            router
        );
        
        const fees = await stargateRouter.methods.quoteLayerZeroFee(
            dstChainId,
            this.functionType,
            recipient,
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            [0, 0, "0x0000000000000000000000000000000000000001"]
        ).call();

        return this.web3.utils.toHex(fees["0"]) as HexString;
    }


    generateCalldataForCrosschainSwap = async (
        tokenFromId: number,
        tokenToId: number,  
        recipient: HexString,
        srcChainId: number,
        dstChainId: number
    ): Promise<CrossChainSwapCalldata> => {
        if (srcChainId !== dstChainId) {
            const calldata = this.web3.eth.abi.encodeParameters(
                ["uint16","uint256","uint256","address",[["uint256","uint256","bytes"]],"bytes","bytes"],
                [
                    dstChainId,
                    tokenFromId,
                    tokenToId,
                    recipient,
                    [0, 0, "0x0000000000000000000000000000000000000001"],
                    recipient,
                    "0x0000000000000000000000000000000000000000000000000000000000000000"
                ]
            );

            const value = await this.getGasOnDstChainValue(srcChainId, dstChainId, recipient);

            const data: CrossChainSwapCalldata = {
                calldata: calldata as HexString,
                gasOnDstChain: value
            }

            return data;
    
        }
        else {
            const data: CrossChainSwapCalldata = {
                calldata: "0x",
                gasOnDstChain: "0x"
            }

            return data;
        }
            
    }
};