import Web3 from "web3";
import { AbiItem } from 'web3-utils';
import erc20Abi from "../../interfaces/erc20";
import { objectIsNotNullOrUndefined } from "../../utils";
import { ApproveRequest, ApproveCalldata, HexString } from "../../@types";
import { UniswapChains, PancakeChains, SushiChains, stargateConfig } from "../../config";


const calculateAmountInRequired = (allowance: string, amountIn: string): string => {
    const allowanceBn = BigInt(allowance);
    const amountInBn = BigInt(amountIn);

    if (amountInBn > allowanceBn)
        return (amountInBn).toString();
    else
        return "0";
}


export const generateApproveCalldata = async (
    chainId: number, owner: HexString, tokens: ApproveRequest["tokens"]
): Promise<ApproveCalldata[]> => {
    const stable = stargateConfig[chainId].stable;
    const provider = {...UniswapChains, ...PancakeChains, ...SushiChains}[chainId];
    const web3 = new Web3(new Web3.providers.HttpProvider(provider.rpcUrls.default.http[0]));

    const calldataPromises = tokens.map(async (token) => {
        const tokenContract = new web3.eth.Contract(
            erc20Abi as unknown as AbiItem, 
            token.address
        );

        const allowance = await tokenContract.methods.allowance(owner, stable).call();

        if (token.amountIn && token.amountIn !== "0") {
            const amountIn = calculateAmountInRequired(allowance, token.amountIn);

            if (amountIn !== "0") {
                const calldata = await tokenContract.methods.approve(
                    stable, amountIn
                ).encodeABI() as HexString;
        
                return {
                    to: token.address,
                    symbol: token.symbol,
                    calldata: calldata
                }
            }
        }
    });

    return (await Promise.all(calldataPromises)).filter(objectIsNotNullOrUndefined<ApproveCalldata>);
}