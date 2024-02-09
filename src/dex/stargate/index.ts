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


    private getGasOnDstChainValue = async (srcChain: number, dstChain: number, recipient: HexString): Promise<string> => {
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

        return fees["0"];
    }


    generateCalldataForCrosschainSwap = async (
        tokenFromId: number,
        tokenToId: number,  
        recipient: HexString,
        srcChain: number,
        dstChain: number
    ): Promise<CrossChainSwapCalldata> => {
        if (srcChain !== dstChain && srcChain in stargateConfig && dstChain in stargateConfig) {
            const router = stargateConfig[srcChain as keyof typeof stargateConfig].router;
            const dstChainId = stargateConfig[dstChain as keyof typeof stargateConfig].chainId;

            const calldata = this.web3.eth.abi.encodeParameters(
                ["uint16","uint256","uint256","address",[["uint256","bytes","uint256"]],"bytes","bytes"],
                [
                    dstChainId,
                    tokenFromId,
                    tokenToId,
                    recipient,
                    [0, "0x0000000000000000000000000000000000000001", 0],
                    recipient,
                    "0x"
                ]
            );

            const value = await this.getGasOnDstChainValue(srcChain, dstChain, recipient);

            const data: CrossChainSwapCalldata = {
                calldata: calldata as HexString,
                router: router as HexString,
                gasOnDstChain: value
            }

            return data;
    
        }
        else {
            return { calldata: "0x", gasOnDstChain: "0", router: "0x0000000000000000000000000000000000000000" }
        }
            
    }
};