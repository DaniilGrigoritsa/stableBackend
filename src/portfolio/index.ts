import Web3 from "web3";
import {
    SushiChains,
    UniswapChains, 
    PancakeChains,
    CovalentChainId,
    ChainbaseChainId,
    CovalentChainIdToString
} from "../config";
import axios, { AxiosResponse } from "axios";
import { objectIsNotNullOrUndefined } from "../utils";
import { CovalentClient, Chains } from "@covalenthq/client-sdk";
import { Coin, HexString, PortfolioHistory, Portfolio, Network } from "../@types";


type ChainbaseResponse = {
    data: {
        balance: HexString
        contract_address: HexString
        current_usd_price: number
        decimals: number
        logos: [{
            uri: string
        }]
        symbol: string
    }[] | null
}


export class PortfolioManager {

    private web3: Web3;
    private page: number = 1;
    private limit: number = 20;
    private covalentKeys: string[];
    private chainBaseKeys: string[];
    private chainbaseUrl: string = "https://api.chainbase.online/v1/account/tokens";


    constructor(
        chainBaseKeys: string[],
        covalentKeys: string[]
    ) {
        this.web3 = new Web3();
        this.chainBaseKeys = chainBaseKeys;
        this.covalentKeys = covalentKeys;
    }


    private prettify = (num: number): number => {
        return Number(num.toFixed(2));
    }


    private getPortfolioChange = (portfolioValues: number[]): string => {
        if (portfolioValues.length) {
            const start = portfolioValues[0];
            const end = portfolioValues[portfolioValues.length - 1];
            if (start === 0 && end === 0) return "0.0";
            else if (start === 0 && end !== 0) return "100";
            else if (start !== 0 && end === 0) return "-100";
            else return ((end / start - 1) * 100).toFixed(2);
        }
        else 
            return "0.0";
    }


    private getTotalPortfolioValue = (portfolioValues: number[]): string => {
        if (portfolioValues.length)
            return portfolioValues[portfolioValues.length - 1].toFixed(2);
        else
            return "0.00";
    }


    getChainbaseTokenList = async (userAddress: HexString, chainId: number, index: number): Promise<Network | null> => {
        const headers = {
            "accept": "application/json",
            "x-api-key": this.chainBaseKeys[index]
        }

        const params = new URLSearchParams({
            chain_id: chainId.toString(),
            address: userAddress,
            limit: this.limit.toString(),
            page: this.page.toString()
        });

        const response: AxiosResponse<ChainbaseResponse> = await axios.get(
            `${this.chainbaseUrl}?${params}`,
            {headers}
        );
    
        if (response.data.data) {

            const tokens = response.data.data.map<Coin>((token) => {
                return ({
                    chainId: chainId,
                    address: token.contract_address,
                    decimals: token.decimals,
                    symbol: token.symbol,
                    balance: this.web3.utils.hexToNumberString(token.balance),
                    iconUrl: token.logos.length ? token.logos[0].uri : "",
                    usdPrice: token.current_usd_price
                });
            });

            const usdBalance = tokens.reduce((accumulator, token) => {
                return accumulator + (token.usdPrice ? token.usdPrice : 0)
            }, 0);

            const network: Network = {
                id: index.toString(),
                chainId: chainId,
                name: {...UniswapChains, ...PancakeChains, ...SushiChains}[chainId].name,
                iconUrl: {...UniswapChains, ...PancakeChains, ...SushiChains}[chainId].iconUrl,
                balance: usdBalance,
                percent: "0",
                tokens: tokens
            }

            return network;
        }
        else 
            return null;
    }


    private getCovalentTokenList = async (userAddress: HexString, chainId: number, index: number): Promise<Network | null> => {
        const client = new CovalentClient(this.covalentKeys[index]);

        const chainString = CovalentChainIdToString[chainId] as Chains;

        const resp = await client.BalanceService.getTokenBalancesForWalletAddress(chainString, userAddress);
        
        if (resp.data) {

            const tokens = resp.data.items
                .filter((item) => !item.native_token)
                .map<Coin>((item) => ({
                    chainId: chainId,
                    address: item.contract_address as HexString,
                    decimals: item.contract_decimals,
                    symbol: item.contract_ticker_symbol,
                    balance: item.balance?.toString(),
                    iconUrl: item.logo_url,
                    usdPrice: item.quote
                }));

            const usdBalance = resp.data.items.reduce((accumulator, token) => {
                return accumulator + token.quote
            }, 0);

            const network: Network = {
                id: index.toString(),
                chainId: chainId,
                name: {...UniswapChains, ...PancakeChains, ...SushiChains}[chainId].name,
                iconUrl: {...UniswapChains, ...PancakeChains, ...SushiChains}[chainId].iconUrl,
                balance: usdBalance,
                percent: "0",
                tokens: tokens
            }

            return network;
        }
        else 
            return null;
    }


    getTotalHistoricalPortfolioValue = async (userAddress: HexString, chainId: number): Promise<Omit<PortfolioHistory, "updateTime">> => {
        const client = new CovalentClient(this.covalentKeys[0]);

        const chainString = CovalentChainIdToString[chainId] as Chains;

        const response = await client.BalanceService.getHistoricalPortfolioForWalletAddress(chainString, userAddress);

        const data = response.data.items.map((item) => {
            const int: number[] = [];
            item.holdings.map((holding) => { 
                int.push(holding.open.quote), int.push(holding.close.quote) 
            });
            return int;
        });
        
        const maxLength = Math.max(...data.map(arr => arr.length));
        const portfolioValues: number[] = new Array(maxLength).fill(0);
        
        data.map((arr) => {
            arr.map((num, i) => portfolioValues[i] += num);
        });

        const portfolioHistory: Omit<PortfolioHistory, "updateTime"> = {
            valueChange: this.getPortfolioChange(portfolioValues),
            totalValue: this.getTotalPortfolioValue(portfolioValues),
            portfolioHistory: portfolioValues.map((value) => this.prettify(value))
        }

        return portfolioHistory;
    }

    getPortfolio = async (userAddress: HexString): Promise<Omit<Portfolio, "updateTime">> => {
        // [...CovalentChainId, ...ChainbaseChainId, ...SushiChains]
        const result = [137].map(async (chainId, index) => {
            try {
                if (CovalentChainId.includes(chainId)) {
                    return await this.getCovalentTokenList(userAddress, chainId, index);
                }
                else
                if (ChainbaseChainId.includes(chainId)) {
                    return await this.getChainbaseTokenList(userAddress, chainId, index);
                }
                else return null;
            }
            catch (err) {
                return null;
            }
        });

        const networks = (await Promise.all(result)).filter(objectIsNotNullOrUndefined<Network>);

        const portfolio: Omit<Portfolio, "updateTime"> = {
            networks: networks
        }

        return portfolio;
    }
}