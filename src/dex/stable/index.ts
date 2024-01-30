import Web3 from "web3";
import { AbiItem } from 'web3-utils';
import stableAbi from "../../interfaces/stable";
import { HexString, StableRequest, StableCalldata } from "../../@types";
import { UniswapChains, PancakeChains, SushiChains, stargateConfig } from "../../config";


export const generateStableCalldata = async (stableRequest: StableRequest): Promise<StableCalldata> => {
    const chainId = stableRequest.chainId;
    const stable = stargateConfig[chainId].stable as HexString;

    const provider = {...UniswapChains, ...PancakeChains, ...SushiChains}[chainId];
    const web3 = new Web3(new Web3.providers.HttpProvider(provider.rpcUrls.default.http[0]));

    const stableContract = new web3.eth.Contract(
        stableAbi as unknown as AbiItem, 
        stable
    );

    const calldata = await stableContract.methods.stableSwapMulticall(
        stableRequest.intermediateToken,
        stableRequest.tokensInAddresses,
        stableRequest.tokensInAmountsIn,
        stableRequest.onChainCalldatas.map((calldata) => calldata.calldata),
        stableRequest.onChainCalldatas.map((calldata) => calldata.routerAddress),
        stableRequest.crossChainCalldata
    ).encodeABI() as HexString;

    return {
        to: stable,
        calldata: calldata
    }
}