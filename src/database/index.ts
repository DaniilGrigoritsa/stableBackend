import Redis from 'ioredis';
import { portfolioUpdateTime } from '../config';
import { HexString, Coin, Portfolio, PortfolioHistory, PortfolioHistoryKey } from '../@types';


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


    setPortfolioHistoryByAddress = async (userAddress: HexString, chainId: number, portfolioHistory: number[]) => {
        const portfolio: PortfolioHistory = {
            updateTime: this.getTimestamp(),
            portfolioHistory: portfolioHistory
        }

        const key = this.getPortfolioHistoryKey(userAddress, chainId);
        
        await this.redis.set(key, JSON.stringify(portfolio));
    }


    getPortfolioHistoryByAddress = async (userAddress: HexString, chainId: number): Promise<number[]> => {
        const key = this.getPortfolioHistoryKey(userAddress, chainId);

        const response = await this.redis.get(key);

        if (response) {
            const portfolioHistory: PortfolioHistory = JSON.parse(response);
            if (this.hasTimePassed(portfolioHistory.updateTime))
                return [];
            else
                return portfolioHistory.portfolioHistory;
        }
        else return [];
    }


    setPorfolioByAddress = async (userAddress: HexString, tokens: Coin[][]): Promise<void> => {
        const portfolio: Portfolio = {
            updateTime: this.getTimestamp(),
            tokens: tokens
        }

        await this.redis.set(userAddress, JSON.stringify(portfolio));
    }


    getPortfolioByAddress = async (userAddress: HexString): Promise<Coin[][]> => {
        const response = await this.redis.get(userAddress);

        if (response) {
            const portfolio: Portfolio = JSON.parse(response);
            if (this.hasTimePassed(portfolio.updateTime))
                return [];
            else
                return portfolio.tokens;
        }  
        else return [];
    }
}