import { Uniswap } from "../dex/uni";
import { Stargate } from "../dex/stargate";
import { PancakeSwap } from "../dex/pancake";
import { PortfolioManager } from "../portfolio";
import { RedisClient } from "../database";
import { Request, Response, NextFunction } from "express";
import { WHITE_LIST, UniswapChainId, PancakeChainId, UniswapChains, PancakeChains } from "../config";
import { OnChainRequest, CrossChainRequest, PortfolioRequest, ChainConstants, PortfolioHistoryRequest } from "../@types";


const getRequestIp = (req: Request): string | undefined => {
    return req.headers['X-Real-IP'] as string || req.socket.remoteAddress;
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

        const portfolioHistory = await redis.getPortfolioHistoryByAddress(data.address, data.chainId);
        
        if (portfolioHistory.length) {
            res.status(200).send(portfolioHistory);
        }
        else {
            const fetchedPortfolioHistory = await portfolioManager.getTotalHistoricalPortfolioValue(data.address, data.chainId);
            await redis.setPortfolioHistoryByAddress(data.address, data.chainId, fetchedPortfolioHistory);
            res.status(200).send(fetchedPortfolioHistory);
        }
    }
}


export const operatePortfolioRequest = (redis: RedisClient, portfolioManager: PortfolioManager) => {
    return async (req: Request, res: Response): Promise<void> => {
        const data: PortfolioRequest = req.body.data;

        const portfolio = await redis.getPortfolioByAddress(data.address);

        if (portfolio.length) {
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

        if (UniswapChainId.includes(data.chainId)) {
            const chain = UniswapChains[data.chainId];
        
            if (chain) {
                const uniswap = new Uniswap(chain);

                const calldata = await uniswap.generateCalldataForOnchainSwap(
                    data.tokenTo, data.tokensFrom, data.recipient
                );

                res.status(200).send(calldata);
            }
            else
                res.status(500).send(`Unsupported chain id: ${data.chainId}`);
        } 
        else 
        if (PancakeChainId.includes(data.chainId)) {
            const chain = PancakeChains[data.chainId];
            
            if (chain && chain.v2subgraphQlUrl && chain.v3subgraphQlUrl) {
                const pancake = new PancakeSwap(chain, chain.v2subgraphQlUrl, chain.v3subgraphQlUrl);

                const calldata = await pancake.generateCalldataForOnchainSwap(
                    data.tokenTo, data.tokensFrom, data.recipient
                );

                res.status(200).send(calldata);
            }
            else
                res.status(500).send(`Unsupported chain id: ${data.chainId}`);
        }
    }
}


export const operateGenCrossChainCalldataRequest = () => {
    return async (req: Request, res: Response): Promise<void> => {
        const data: CrossChainRequest = req.body.data;
        
        let chain: ChainConstants | null = null;
        if (UniswapChainId.includes(data.srcChainId)) {
            chain = UniswapChains[data.srcChainId];
        }
        else
        if (PancakeChainId.includes(data.srcChainId)) {
            chain = PancakeChains[data.srcChainId];
        }

        if (chain) {
            const stargate = new Stargate(chain.rpcUrls.default.http[0]);

            const calldata = await stargate.generateCalldataForCrosschainSwap(
                data.tokenFromId, data.tokenToId, data.recipient, data.srcChainId, data.dstChainId
            );

            if (calldata)
                res.status(200).send(calldata);
            else
                res.status(501).send(`Error generating cross chain calldata`);
        }
        else
            res.status(500).send(`Unsupported chain id: ${data.srcChainId}`);
    }
}