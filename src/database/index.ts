import Redis from 'ioredis';
import { portfolioUpdateTime } from '../config';
import { HexString, Portfolio, PortfolioHistory, PortfolioHistoryKey } from '../@types';


export class RedisClient {
    private redis: Redis;


    constructor() {
        this.redis = new Redis();
    }


    private getTimestamp = (): number => {
        return Date.now() / 1000;
    }


    private hasTimePassed = (updateTime: number): boolean => {
        if (updateTime + portfolioUpdateTime < this.getTimestamp()) return true;
        else return false;
    }


    private getPortfolioHistoryKey = (userAddress: HexString, chainid: number): PortfolioHistoryKey => {
        return `${userAddress}:${chainid}` satisfies PortfolioHistoryKey;
    }


    setPortfolioHistoryByAddress = async (
        userAddress: HexString, 
        chainId: number, 
        portfolioWithoutTimestamp: Omit<PortfolioHistory, "updateTime">
    ): Promise<void> => {
        const key = this.getPortfolioHistoryKey(userAddress, chainId);

        const portfolio: PortfolioHistory = {
            updateTime: this.getTimestamp(),
            ...portfolioWithoutTimestamp
        }
        
        await this.redis.set(key, JSON.stringify(portfolio));
    }


    getPortfolioHistoryByAddress = async (userAddress: HexString, chainId: number): Promise<PortfolioHistory | null> => {
        const key = this.getPortfolioHistoryKey(userAddress, chainId);

        const response = await this.redis.get(key);

        if (response) {
            const portfolioHistory: PortfolioHistory = JSON.parse(response);
            if (this.hasTimePassed(portfolioHistory.updateTime))
                return null;
            else
                return portfolioHistory;
        }
        else return null;
    }


    setPorfolioByAddress = async (userAddress: HexString, networks: Omit<Portfolio, "updateTime">): Promise<void> => {
        const portfolio: Portfolio = {
            updateTime: this.getTimestamp(),
            ...networks
        }

        await this.redis.set(userAddress, JSON.stringify(portfolio));
    }


    getPortfolioByAddress = async (userAddress: HexString): Promise<Portfolio | null> => {
        const response = await this.redis.get(userAddress);

        if (response) {
            const portfolio: Portfolio = JSON.parse(response);
            if (this.hasTimePassed(portfolio.updateTime))
                return null;
            else
                return portfolio;
        }  
        else return null;
    }
}