import { RedisClient } from "../database";
import { Exchange } from "../dex/abstract";
import { PortfolioManager } from "../portfolio";
import { Request, Response, NextFunction } from "express";
import { Sushi, Uniswap, Stargate, PancakeSwap } from "../dex";
import { 
    WHITE_LIST, 
    SushiChains,
    SushiChiainId,
    UniswapChainId, 
    PancakeChainId, 
    UniswapChains, 
    PancakeChains, 
    stargateConfig 
} from "../config";
import {
    StableRequest,
    OnChainRequest, 
    ChainConstants, 
    ApproveRequest,
    PortfolioRequest,
    CrossChainRequest, 
    PortfolioHistoryRequest,
} from "../@types";
import { generateStableCalldata } from "../dex/stable";
import { generateApproveCalldata } from "../dex/approve";


const getRequestIp = (req: Request): string | undefined => {
    return req.headers['X-Real-IP'] as string || req.socket.remoteAddress;
}


const chainIsSupported = (chainId: number): boolean => {
    return (chainId in stargateConfig && [...UniswapChainId, ...PancakeChainId, ...SushiChiainId].includes(chainId));
}


export const whiteList = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const ip = getRequestIp(req);
        if (ip && WHITE_LIST.includes(ip))
            next();
        else
            res.send(403).send('Access Forbidden');
    }
}


export const operatePortfolioHistoryRequest = (redis: RedisClient, portfolioManager: PortfolioManager) => {
    return async (req: Request, res: Response): Promise<void> => {
        const data: PortfolioHistoryRequest = req.body.data;

        const portfolioHistory = await redis.getPortfolioHistoryByAddress(data.address);
        
        if (portfolioHistory) {
            res.status(200).send(portfolioHistory);
        }
        else {
            const fetchedPortfolioHistory = await portfolioManager.getTotalHistoricalPortfolioValue(data.address);
            await redis.setPortfolioHistoryByAddress(data.address, fetchedPortfolioHistory);
            res.status(200).send(fetchedPortfolioHistory);
        }
    }
}


export const operatePortfolioRequest = (redis: RedisClient, portfolioManager: PortfolioManager) => {
    return async (req: Request, res: Response): Promise<void> => {
        const data: PortfolioRequest = req.body.data;
        
        const portfolio = await redis.getPortfolioByAddress(data.address);

        if (portfolio) {
            res.status(200).send(portfolio);
        }
        else {
            const fetchedPortfolio = await portfolioManager.getPortfolio(data.address);
            await redis.setPorfolioByAddress(data.address, fetchedPortfolio);
            res.status(200).send(fetchedPortfolio);
        }
    }
}


export const operateGenOnChainCalldataRequest = () => {
    return async (req: Request, res: Response): Promise<void> => {
        const data: OnChainRequest = req.body.data;
        const chainId = data.chainId;

        const recipient = stargateConfig[chainId].stable;
        const tokensFrom = data.tokensFrom.filter((token) => token.symbol !== data.tokenTo.symbol);

        if (!recipient) {
            res.status(501).send(`Recipient is undefined`);
            return
        }

        let exchange: Exchange | null = null;
        
        if (UniswapChainId.includes(chainId)) {
            const chain = UniswapChains[chainId];
            if (chain)
                exchange = new Uniswap(chain);
        } 
        else if (PancakeChainId.includes(chainId)) {
            const chain = PancakeChains[chainId];
            if (chain && chain.v2subgraphQlUrl && chain.v3subgraphQlUrl)
                exchange = new PancakeSwap(chain, chain.v2subgraphQlUrl, chain.v3subgraphQlUrl);
        }
        else if (SushiChiainId.includes(chainId)) {
            exchange = new Sushi(chainId);
        }
        else {
            res.status(500).send(`Unsupported chain id: ${chainId}`);
            return;
        }

        if (exchange) {

            console.log("Generate on chain calldata...")

            const calldata = await exchange.generateCalldataForOnchainSwap(
                data.tokenTo, tokensFrom, recipient
            );

            console.log("On chain calldata", calldata)

            res.status(200).send(calldata);
        }
    }
}


export const operateGenCrossChainCalldataRequest = () => {
    return async (req: Request, res: Response): Promise<void> => {
        const data: CrossChainRequest = req.body.data;

        const chainId = data.srcChainId;
        
        let chain: Pick<ChainConstants, "rpcUrls"> | null = null;
        if (UniswapChainId.includes(chainId)) {
            chain = UniswapChains[chainId];
        }
        else if (PancakeChainId.includes(chainId)) {
            chain = PancakeChains[chainId];
        }
        else if (SushiChiainId.includes(chainId)) {
            chain = SushiChains[chainId];
        }
        
        if (chain) {
            const stargate = new Stargate(chain.rpcUrls.default.http[0]);

            const calldata = await stargate.generateCalldataForCrosschainSwap(
                data.tokenFromId, data.tokenToId, data.recipient, chainId, data.dstChainId
            );

            res.status(200).send(calldata);
        }
        else
            res.status(500).send(`Unsupported chain id: ${chainId}`);
    }
}


export const operateGenApproveCalldata = () => {
    return async (req: Request, res: Response): Promise<void> => {
        const data: ApproveRequest = req.body.data;
        const chainId = data.chainId;

        if (chainIsSupported(chainId)) {
            console.log("Generate approve calldata...");

            const calldata = await generateApproveCalldata(chainId, data.owner, data.tokens);

            console.log("Approve calldata", calldata);

            res.status(200).send(calldata);
        }
        else
            res.status(500).send(`Unsupported chain id: ${chainId}`);
    }
}


export const operateGenStableCalldata = () => {
    return async (req: Request, res: Response): Promise<void> => {
        const data: StableRequest = req.body.data;
        const chainId = data.chainId;

        if (chainIsSupported(chainId)) {
            if (stargateConfig[chainId].stable) {
                console.log("Generating stable calldata...");

                const calldata = await generateStableCalldata(data);

                console.log("Stable calldata", calldata);

                res.status(200).send(calldata);
            }
            else
                res.status(500).send(`Unsupported chain id: ${chainId}`);
        }           
    }
}